# ighconnect-dispatch

Dispatch and Administrator web portals for **IGH Connect**. Connects to the IGH Connect API on Railway.

## Portals

| URL | Purpose |
|-----|---------|
| `/login` | Choose Dispatch or Administrator |
| `/login/dispatch` | Bookings + live operations map |
| `/login/administrator` | Driver verification + system tools |

Demo login (after API seed): `admin@ighconnect.com` / `Admin123!`

## Local development

```bash
npm install
cp .env.example .env.local
# Edit NEXT_PUBLIC_API_URL / NEXT_PUBLIC_WS_URL to your Railway API URL
npm run dev
```

Open http://localhost:3000

## Railway deployment

1. Push this repo to GitHub (`ighconnect-dispatch`).
2. Railway → **New Project** → **Deploy from GitHub** → select `ighconnect-dispatch`.
3. **Do not** attach the API volume — this service is Next.js only.
4. Set variables (see `railway.env.example`):
   - `NEXT_PUBLIC_API_URL` — your `igh-connect` API HTTPS URL
   - `NEXT_PUBLIC_WS_URL` — same URL
5. Deploy. Copy the public HTTPS URL (e.g. `https://ighconnect-dispatch.up.railway.app`).
6. On the **API** Railway service, add that URL to `CORS_ORIGINS` (comma-separated), e.g.  
   `https://ighconnect-dispatch.up.railway.app,http://localhost:3000`

Full guide: [docs/RAILWAY_DISPATCH.md](docs/RAILWAY_DISPATCH.md) in the main `igh-connect` repo, or see your team wiki.

## Sync from monorepo

The canonical UI source is `apps/web-admin` in [igh-connect](https://github.com/graysonforeman-svg/igh-connect). To refresh this repo:

```powershell
cd path\to\igh-connect
.\scripts\sync-dispatch-repo.ps1 -TargetPath "..\ighconnect-dispatch"
```
