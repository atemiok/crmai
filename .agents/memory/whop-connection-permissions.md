---
name: Whop connection permissions
description: Whop billing setup can be blocked by provider permissions even when the Replit connection reports healthy.
---

Whop API-key connections may report healthy in Replit while Whop rejects company and MCP operations with a missing `company:basic:read` permission.

**Why:** The connection is API-key based, so OAuth reauthorization cannot repair a provider-side role or permission mismatch.

**How to apply:** Before provisioning a Whop product or plan, verify company-level access through the connected proxy. If denied, have the existing Whop connection updated with the required provider permissions; never request or store the key in chat or source.