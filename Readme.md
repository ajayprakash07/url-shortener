# ⚡ High-Performance URL Shortener Engine

> A production-grade, distributed URL shortening service built with **TypeScript**, **Node.js**, **PostgreSQL (Prisma 7)**, and **Upstash Redis**.
> 
> *Developed as a deep-dive learning project right after picking up TypeScript to explore real-world system design, cryptographic authentication, and multi-tier caching architectures.*

---

## 📌 Why This Project?

While a URL shortener is a classic backend project, building it with **production engineering constraints** rather than simple tutorial boilerplate transformed it into a masterclass in:
- Moving beyond basic CRUD to **pure mathematical algorithms** (Base62 bijective encoding).
- Solving the **write-heavy bottleneck** using the **Cache-Aside** and **Write-Behind** patterns.
- Structuring strict, enterprise-ready **Layered Architecture** in modern TypeScript.
- Implementing zero-leakage **Dual-Token JWT Security**.

---

## 🏗️ System Architecture & Engineering Highlights

```
[ Client ] 
   │
   ▼
[ Express Router ] ── (verifyJWT Middleware)
   │
   ▼
[ URL Controller ]
   │
   ├──► 1. Check Upstash Redis Cache ──────► [ CACHE HIT ] ──► Instant 302 Redirect
   │                                                              (Sync visits in batches)
   │
   └──► 2. [ CACHE MISS ] ──► PostgreSQL (Prisma 7) 
                                 │
                                 └── If visit > 10 ──► Cache to Redis for 20m
```

### 1. Pure Bijective Base62 Math (Zero Collisions)
* **Design Decision:** Instead of hashing strings (e.g., MD5/SHA256) and dealing with database collision retries, URLs are mapped bijectively from database auto-incrementing integer IDs.
* **Storage Optimization:** Database only stores the integer ID; short codes are derived mathematically on the fly, eliminating index bloat on short-code strings.
* **Predictability Offset:** Applied a base offset (`15,000,000`) so all issued short codes are immediately $\ge 5$ characters in length.

### 2. Multi-Tier Caching (Cache-Aside + Write-Behind)
* **The Problem:** In naive implementations, updating the `visit` counter on every click hits PostgreSQL, causing row-locking contention and connection pool exhaustion.
* **The Solution:** 
  * High-traffic URLs ($>10$ clicks) are cached in **Upstash Redis** with TTL expiration.
  * Visits are incremented in **RAM ($0.1\text{ms}$)** using Redis `INCR`.
  * **Threshold Sync:** Clicks are batched and flushed to PostgreSQL in bulk once 5 visits accumulate, reducing database write-load by **80%**.

### 3. Production Dual-Token Authentication
* **Access Tokens (15m):** Stateless JWTs passed in headers for high-speed route authorization without database roundtrips.
* **Refresh Tokens (7d):** Long-lived tokens stored in PostgreSQL and delivered via secure `httpOnly` cookies, preventing XSS-based token theft and enabling remote session revocation.
* **Password Security:** Salted and hashed using `bcrypt` (10 salt rounds).

---

## 🛠️ Tech Stack & Tooling

| Component | Technology | Rationale |
| :--- | :--- | :--- |
| **Language** | TypeScript (ESNext / NodeNext) | Strict type safety, clean interfaces, and modern ESM imports. |
| **Server** | Express.js | Modular router, custom middleware pipeline. |
| **Database** | PostgreSQL | Relational integrity, ACID compliance, and Foreign Key cascades. |
| **ORM** | Prisma 7.10 | Rust-free driver adapters (`@prisma/adapter-pg`) with strict schema migrations. |
| **Cache** | Upstash Redis | Low-latency in-memory data store for link caching and rate limiting. |
| **Security** | JWT & Bcrypt | Stateless access tokens with secure refresh token rotation. |

---

## 📂 Project Structure (Layered Architecture)

```text
src/
├── controllers/          # Business logic (URL shortener, auth controllers)
├── middleware/           # verifyJWT, error handling, auth guards
├── routes/               # Express routing tables (control, auth)
├── utils/                # Reusable production utils (ApiError, ApiResponse, asyncHandler)
├── converter.ts          # Pure Base62 encoding/decoding mathematical algorithms
├── db.ts                 # Prisma & Redis client singletons
├── index.ts              # Express app setup, CORS, static public directory
└── main.ts               # Server startup & database health check probe
```

---

## 🚀 Key Lessons & Takeaways

1. **TypeScript ESM Quirks (`.js` in `.ts` imports):** Learned why modern TypeScript with `"module": "nodenext"` requires runtime `.js` extension declarations because `tsc` intentionally preserves import specifiers.
2. **Prisma 7 Architectural Shifts:** Mastered the decoupling of `schema.prisma` from `prisma.config.ts`, and initializing runtime JavaScript driver adapters (`PrismaPg`).
3. **The Double-Response Trap:** Diagnosed and fixed the `ERR_HTTP_HEADERS_SENT` issue when executing both `res.redirect()` and `res.json()`.
4. **Race Conditions in Counters:** Implemented Prisma's atomic `{ increment: 1 }` to prevent lost updates under concurrent clicks.

---

## 🚦 Getting Started

### 1. Clone & Install
```bash
git clone <repo-url>
cd url-shortener
npm install
```

### 2. Configure Environment (`.env`)
```env
PORT=8000
DATABASE_URL=postgres://user:password@host:5432/postgres?sslmode=require
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
ACCESS_TOKEN_SECRET=your_access_secret
REFRESH_TOKEN_SECRET=your_refresh_secret
```

### 3. Run Migrations & Start
```bash
npx prisma migrate dev
npm run dev
```
