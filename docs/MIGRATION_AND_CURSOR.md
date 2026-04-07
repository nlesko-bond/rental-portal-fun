# Migrating work and “the agent” to this repo

This project is intentionally **separate** from `squad-c`. Use this doc when you move your day-to-day work and Cursor sessions here.

## 1. Open this folder as the Cursor workspace

1. **Cursor → File → Open Folder…**
2. Choose **`~/Documents/GitHub/rental-portal-fun`** (not `squad-c`).

Chats, Composer, and **@** file references are scoped to the **currently open workspace**. Opening this folder is what “migrates” the agent context to the portal.

**Optional:** Add the same folder as a second root in a multi-root workspace only if you really need both trees side by side; otherwise prefer **only** `rental-portal-fun` to avoid the AI editing the wrong repo.

## 2. Where the plan lives now

| What | Where |
|------|--------|
| **Source of truth (this repo)** | [`docs/RENTAL_PORTAL_PLAN.md`](RENTAL_PORTAL_PLAN.md) |
| **Implementation status & backlog** | [`docs/IMPLEMENTATION_AND_ROADMAP.md`](IMPLEMENTATION_AND_ROADMAP.md) |
| **Old Cursor plan file (optional)** | `~/.cursor/plans/rental_portal_phase_1–2_577e2690.plan.md` — can delete or ignore once you trust `docs/` |

In a **new chat**, attach the plan so the model follows it:

- Type **`@`** → select **`docs/RENTAL_PORTAL_PLAN.md`**, or  
- Drag that file into the chat.

## 3. Bond API reference docs (already copied)

For integrator prompts and endpoint maps (still **trust hosted Swagger** for shapes):

- [`docs/bond/API_CONSUMER_PROMPTS.md`](bond/API_CONSUMER_PROMPTS.md)  
- [`docs/bond/PUBLIC_APIS_FOR_AGENTS.md`](bond/PUBLIC_APIS_FOR_AGENTS.md)  

If those change in `squad-c`, copy them again or replace with a link in your internal wiki.

## 4. Cursor rules, skills, and MCP (nothing to “move” unless you want project rules)

| Item | Migration |
|------|-----------|
| **User rules** (Settings) | Global to Cursor — already apply in any workspace. |
| **Project rules** | Add **`.cursor/rules/*.mdc`** in **this** repo if you want Bond- or portal-specific instructions. |
| **Skills** (e.g. barak-review) | Still **attach in chat** or enable per your Cursor setup — not stored inside this repo by default. |
| **Jira / other MCP** | Global to your Cursor profile — works the same after you open `rental-portal-fun`. |

**Optional:** Copy a rule file from `squad-c/.cursor/rules/` into `rental-portal-fun/.cursor/rules/` if you want the same Jira defaults **only** when this folder is open.

## 5. Git remote

This repo was initialized with `git` locally. Point it at GitHub (or your host) when ready:

```bash
cd ~/Documents/GitHub/rental-portal-fun
git remote add origin <your-repo-url>
git push -u origin main
```

## 6. Environment secrets

Copy **`.env.example` → `.env.local`** and set `BOND_API_*` and `NEXT_PUBLIC_BOND_*`. Do not commit `.env.local`.

## 7. Continuing implementation

1. Open **`rental-portal-fun`** in Cursor.  
2. New chat → **`@docs/RENTAL_PORTAL_PLAN.md`**.  
3. Ask for the next checklist item (e.g. portal UI, OpenAPI codegen).  

The BFF entry point is **`src/app/api/bond/[...path]/route.ts`**; client helpers are **`src/lib/bond-client.ts`**.
