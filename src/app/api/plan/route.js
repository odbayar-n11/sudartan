import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const MODEL = "claude-sonnet-5-5"; // cheaper and faster: "claude-haiku-5-5"
const MAX_SCORE = 800; // the highest possible score in your app
const COOLDOWN_MINUTES = 10; // how often one user may generate a new plan

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

const TYPES = ["ancient", "grammar", "idioms", "script", "literary", "quiz"];

const SYSTEM = `You are a study coach inside "Судартан", an app for learning the Mongolian language.
The app has these sections (use these exact values for "type"):
- ancient: ancient Mongolian words
- grammar: Mongolian grammar
- idioms: idioms and set phrases
- script: traditional Mongolian script words
- literary: literary devices and examples
- quiz: practice quizzes

Create a personalized 4-week study plan from the learner's score.
A low score means fundamentals and short tasks. A high score means harder material, more quizzes and revision.
Write every text value in Mongolian (Cyrillic).

Respond with ONLY valid JSON, no markdown and no extra text, in exactly this shape:
{
  "level": "short level name, for example Эхлэгч, Дунд, Ахисан",
  "summary": "1-2 sentences about the learner's level and the plan's focus",
  "weeks": [
    {
      "title": "short week title",
      "goal": "one sentence goal for the week",
      "tasks": [
        { "type": "one of the section values", "title": "specific task", "minutes": 15 }
      ]
    }
  ]
}
Rules: exactly 4 weeks, 3 to 4 tasks per week, minutes between 5 and 40.`;

// Reads the Supabase login token sent by the browser and checks who the user is
async function getUserContext(request) {
  const header = request.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return null;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  );

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) return null;
  return { supabase, user: data.user };
}

async function readScore(supabase, userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("score")
    .eq("id", userId)
    .single();
  if (error) throw error;
  return data?.score ?? 0;
}

function parsePlan(text) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("AI JSON буцаасангүй.");

  const plan = JSON.parse(text.slice(start, end + 1));
  if (!Array.isArray(plan.weeks) || plan.weeks.length === 0) {
    throw new Error("Төлөвлөгөөний бүтэц буруу байна.");
  }

  // Keep only what the UI understands
  plan.weeks = plan.weeks.slice(0, 4).map((w) => ({
    title: String(w.title || ""),
    goal: String(w.goal || ""),
    tasks: (Array.isArray(w.tasks) ? w.tasks : []).slice(0, 5).map((t) => ({
      type: TYPES.includes(t.type) ? t.type : "quiz",
      title: String(t.title || ""),
      minutes: Math.min(Math.max(Number(t.minutes) || 15, 5), 40),
    })),
  }));
  plan.level = String(plan.level || "");
  plan.summary = String(plan.summary || "");
  return plan;
}

// Gemini (Google AI Studio key)
async function generateWithGemini(userText) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": process.env.GEMINI_API_KEY,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM }] },
        contents: [{ role: "user", parts: [{ text: userText }] }],
        generationConfig: {
          responseMimeType: "application/json",
          maxOutputTokens: 4096,
        },
      }),
    }
  );

  if (!res.ok) {
    // This shows the real reason in the terminal running `npm run dev`
    throw new Error(`Gemini ${res.status}: ${await res.text()}`);
  }

  const json = await res.json();
  const parts = json?.candidates?.[0]?.content?.parts || [];
  return parts.map((p) => p.text || "").join("");
}

// Claude (Anthropic API key)
async function generateWithClaude(userText) {
  const anthropic = new Anthropic(); // reads ANTHROPIC_API_KEY automatically
  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 2500,
    system: SYSTEM,
    messages: [{ role: "user", content: userText }],
  });
  return message.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("");
}

function generateText(userText) {
  return process.env.GEMINI_API_KEY
    ? generateWithGemini(userText)
    : generateWithClaude(userText);
}

// GET: return the user's score and their latest saved plan (no AI cost)
export async function GET(request) {
  const ctx = await getUserContext(request);
  if (!ctx) {
    return NextResponse.json({ error: "Нэвтэрч орно уу." }, { status: 401 });
  }
  const { supabase, user } = ctx;

  try {
    const score = await readScore(supabase, user.id);

    const { data: last } = await supabase
      .from("study_plans")
      .select("plan, score, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    return NextResponse.json({
      score,
      maxScore: MAX_SCORE,
      plan: last?.plan ?? null,
      planScore: last?.score ?? null,
      createdAt: last?.created_at ?? null,
    });
  } catch (err) {
    console.error(err);
    const missingColumn = err?.code === "42703";
    return NextResponse.json(
      {
        error: missingColumn
          ? "profiles хүснэгтэд score багана алга. plan.sql-ийг ажиллуулна уу."
          : "Мэдээлэл унших үед алдаа гарлаа.",
      },
      { status: 500 }
    );
  }
}

// POST: ask Claude for a new plan and save it
export async function POST(request) {
  const ctx = await getUserContext(request);
  if (!ctx) {
    return NextResponse.json({ error: "Нэвтэрч орно уу." }, { status: 401 });
  }
  const { supabase, user } = ctx;

  if (!process.env.GEMINI_API_KEY && !process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY эсвэл ANTHROPIC_API_KEY тохируулаагүй байна." },
      { status: 500 }
    );
  }

  try {
    // The score the user typed (validated), or the saved one if none was sent
    const body = await request.json().catch(() => ({}));
    let score;
    if (body.score !== undefined && body.score !== null && body.score !== "") {
      score = Number(body.score);
      if (!Number.isInteger(score) || score < 0 || score > MAX_SCORE) {
        return NextResponse.json(
          { error: `Оноо 0-${MAX_SCORE} хооронд бүхэл тоо байх ёстой.` },
          { status: 400 }
        );
      }
    } else {
      score = await readScore(supabase, user.id);
    }

    // Limit how often one user can spend your API credits
    const { data: last } = await supabase
      .from("study_plans")
      .select("created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (last) {
      const minutes = (Date.now() - new Date(last.created_at).getTime()) / 60000;
      if (minutes < COOLDOWN_MINUTES) {
        const wait = Math.ceil(COOLDOWN_MINUTES - minutes);
        return NextResponse.json(
          { error: `Шинэ төлөвлөгөөг ${wait} минутын дараа үүсгэж болно.` },
          { status: 429 }
        );
      }
    }

    const text = await generateText(
      `Learner score: ${score} out of ${MAX_SCORE}. Create the 4-week plan.`
    );
    const plan = parsePlan(text);

    const { data: saved, error: saveErr } = await supabase
      .from("study_plans")
      .insert({ user_id: user.id, score, plan })
      .select("created_at")
      .single();
    if (saveErr) throw saveErr;

    // Remember the score for next time (not critical, so errors are ignored)
    await supabase.from("profiles").update({ score }).eq("id", user.id);

    return NextResponse.json({
      score,
      maxScore: MAX_SCORE,
      plan,
      planScore: score,
      createdAt: saved.created_at,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Төлөвлөгөө үүсгэх үед алдаа гарлаа. Дахин оролдоно уу." },
      { status: 500 }
    );
  }
}