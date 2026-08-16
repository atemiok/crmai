---
name: Eve on Replit
description: Replit runtime constraints and the safe Eve sandbox selection for this CRM.
---

Replit cannot initialize Eve's nested Docker sandbox in the development workflow; the failure occurs during OCI setns setup before the Eve server can bind. The Replit runtime should use Eve's pure-JavaScript justbash backend, while the existing default backend selection remains in place for Vercel and other self-hosted environments.

**Why:** Repeated workflow restarts cannot fix a nested-container runtime limitation, and switching the entire service to a hosted Vercel sandbox would violate the Replit-local setup goal.

**How to apply:** When updating Eve's sandbox configuration for Replit, keep the environment-gated justbash selection and do not weaken or replace the non-Replit Docker/microsandbox/Vercel configuration without a deliberate deployment decision.
