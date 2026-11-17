---
title: 'ApexGuard AI Agent Skills (skills.sh) & Spec-Driven Workflows'
slug: 'apex-guard-agent-skills'
date: '2026-11-16'
summary: 'How to equip Antigravity, Claude Code, Cursor, GitHub Copilot, and Codex with the 7 official ApexGuard Agent Skills on skills.sh and pair them with masaner/meric-spec.'
tags: ['AI Agents', 'Antigravity', 'skills.sh', 'Salesforce', 'Apex']
repoUrl: 'https://github.com/masaner/apex-guard'
series: 'ApexGuard'
category: 'ApexGuard · Guides'
sidebarTitle: 'AI Agent Skills (skills.sh)'
order: 3
---

`ApexGuard` publishes **7 official [skills.sh](https://www.skills.sh/docs) agent skills** so **Antigravity** ([skills.sh/agent/antigravity](https://www.skills.sh/agent/antigravity)), Claude Code, Cursor, GitHub Copilot, Codex, Gemini CLI, and other compatible AI coding agents automatically apply ApexGuard's public APIs, Salesforce execution-context patterns, security guarantees, and test helpers.

- **Live skills.sh Catalog:** [skills.sh/masaner/apex-guard](https://www.skills.sh/masaner/apex-guard)
- **Antigravity Platform Directory:** [skills.sh/agent/antigravity](https://www.skills.sh/agent/antigravity)
- **Companion Spec Workflow Repo:** [github.com/masaner/meric-spec](https://github.com/masaner/meric-spec) (`npx skills add masaner/meric-spec`)
- **Catalog Configuration:** [`skills.sh.json`](https://github.com/masaner/apex-guard/blob/main/skills.sh.json)
- **Skill Sources:** [`skills/README.md`](https://github.com/masaner/apex-guard/blob/main/skills/README.md)

---

## Step 1: Add the Skills to Your AI Coding Agent

Run inside any Salesforce DX repository root to install all 7 skills at **project scope** (`./.agents/skills/apex-guard-*`), or pass `-g` to install them **globally** (`~/.agents/skills/apex-guard-*`) across every Antigravity workspace:

```bash
# Project-scoped install (recommended for teams; writes ./.agents/skills/ & skills-lock.json)
npx skills add masaner/apex-guard

# Global Antigravity install (available across all Salesforce repos on your machine)
npx skills add masaner/apex-guard -g --agent antigravity --skill '*' -y

# Preview available skills without installing
npx skills add masaner/apex-guard --list

# Install a single skill (example: usage patterns only)
npx skills add masaner/apex-guard --skill apex-guard-usage --agent antigravity
```

### Managing Installed Skills

```bash
# List project-scoped or global Antigravity skills
npx skills list
npx skills list -g --agent antigravity

# Update installed skills to the latest commit on masaner/apex-guard
npx skills update

# Remove one or more skills
npx skills remove apex-guard-install
```

> [!TIP]
> **Antigravity Discovery:** After running `npx skills add masaner/apex-guard`, start a new **Antigravity** session in your workspace—Antigravity automatically discovers every `SKILL.md` under `./.agents/skills/` and `~/.agents/skills/`.

---

## Step 2: Pair with `masaner/meric-spec` (Spec-Driven Workflow)

Want your agent to always follow a structured **Propose → Explore → Apply → Verify → Archive** specification lifecycle (with multi-round Q&A, zero-hallucination exploration, coding-style preservation, and permanent `specs/archived/` summaries) before editing code? Install [`masaner/meric-spec`](https://github.com/masaner/meric-spec) globally alongside ApexGuard:

```bash
npx skills add masaner/meric-spec -g --agent antigravity --skill '*' -y
```

Once both `masaner/apex-guard` and `masaner/meric-spec` are installed, your agent combines **spec discipline** (`meric-spec-*`) with **Salesforce domain accuracy** (`apex-guard-*`):

```text
You:   "Use meric-spec-propose with ApexGuard patterns to refactor BillingService,
        its LWC controller, and OpportunityTrigger."
       -> Agent asks clarifying questions -> You reply "continue"
       -> Explore audits exact files & Prettier/newline conventions -> You reply "continue"
       -> Apply implements every step cleanly -> Verify runs sf apex run test
       -> You reply "archive" -> Consolidated spec saved under specs/archived/
```

---

## Step 3: Skill-by-Skill Reference & Example Prompts

| Catalog Group                 | Skill                                                                                                                                              | Focus Area                                                                                                                      | Example Antigravity Prompt                                                                                                       |
| :---------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------ | :------------------------------------------------------------------------------------------------------------------------------- |
| **Setup**                     | [`apex-guard-install`](https://github.com/masaner/apex-guard/blob/main/skills/apex-guard-install/SKILL.md)                                         | 2GP Unlocked Package (`04td2000000WiM5AAK`), SFDX deploy, install options, `ApexTestSuite`, smoke test                          | _"Install ApexGuard (`04td2000000WiM5AAK`) into my scratch org and run the Execute Anonymous smoke test."_                       |
| **Usage**                     | [`apex-guard-usage`](https://github.com/masaner/apex-guard/blob/main/skills/apex-guard-usage/SKILL.md)                                             | Pass-through `Guard.*` assertions, `Set`/`Map` overloads, LWC `Quiddity.AURA` & `Guard.forLwc()`, REST `toMap()`                | _"Refactor this deeply nested Apex service method and `@AuraEnabled` controller to use flat `Guard` clauses."_                   |
| **Usage**                     | [`apex-guard-triggers-and-bulk-dml`](https://github.com/masaner/apex-guard/blob/main/skills/apex-guard-triggers-and-bulk-dml/SKILL.md)             | Non-throwing `Guard.onRecord()`, `addError()` accumulation, partial DML (`allOrNone = false`), `.skipInaccessible()`            | _"Rewrite this `Opportunity` trigger validation loop with `Guard.onRecord()` so partial DML still saves valid rows."_            |
| **Usage**                     | [`apex-guard-flows-and-agentforce`](https://github.com/masaner/apex-guard/blob/main/skills/apex-guard-flows-and-agentforce/SKILL.md)               | `GuardFlowAction` `@InvocableMethod`, all 18 rules, Fault-path vs. Decision-routing (`throwOnFailure = false`)                  | _"Set up `GuardFlowAction` (`Validate Input (ApexGuard)`) for a Screen Flow using Decision routing instead of throwing."_        |
| **Usage**                     | [`apex-guard-testing`](https://github.com/masaner/apex-guard/blob/main/skills/apex-guard-testing/SKILL.md)                                         | `GuardException` assertions, `Guard.forLwc()` / `testQuiddityOverride`, DML-free `GuardRecord`, locale-safe `System.runAs`      | _"Write `@IsTest` coverage for our LWC controller and `GuardRecord` trigger handler, resetting `Guard.resetContext()` cleanly."_ |
| **Governance & Security**     | [`apex-guard-security-and-best-practices`](https://github.com/masaner/apex-guard/blob/main/skills/apex-guard-security-and-best-practices/SKILL.md) | `inherited sharing`, `isSet()` sparse-SOQL / `Security.stripInaccessible()` safety, opt-in CRUD/FLS vs. Triggers, 0 SOQL/DML    | _"Audit this Apex controller for running-user CRUD/FLS guards without breaking Trigger system mode."_                            |
| **Extending & Observability** | [`apex-guard-extensibility-and-logging`](https://github.com/masaner/apex-guard/blob/main/skills/apex-guard-extensibility-and-logging/SKILL.md)     | `IGuardFailureHandler`, **Nebula Logger** (`EVENT_BUS` survival across rollbacks), custom `Exception` overloads, 30 error codes | _"Connect `ApexGuard` to Nebula Logger via `IGuardFailureHandler` so guard failures log before rolling back."_                   |

---

## How `skills.sh.json` Organizes the Catalog

The repository root [`skills.sh.json`](https://github.com/masaner/apex-guard/blob/main/skills.sh.json) configures how [skills.sh/masaner/apex-guard](https://www.skills.sh/masaner/apex-guard) groups all 7 skills (`Setup`, `Usage`, `Governance & Security`, `Extending & Observability`) using the official `skills.sh` JSON schema.

On every push and pull request to `main`, [`.github/workflows/ci.yml`](https://github.com/masaner/apex-guard/blob/main/.github/workflows/ci.yml) validates that:

1. `skills.sh.json` matches Prettier formatting (`npm run prettier:verify`) and parses as valid JSON.
2. Every skill ID listed in `skills.sh.json` has a matching `skills/<skill>/SKILL.md` with valid `name:` and `description:` YAML frontmatter.
3. Every `skills/*/SKILL.md` directory in the repository is registered inside `skills.sh.json` (no orphaned or ungrouped skills).
