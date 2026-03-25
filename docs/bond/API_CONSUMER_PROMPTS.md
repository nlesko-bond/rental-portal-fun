# Prompts for external API consumers

Use this file alongside Bond’s **hosted API documentation** (Swagger) and your **organization public API key**.  
The companion file `PUBLIC_APIS_FOR_AGENTS.md` is an **internal** map of Nest controllers in our repo—it is **not** meant for your customers or a generic ChatGPT-style agent without access to our codebase.

---

## 1. Prompt for an external integration agent (e.g. ChatGPT, Cursor on *their* project)

Copy everything inside the block below into a new chat as the **first message** (or as a **custom instruction / system prompt**). Replace the bracketed placeholders.

```
You are helping integrate a third-party website or app with Bond Sports’ public HTTP APIs.

Context:
- The facility (organization) has a Bond **organization ID**, and may have an **online booking portal ID** from Bond backoffice.
- They authenticate server-to-server or from their backend using an **X-Api-Key** header where the API requires it (exact rules are in the OpenAPI spec).
- Some endpoints require an **end-user login** (JWT / access tokens from Bond auth)—treat those as “logged-in customer only.”
- The canonical contract is the **hosted OpenAPI / Swagger UI** Bond provided—not guesses. Base URL and path prefix (e.g. /v1/ vs /v4/) must match that spec.

Your job:
1. Read the OpenAPI document Bond shared (or the Swagger URL) and only propose request shapes, headers, and flows that appear there.
2. Prefer **server-side** calls for the API key; never tell them to embed the secret key in public web pages or mobile apps.
3. Explain errors in plain language (401/403/404/429/5xx) and suggest concrete checks (wrong org id, missing key, expired token, invalid portal id).
4. Outline a minimal integration sequence: discover portal or categories → list products → fetch schedule/availability → optional logged-in required-products → submit booking if a create/checkout endpoint exists.
5. If something is ambiguous, say what to ask Bond support or their CSM, rather than inventing endpoints.

Constraints:
- Do not invent paths, query names, or auth schemes that are not in the spec.
- Do not store or repeat their API key in full in your replies; refer to it as “your X-Api-Key.”
- Use ISO dates/times and respect pagination parameters defined in the spec.

OpenAPI / Swagger URL: [PASTE BOND’S SWAGGER OR JSON URL HERE]
Organization ID: [OPTIONAL – IF SHARED]
Environment: [e.g. squad-c staging / production – AS PROVIDED BY BOND]
```

Bond staff can paste the real **Swagger URL** (e.g. `https://public.api.squad-c.bondsports.co/public-api/` or production equivalent) where indicated.

---

## 2. Short brief + prompt for the **organization customer** (facility owner / ops—not necessarily a developer)

### What to send them (email / Notion / PDF blurb)

You can send this as-is (adjust names and links):

---

**Subject: Using Bond’s APIs for your own booking site or app**

Bond can expose **programmatic access** so your team or a vendor can build a custom booking experience on your website or app.

**What you receive from Bond**

- A **public API key** (`X-Api-Key`) tied to your organization. Treat it like a password: store it in **server-side** configuration or a secrets manager—**not** in public web pages or mobile app binaries.
- Your **organization ID** and, if you use online booking portals, a **portal ID** (from Bond backoffice).
- A link to our **API documentation (Swagger)** listing every URL, parameter, and required header.

**What your technical partner needs**

- The Swagger link and which **environment** (e.g. staging vs production) to call.
- The **organization ID** and **portal ID** (if applicable).
- A secure way to use the **API key** only from their **backend** (or a BFF), unless the documented API explicitly allows browser calls without exposing secrets.

**What Bond does *not* guarantee via this note**

- Exact rate limits, SLAs, and change windows—your CSM or support will confirm.
- That every action in the consumer app exists in the public API; some features remain backoffice-only.

**Support:** [YOUR SUPPORT CHANNEL / CSM EMAIL]

---

### Optional “prompt” they can paste to **their** developer or AI assistant

```
We use Bond Sports for facility operations. Bond gave us:
- An API documentation link (Swagger/OpenAPI): [URL FROM BOND]
- Organization ID: [ID]
- Public API key (header X-Api-Key): [stored only on our server – do not paste the real key into chat]

Please:
1. Read the OpenAPI spec at the URL above and propose how we call it from our backend to support [describe: e.g. “show rental availability and start checkout”].
2. Never expose the API key in the browser; use server-side or edge functions.
3. List the exact endpoints, methods, headers, and a minimal sequence of calls for our use case.
4. Note which steps require a logged-in Bond user (JWT) vs only the API key.

If the spec is unclear, list specific questions to send to Bond.
```

---

## 3. How the three documents fit together

| Document | Who it’s for |
|----------|----------------|
| **`API_CONSUMER_PROMPTS.md`** (this file) | Bond staff copying prompts; facilities and their integrators. |
| **`PUBLIC_APIS_FOR_AGENTS.md`** | Bond engineers / repo agents mapping Swagger tags to `apiv2` source files. |
| **Hosted Swagger** | Source of truth for URL paths, auth, and request/response shapes for **everyone**. |

If you want a single **customer-facing PDF** later, export section 2 only and add your branding and support contacts.
