---
name: Artifact API routing
description: Published /api requests are owned by the separate API artifact, not the migrated Next or Nest app.
---

In this multi-artifact deployment, the API artifact owns `/api/*`. Routes implemented only in the migrated Nest app or Next app are not reachable there in production.

**Why:** The published API artifact is a separate Express service with its own route table; an otherwise valid `/api` handler can still return Express 404.

**How to apply:** Keep production API endpoints in `artifacts/api-server/src/routes`, or expose app-owned browser flows such as Better Auth through a non-`/api` CRM route.