# Docs Locs – MasterKey (Vite PWA)

Static Vite rebuild of the original PHP app, for demo/hosting on Vercel, Cloudflare Pages or Netlify.

- `npm install` → `npm run dev` (local) → `npm run build` (outputs `dist/`)
- Vercel / Cloudflare Pages settings: framework **Vite**, build command `npm run build`, output dir `dist`
- **Demo mode:** register/login/requests are stored in the browser (localStorage). No database or email server.
  "Email This Request" opens the user's mail app with the request pre-filled to docslocs@gmail.com.
- To go live for real: add a small API (e.g. a Vercel/Cloudflare function + Resend for email, Neon/Supabase for users).
