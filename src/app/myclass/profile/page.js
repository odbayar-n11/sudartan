"use client";

import { useEffect, useRef, useState } from "react";
import AppShell from "../components/AppShell";
import { supabase } from "../../../lib/supabase";
import "./profile.css";

const MAX_SIZE = 2 * 1024 * 1024; // 2 MB

const icon = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
};

function CameraIcon() {
  return (
    <svg {...icon}>
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg {...icon}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg {...icon}>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-10 6L2 7" />
    </svg>
  );
}

export default function ProfilePage() {
  const fileRef = useRef(null);

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // values currently saved in Supabase
  const [saved, setSaved] = useState({ username: "", email: "" });
  const [pendingEmail, setPendingEmail] = useState("");

  // form values
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [imgBroken, setImgBroken] = useState(false);

  const [msg, setMsg] = useState({ type: "", text: "" });

  // Load current user + profile
  useEffect(() => {
    async function load() {
      const { data } = await supabase.auth.getUser();
      const u = data?.user;
      if (!u) {
        setLoading(false);
        return;
      }
      setUser(u);
      setPendingEmail(u.new_email || "");

      const { data: p } = await supabase
        .from("profiles")
        .select("username, avatar_url")
        .eq("id", u.id)
        .single();

      const name = p?.username || "";
      setSaved({ username: name, email: u.email || "" });
      setUsername(name);
      setEmail(u.email || "");
      setAvatarUrl(p?.avatar_url || "");
      setLoading(false);
    }
    load();
  }, []);

  // Free the temporary preview URL when it changes
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const dirty =
    !!file ||
    username.trim() !== saved.username ||
    email.trim() !== saved.email;

  function onPickFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;

    if (!f.type.startsWith("image/")) {
      setMsg({ type: "error", text: "Зөвхөн зураг сонгоно уу." });
      return;
    }
    if (f.size > MAX_SIZE) {
      setMsg({ type: "error", text: "Зураг 2MB-аас бага байх ёстой." });
      return;
    }

    setMsg({ type: "", text: "" });
    setImgBroken(false);
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  function handleReset() {
    setUsername(saved.username);
    setEmail(saved.email);
    setFile(null);
    setPreview("");
    setMsg({ type: "", text: "" });
    if (fileRef.current) fileRef.current.value = "";
  }

  async function uploadAvatar(f, userId) {
    // One fixed path per user, so the old picture is replaced, not piled up
    const path = `${userId}/avatar`;

    const { error: upErr } = await supabase.storage
      .from("avatars")
      .upload(path, f, { upsert: true, contentType: f.type });
    if (upErr) throw upErr;

    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    // timestamp so the browser doesn't show the cached old image
    return `${data.publicUrl}?t=${Date.now()}`;
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!user || !dirty) return;

    const cleanName = username.trim();
    const cleanEmail = email.trim();

    if (cleanName.length < 3) {
      setMsg({ type: "error", text: "Нэр хамгийн багадаа 3 тэмдэгт байна." });
      return;
    }

    setSaving(true);
    setMsg({ type: "", text: "" });

    try {
      // 1. Avatar
      let newAvatar = avatarUrl;
      if (file) {
        newAvatar = await uploadAvatar(file, user.id);
      }

      // 2. Username + avatar in the profiles table
      const { data: updated, error: profErr } = await supabase
        .from("profiles")
        .update({ username: cleanName, avatar_url: newAvatar })
        .eq("id", user.id)
        .select();

      if (profErr) {
        if (profErr.code === "23505") {
          throw new Error("Энэ нэр аль хэдийн авсан байна.");
        }
        throw profErr;
      }
      // RLS blocks silently: no error, but also no rows changed
      if (!updated || updated.length === 0) {
        throw new Error(
          "Профайл хадгалагдсангүй. Supabase дээр UPDATE policy шалгана уу."
        );
      }

      setAvatarUrl(newAvatar);
      setImgBroken(false);
      setFile(null);
      setPreview("");
      setUsername(cleanName);
      setSaved((s) => ({ ...s, username: cleanName }));
      if (fileRef.current) fileRef.current.value = "";

      // 3. Email (needs confirmation from the inbox)
      let text = "Өөрчлөлт хадгалагдлаа.";
      if (cleanEmail && cleanEmail !== user.email) {
        const { error: mailErr } = await supabase.auth.updateUser({
          email: cleanEmail,
        });
        if (mailErr) throw mailErr;
        setPendingEmail(cleanEmail);
        setEmail(saved.email); // the old email stays until confirmed
        text = "Хадгаллаа. Шинэ имэйл рүү баталгаажуулах холбоос илгээлээ.";
      }

      // Tell AppShell to refresh the name + avatar in the sidebar
      window.dispatchEvent(new Event("profile-updated"));
      setMsg({ type: "ok", text });
    } catch (err) {
      console.error(err);
      setMsg({
        type: "error",
        text: err.message || "Алдаа гарлаа. Дахин оролдоно уу.",
      });
    } finally {
      setSaving(false);
    }
  }

  const shown = preview || avatarUrl;
  const initial = (saved.username || saved.email || "?").charAt(0).toUpperCase();

  return (
    <AppShell>
      <div className="pf">
        <header className="pf-top">
          <h1>Профайл засах</h1>
          <p>Зураг, нэр, имэйлээ эндээс шинэчилнэ.</p>
        </header>

        {loading ? (
          <div className="pf-card pf-skeleton" aria-busy="true" />
        ) : !user ? (
          <p className="pf-note">Нэвтэрч орно уу.</p>
        ) : (
          <form className="pf-card" onSubmit={handleSave}>
            <div className="pf-banner" aria-hidden />

            <div className="pf-head">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={onPickFile}
                hidden
              />

              <button
                type="button"
                className="pf-avatar"
                onClick={() => fileRef.current?.click()}
                aria-label="Профайл зураг солих"
              >
                {shown && !imgBroken ? (
                  <img
                    src={shown}
                    alt=""
                    onError={() => setImgBroken(true)}
                  />
                ) : (
                  <span>{initial}</span>
                )}
                <span className="pf-cam" aria-hidden>
                  <CameraIcon />
                </span>
              </button>

              <div className="pf-who">
                <h2>{saved.username || "Хэрэглэгч"}</h2>
                <p>{saved.email}</p>
                {file ? (
                  <p className="pf-tag">Шинэ зураг сонгосон. Хадгалахад солигдоно.</p>
                ) : imgBroken ? (
                  <p className="pf-tag warn">
                    Хадгалсан зураг ачаалагдсангүй. Bucket public эсэхийг шалгана уу.
                  </p>
                ) : (
                  <p className="pf-tag">JPG, PNG эсвэл WebP, 2MB хүртэл.</p>
                )}
              </div>
            </div>

            <div className="pf-body">
              <label className="pf-field">
                <span className="pf-label">
                  Хэрэглэгчийн нэр
                  <small>{username.length}/30</small>
                </span>
                <span className="pf-input">
                  <UserIcon />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    maxLength={30}
                    required
                  />
                </span>
              </label>

              <label className="pf-field">
                <span className="pf-label">Имэйл</span>
                <span className="pf-input">
                  <MailIcon />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </span>
                {pendingEmail && (
                  <span className="pf-pending">
                    {pendingEmail} хаягийг баталгаажуулахыг хүлээж байна.
                  </span>
                )}
              </label>
            </div>

            <div className="pf-foot">
              <div className={`pf-msg ${msg.type}`} role="status">
                {msg.text}
              </div>
              <button
                type="button"
                className="pf-btn ghost"
                onClick={handleReset}
                disabled={!dirty || saving}
              >
                Цуцлах
              </button>
              <button
                type="submit"
                className="pf-btn"
                disabled={!dirty || saving}
              >
                {saving ? "Хадгалж байна..." : "Хадгалах"}
              </button>
            </div>
          </form>
        )}
      </div>
    </AppShell>
  );
}