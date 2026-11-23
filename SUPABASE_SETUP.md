# Supabase setup for Sound Bite Fishing

## 1. Create a Supabase project
Create a project at https://supabase.com and keep the database password private.

## 2. Create the private catch database and photo bucket
In the Supabase project, open **SQL Editor**, create a new query, paste all of `supabase/schema.sql`, and run it. This creates the catches table, enables row-level security, and creates a **private** `catch-photos` storage bucket. The RLS policies ensure each signed-in user can only read, add, update, and delete their own records and photos.

## 3. Enable Google sign-in
In Supabase, open **Authentication → Providers → Google** and enable Google. Create a Google OAuth client in Google Cloud Console. Add the Google Client ID and Client Secret to the Supabase Google provider settings.

In **Authentication → URL Configuration**:
- Set Site URL to your deployed site URL, for example `https://sound-bite-fishing.vercel.app`.
- Add Redirect URL `https://YOUR-SUPABASE-PROJECT-REF.supabase.co/auth/v1/callback` in the Google OAuth client's authorized redirect URIs.
- Add `https://sound-bite-fishing.vercel.app/auth/callback` to Supabase's allowed redirect URLs.
- During local development, also allow `http://localhost:3000/auth/callback`.

## 4. Add environment variables in Vercel
In Vercel → your Sound Bite project → Settings → Environment Variables, add:
- `NEXT_PUBLIC_SUPABASE_URL`: Project URL from Supabase → Project Settings → API.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Publishable/anon key from Supabase → Project Settings → API.

Add them for Production, Preview, and Development as appropriate, then redeploy. Never put the Supabase service-role key in browser code or commit secrets to GitHub.

## 5. Test privacy
Sign in with Google, add a test catch and photo, then sign out. Sign in with a different Google account and confirm the first account's catch does not appear. The database and Storage RLS policies enforce this separation server-side; hiding records in the interface is not the security boundary.

## Routes
- `/login`: Google sign-in
- `/catches`: private catch journal and personal stats
- `/auth/callback`: OAuth session callback
- `/`: existing fishing conditions planner
