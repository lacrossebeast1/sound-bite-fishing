"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";

type CatchRow = {
  id: string; species: string; caught_at: string; location: string; lure: string;
  weather: string; tide_conditions: string; notes: string | null; photo_path: string | null;
  photoUrl?: string | null;
};

export default function CatchesPage() {
  const router = useRouter();
  const [supabase, setSupabase] = useState<ReturnType<typeof createClient> | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [rows, setRows] = useState<CatchRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [species, setSpecies] = useState("");
  const [caughtAt, setCaughtAt] = useState(new Date().toISOString().slice(0,16));
  const [location, setLocation] = useState("Westport, CT");
  const [lure, setLure] = useState("");
  const [weather, setWeather] = useState("");
  const [tide, setTide] = useState("");
  const [notes, setNotes] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);

  async function load(client: ReturnType<typeof createClient>) {
    setLoading(true); setError("");
    const { data: { user }, error: userError } = await client.auth.getUser();
    if (userError || !user) { router.replace("/login"); return; }
    setUserEmail(user.email || "");
    const { data, error: listError } = await client.from("catches").select("*").order("caught_at", { ascending: false });
    if (listError) { setError(listError.message); setLoading(false); return; }
    const withPhotos = await Promise.all((data || []).map(async (row: CatchRow) => {
      if (!row.photo_path) return row;
      const { data: signed } = await client.storage.from("catch-photos").createSignedUrl(row.photo_path, 60 * 30);
      return { ...row, photoUrl: signed?.signedUrl || null };
    }));
    setRows(withPhotos); setLoading(false);
  }
  useEffect(() => {
    try {
      const client = createClient();
      setSupabase(client);
      void load(client);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Supabase is not configured.");
      setLoading(false);
    }
  }, []);

  const stats = useMemo(() => ({
    total: rows.length,
    species: new Set(rows.map(r => r.species.trim().toLowerCase()).filter(Boolean)).size,
    top: Object.entries(rows.reduce<Record<string, number>>((a, r) => { a[r.species] = (a[r.species] || 0) + 1; return a; }, {})).sort((a,b) => b[1]-a[1])[0]
  }), [rows]);

  async function addCatch(event: FormEvent) {
    event.preventDefault(); setSaving(true); setError("");
    try {
      if (!supabase) throw new Error("Supabase is not configured. Add the Supabase environment variables in Vercel.");
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Please sign in again.");
      let photoPath: string | null = null;
      if (photo) {
        if (!photo.type.startsWith("image/")) throw new Error("Please choose an image file.");
        if (photo.size > 8 * 1024 * 1024) throw new Error("Photos must be 8 MB or smaller.");
        const ext = photo.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
        photoPath = `${user.id}/${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage.from("catch-photos").upload(photoPath, photo, { contentType: photo.type, upsert: false });
        if (uploadError) throw uploadError;
      }
      const { error: insertError } = await supabase.from("catches").insert({
        user_id: user.id, species: species.trim(), caught_at: new Date(caughtAt).toISOString(),
        location: location.trim(), lure: lure.trim(), weather: weather.trim(),
        tide_conditions: tide.trim(), notes: notes.trim() || null, photo_path: photoPath
      });
      if (insertError) {
        if (photoPath) await supabase.storage.from("catch-photos").remove([photoPath]);
        throw insertError;
      }
      setSpecies(""); setLure(""); setWeather(""); setTide(""); setNotes(""); setPhoto(null);
      const fileInput = document.getElementById("catch-photo") as HTMLInputElement | null;
      if (fileInput) fileInput.value = "";
      await load(supabase);
    } catch (e) { setError(e instanceof Error ? e.message : "Could not save catch."); }
    finally { setSaving(false); }
  }

  async function deleteCatch(row: CatchRow) {
    if (!window.confirm("Delete this catch from your private log?")) return;
    if (!supabase) return;
    setError("");
    if (row.photo_path) await supabase.storage.from("catch-photos").remove([row.photo_path]);
    const { error } = await supabase.from("catches").delete().eq("id", row.id);
    if (error) setError(error.message); else if (supabase) await load(supabase);
  }

  async function signOut() { if (!supabase) return; await supabase.auth.signOut(); router.replace("/"); router.refresh(); }

  return <main className="journalPage">
    <header className="journalHeader"><a className="brand" href="/">Sound <span>Bite</span></a><nav><a href="/">Fishing planner</a><span>{userEmail}</span><button onClick={signOut}>Sign out</button></nav></header>
    <div className="journalWrap">
      <div className="journalIntro"><div><div className="kicker">YOUR PRIVATE FISHING JOURNAL</div><h1>My catches</h1><p>Keep track of what you catch and what conditions were working.</p></div><a className="outlineButton" href="#add-catch">+ Log a catch</a></div>
      <div className="catchStats"><div><small>Total catches</small><strong>{stats.total}</strong></div><div><small>Different species</small><strong>{stats.species}</strong></div><div><small>Most caught</small><strong>{stats.top ? `${stats.top[0]} · ${stats.top[1]}` : "—"}</strong></div></div>
      <section className="catchForm" id="add-catch"><h2>Log a new catch</h2><form onSubmit={addCatch}>
        <div className="formGrid">
          <label>Species *<input required value={species} onChange={e=>setSpecies(e.target.value)} placeholder="e.g. Striped bass"/></label>
          <label>Date and time *<input required type="datetime-local" value={caughtAt} onChange={e=>setCaughtAt(e.target.value)}/></label>
          <label>Location *<input required value={location} onChange={e=>setLocation(e.target.value)} placeholder="Where did you catch it?"/></label>
          <label>Lure or bait<input value={lure} onChange={e=>setLure(e.target.value)} placeholder="e.g. 6-inch Z-Man fluke"/></label>
          <label>Weather<input value={weather} onChange={e=>setWeather(e.target.value)} placeholder="Wind, temperature, sky…"/></label>
          <label>Tide conditions<input value={tide} onChange={e=>setTide(e.target.value)} placeholder="Incoming, outgoing, high, low…"/></label>
          <label className="wideField">Photo (optional, max 8 MB)<input id="catch-photo" type="file" accept="image/*" onChange={e=>setPhoto(e.target.files?.[0] || null)}/></label>
          <label className="wideField">Notes<textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="What worked? Any details to remember?"/></label>
        </div>
        {error && <p className="formError">{error}</p>}
        <button className="saveButton" disabled={saving}>{saving ? "Saving catch…" : "Save catch"}</button>
      </form></section>
      <section className="catchList"><div className="sectionHeading"><h2>Catch history</h2><span>{rows.length} saved</span></div>
        {loading ? <p className="emptyState">Loading your catches…</p> : rows.length === 0 ? <p className="emptyState">No catches logged yet. Add your first catch above.</p> :
          <div className="catchGrid">{rows.map(row=><article className="catchCard" key={row.id}>
            {row.photoUrl ? <img src={row.photoUrl} alt={row.species} className="catchPhoto"/> : <div className="photoPlaceholder">🎣</div>}
            <div className="catchCardBody"><div className="catchCardTitle"><h3>{row.species}</h3><button onClick={()=>deleteCatch(row)} aria-label={`Delete ${row.species}`}>Delete</button></div>
              <small>{new Date(row.caught_at).toLocaleString()}</small><p>📍 {row.location}</p>
              {row.lure && <p>🪝 {row.lure}</p>}{row.weather && <p>💨 {row.weather}</p>}{row.tide_conditions && <p>🌊 {row.tide_conditions}</p>}
              {row.notes && <p className="catchNotes">{row.notes}</p>}
            </div></article>)}</div>}
      </section>
    </div>
  </main>;
}
