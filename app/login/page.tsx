"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "../../lib/supabase/client";

export default function LoginPage() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const params = useSearchParams();
  async function signIn() {
    setBusy(true); setError("");
    try {
      const supabase = createClient();
      const next = params.get("next") || "/catches";
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` }
      });
      if (error) throw error;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to start Google sign-in.");
      setBusy(false);
    }
  }
  return <main className="authPage"><section className="authCard">
    <a className="backLink" href="/">← Back to fishing planner</a>
    <div className="kicker">SOUND BITE • YOUR FISHING JOURNAL</div>
    <h1>Sign in to <span>Sound Bite</span></h1>
    <p>Your catches, photos, and fishing stats stay private to your account.</p>
    <button className="googleButton" onClick={signIn} disabled={busy}>{busy ? "Connecting…" : "Continue with Google"}</button>
    {error && <p className="authError">{error}</p>}
    {params.get("error") === "oauth" && <p className="authError">Google sign-in could not be completed. Check your Supabase OAuth settings.</p>}
    <small>By signing in, you agree to use your account responsibly. Your catch records are private by default.</small>
  </section></main>;
}
