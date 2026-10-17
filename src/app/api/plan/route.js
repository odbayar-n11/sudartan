// File location: src/app/api/plan/route.js  (plain JavaScript: no TypeScript type annotations!)
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const MODEL = "claude-sonnet-5-5"; // cheaper and faster: "claude-haiku-5-5"
const MAX_SCORE = 800; // the highest possible score in your app
const COOLDOWN_MINUTES = 10; // how often one user may generate a new plan

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.8-flash";

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

// Gemini (Google AI Studio key). Retries on temporary errors (overload, rate limit).
const RETRY_STATUSES = [429, 500, 502, 503, 504];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function generateWithGemini(userText) {
  const MAX_ATTEMPTS = 3;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
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
            maxOutputTokens: 8192,
          },
        }),
      }
    );

    if (res.ok) {
      const json = await res.json();
      const candidate = json?.candidates?.[0];
      if (candidate?.finishReason === "MAX_TOKENS") {
        throw new Error("Gemini хариу дундаа тасарлаа (MAX_TOKENS).");
      }
      const parts = candidate?.content?.parts || [];
      return parts.map((p) => p.text || "").join("");
    }

    const errText = await res.text();
    const retryable = RETRY_STATUSES.includes(res.status);
    if (retryable && attempt < MAX_ATTEMPTS) {
      console.warn(`Gemini ${res.status}, retry ${attempt}/${MAX_ATTEMPTS - 1}...`);
      await sleep(attempt * 2000); // 2s, then 4s
      continue;
    }
    // Real reason shows in the terminal running `npm run dev`
    throw new Error(`Gemini ${res.status}: ${errText}`);
  }
}

// Claude (Anthropic API key)
async function generateWithClaude(userText) {
  const anthropic = new Anthropic(); // reads ANTHROPIC_API_KEY automatically
  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 3000,
    system: SYSTEM,
    messages: [{ role: "user", content: userText }],
  });
  if (message.stop_reason === "max_tokens") {
    throw new Error("Claude хариу дундаа тасарлаа (max_tokens).");
  }
  return message.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("");
}

async function generateText(userText) {
  if (process.env.GEMINI_API_KEY) {
    try {
      return await generateWithGemini(userText);
    } catch (err) {
      if (process.env.ANTHROPIC_API_KEY) {
        console.error("Gemini failed, falling back to Claude:", err.message);
        return generateWithClaude(userText);
      }
      throw err;
    }
  }
  return generateWithClaude(userText);
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

// POST: ask the AI for a new plan and save it
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
    const msg = String(err?.message || "");
    const overloaded = /\b(503|429|529)\b/.test(msg);
    const body = {
      error: overloaded
        ? "AI одоогоор ачаалалтай байна. Хэдэн минутын дараа дахин оролдоно уу."
        : "Төлөвлөгөө үүсгэх үед алдаа гарлаа. Дахин оролдоно уу.",
    };
    // In development, also return the real reason so it's visible in the browser
    if (process.env.NODE_ENV !== "production") {
      body.detail = err?.message || String(err);
    }
    return NextResponse.json(body, { status: overloaded ? 503 : 500 });
  }
}