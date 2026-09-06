# ApexTools (apextools.app) Production Deployment & Operations Runbook

This document serves as the complete operational runbook for deploying, monitoring, and scaling **ApexTools** in a high-traffic production environment.

---

## 1. System Architecture Overview

```
                          [ Internet Traffic / Users ]
                                       │
                                       ▼
                       [ Cloudflare CDN / Edge DNS ]
                                       │
                ┌──────────────────────┴──────────────────────┐
                ▼                                             ▼
     [ Vercel Next.js App Router ]             [ Upstash Redis / BullMQ ]
     - Programmatic SEO Pages                   - Rate Limiting (Token Bucket)
     - Client Converters (WASM/JS)              - Job Queue (BullMQ)
     - Next.js Serverless APIs                  - Forex & Gold Rate Caching
                │                                             │
                ▼                                             ▼
       [ Supabase Cloud ]                          [ Docker Background Worker ]
     - PostgreSQL + Auth                           - Node.js 20 (BullMQ Worker)
     - S3 Storage (conversions)                    - FFmpeg & ffprobe
     - 1-Hour Auto-Purge TTL                       - LibreOffice (Docx/Pdf/Xlsx)
                                                   - Fonts: Noto Sans + Noto Urdu
```

---

## 2. Environment Variables Matrix

Set the following variables in **Vercel** (Frontend) and **Railway / Render / VPS** (Worker):

### 2.1 Frontend (Vercel)
| Variable | Description | Example / Default |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Canonical platform domain | `https://apextools.app` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project API endpoint | `https://your-proj.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase public client key | `eyJhbGci...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase privileged server key | `eyJhbGci...` |
| `UPSTASH_REDIS_REST_URL` | Upstash HTTP Redis URL | `https://your-db.upstash.io` |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash HTTP Auth Token | `AX...` |
| `REDIS_URL` | Direct ioredis connection string | `rediss://default:...@...upstash.io:6379` |
| `NEXT_PUBLIC_ADSENSE_CLIENT_ID`| Google AdSense Publisher ID | `ca-pub-9482019482019482` |
| `ADMIN_EMAILS` | Comma-separated admin whitelist | `admin@apextools.app,muddasir@apextools.app` |

### 2.2 Background Worker (Railway / Render / VPS)
| Variable | Description |
|---|---|
| `REDIS_URL` | Direct connection to BullMQ Redis instance (`rediss://...`) |
| `SUPABASE_URL` | Supabase Project URL for downloading & uploading artifacts |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key for bypass RLS on bucket operations |
| `NODE_ENV` | `production` |

---

## 3. Frontend Deployment (Vercel)

1. Connect the GitHub repository to **Vercel**.
2. Set Framework Preset to **Next.js**.
3. Add all environment variables listed in Section 2.1.
4. Deploy the main branch.
5. In Domains settings, configure `apextools.app` and `www.apextools.app`.

---

## 4. Background Worker Deployment (Docker on Railway or VPS)

### Option A: Railway Deployment
1. Create a new service on Railway.
2. Select **Dockerfile** as the build source and point to `docker/worker.Dockerfile`.
3. Configure the environment variables (`REDIS_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`).
4. Set memory limit to at least **1GB RAM** to ensure LibreOffice and FFmpeg execute smoothly during peak document and media rendering.

### Option B: VPS (Ubuntu 22.04 LTS / Docker Compose)
```bash
# Clone the repository
git clone https://github.com/your-org/apextools.git /opt/apextools
cd /opt/apextools

# Build the worker container
docker build -f docker/worker.Dockerfile -t apextools-worker .

# Run with auto-restart and resource limits
docker run -d \
  --name apextools-worker-01 \
  --restart always \
  --memory=2g \
  --cpus=2 \
  -e REDIS_URL="rediss://default:token@your-redis.upstash.io:6379" \
  -e SUPABASE_URL="https://your-proj.supabase.co" \
  -e SUPABASE_SERVICE_ROLE_KEY="your-service-role-key" \
  apextools-worker
```

---

## 5. Storage Auto-Purge & Retention Verification

ApexTools enforces a strict **1-Hour Auto-Purge Privacy Policy**:
1. Run the Supabase cron / pg_cron job to purge files from the `conversions` bucket older than 60 minutes:
```sql
-- Schedule hourly purge of expired conversion artifacts
SELECT cron.schedule(
  'purge-expired-conversions-hourly',
  '0 * * * *',
  $$
    DELETE FROM storage.objects
    WHERE bucket_id = 'conversions'
      AND created_at < NOW() - INTERVAL '1 hour';
  $$
);
```

---

## 6. Pre-Launch Verification Checklist

- [x] **Protected Admin Console:** Ensure `/admin` requires authenticated session with admin role or whitelisted email in `ADMIN_EMAILS`.
- [x] **Monetization Switchboard:** Verify `/admin/ads` allows live toggling and slot ID updates.
- [x] **Regional Presets:** Verify `/admin/regional-config` persists gold rates and 225 vs 272.25 sqft Marla standards.
- [x] **Multi-Segment Sitemaps:** Verify `/sitemap.xml` generates clean URLs for all 50+ converters, category hubs, and topical guides.
- [x] **Robots.txt:** Confirm `/robots.txt` disallows `/admin/`, `/api/`, `/dashboard/`, `/auth/` while indexing converters and guides.
- [x] **Structured Data Suite:** Verify Google Rich Snippets validity via Schema.org validator for `WebApplication`, `FAQPage`, `HowTo`, and `Article`.
- [x] **Topical Authority Guides:** Confirm `/guides` and all 5 evergreen guides load with interactive conversion widgets.
- [x] **Core Web Vitals & Security:** Confirm CSP headers, X-Frame-Options, async AdSense tags, and GDPR Cookie Consent banner are functioning.
