"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

// Sends logged-in users to /myclass. Returns true while the session is still being checked,
// so the page can render nothing instead of flickering before the redirect.
export function useRedirectIfLoggedIn() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        router.push("/myclass");
        return;
      }
      setChecking(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) router.push("/myclass");
    });

    return () => listener.subscription.unsubscribe();
  }, [router]);

  return checking;
}

// Open/close state for the mobile menu: locks page scroll while open, closes on Escape,
// and closes when the screen grows past the mobile breakpoint.
export function useMobileMenu() {
  const [menuOpen, setMenuOpen] = useState(false);

  // Lock page scroll while the mobile menu is open; close it with Escape.
  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  // Close the mobile menu if the screen grows past the mobile breakpoint.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = (e) => e.matches && setMenuOpen(false);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return [menuOpen, setMenuOpen];
}

// Adds .is-in to every [data-reveal] element once it scrolls into view (see animations.css).
// Pass `ready` = false while the page renders nothing, so it starts once content exists.
export function useScrollReveal(ready) {
  useEffect(() => {
    if (!ready) return;
    const els = document.querySelectorAll("[data-reveal]");
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.1 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [ready]);
}
