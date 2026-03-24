---
layout: post
title: "Why AI-assisted coding favors DDD-style architecture"
description: "Starting from the pain of reading unfamiliar code, how DDD-style and Clean Architecture make business semantics explicit and boundaries clear—so both humans and AI can understand and ship faster."
category: articles
tags: [AI]
comments: true
---

One thing I have always disliked in my career as a developer is reading other people’s code—especially when a unfamiliar codebase lands on my desk. If there are no comments, it is even more frustrating. In the past, when a project followed something like MVC or microservices, folders and layers were at least predictable, and onboarding was somewhat smoother. Reality is often messier; on large or complex systems, feeling lost is the norm.

That is changing. AI can help us build a mental model from the big picture down to the details, without grinding through every unfamiliar line. That raises a new question: how do we help AI understand the project, and surface that understanding back to us so we can ramp up quickly? That is the core problem modern AI-oriented software architecture needs to solve.

As AI coding tools get smarter, teams are hitting limits with classic MVC or LangChain-style layouts on big AI projects: business meaning is buried, module boundaries are fuzzy, and it is hard for AI to reason about end-to-end behavior. More teams are moving to DDD-style plus Clean Architecture—organizing by domain instead of technical layers—so AI can see what the system does at a glance, and developers can read the code more easily too.

## What “DDD-style” means

DDD, Domain-Driven Design, comes from Eric Evans. The idea is simple: structure software around the business domain, not around technical tiers.

In a DDD-style project, folders often look like this:

```text
domains/
  patient/
  medical_record/
  diagnosis/

application/
  use_cases/

infrastructure/
  database/
  llm/
```

Compared with traditional MVC:

| Dimension | MVC | DDD-style |
| --- | --- | --- |
| Organization | By technical layer | By business domain |
| Where meaning lives | Hidden in logic | Visible in structure |
| Module boundaries | Fuzzy | Clear |
| Cost for AI to understand | High | Low |

So when AI reads the repo, it can spot core domain concepts immediately, without guessing what each `service` or `helper` is for.

## Why AI coding leans toward DDD-style

Inside a project, AI mostly does three things: understand code, understand the business, and emit the right modules. DDD-style structure supports that flow naturally.

### Clear semantics

Modules are named after the business, for example:

- `patient`
- `diagnosis`
- `appointment`
- `billing`

AI reasons about the domain directly instead of stitching context from generic words like “service” or “helper.”

### Explicit boundaries

DDD’s bounded contexts split the system into coherent slices, for example:

- `patient-domain`
- `billing-domain`
- `diagnosis-domain`

When changing patient-related behavior, AI can focus on `domains/patient` instead of scanning the whole monorepo.

### A better fit for agent workflows

Typical agent tasks:

- Add new feature
- Fix bug
- Implement API
- Generate tests

Under DDD-style, that decomposes cleanly into:

- Update domain model
- Add use case
- Expose API
- Write tests

The story is linear; inference stays efficient.

## A concrete DDD-style layout in an AI project

Take an AI healthcare app:

```text
src/

domains/
  patient/
    Patient.ts
    PatientRepository.ts
    PatientService.ts

  report/
    Report.ts
    ReportGenerator.ts

application/
  createReportUseCase.ts
  analyzeMedicalImageUseCase.ts

infrastructure/
  openai/
  database/
  websocket/

interfaces/
  api/
  ui/
```

**Task:** Add feature: generate AI medical report

A reasonable inference path:

1. Create the `Report` domain model
2. Add `ReportGenerator`
3. Implement `createReportUseCase`
4. Expose an endpoint in the API layer

The flow stays traceable; boundaries stay obvious.

## How modern AI frameworks reflect this

- **OpenAI Assistants API:** Models assistants, tools, threads, and runs as domain concepts
- **Vercel AI SDK:** Emphasizes `ai`, tools, and actions in a use-case-oriented way
- **LangChain:** Early layouts (chains, agents, prompts, tools) often turned into “prompt spaghetti”; teams increasingly roll their own DDD-style structure

## Where DDD-style shows up in AI systems

- **AI SaaS:** conversation, message, model, billing
- **AI healthcare:** patient, medical_image, diagnosis, report
- **AI agent platforms:** task, agent, tool, execution, memory

## Next-generation AI project layout

Future AI-heavy codebases might standardize on something like:

```text
domains/
agents/
tools/
workflows/
llm/
interfaces/
```

As AI shifts from a pure code generator toward something closer to an autonomous developer, DDD-style gives you:

- Explicit business semantics
- Stable module boundaries
- A structure AI can reason about

## Looking ahead: how developers collaborate with AI

Someday—maybe in 2026—when we talk architecture, “can a human read this easily?” may matter less than “can AI understand this project quickly?” We will optimize not only for human ergonomics but for fast onboarding of new models and tools that must take the wheel and iterate.

That frees developers to spend more time on higher-level problems. Until AI thinks exactly like us, we should make architectural and technical choices with an AI-shaped lens: for every module and dependency, ask how an agent would interpret and operate on it. Done well, AI becomes a stronger partner in decisions and delivery—faster, and more under control.
