---
layout: post
title: "AI Code Is Self-Driving?"
description: "Autonomous driving looks cool — but you wouldn't close your eyes and ride along. Vibe coding is different. It looks cool, and if things go wrong, it feels like no big deal. Right?"
category: articles
tags: [AI]
comments: true
---

Autonomous driving looks cool — but you wouldn't really want to close your eyes and ride along. Vibe coding is different. It looks cool too, and if things go sideways, it feels like no big deal.

But "no big deal" is exactly the problem.

As AI gets more involved in software development, some people are convinced "developers will be replaced by AI within six months," while others stubbornly refuse to let AI touch their code at all. The debate isn't settled — but the question itself reminded me of another domain entirely.

Autonomous driving has a well-established classification system. SAE breaks it into L0 through L5, from "fully manual" to "fully autonomous." Each level describes the same thing: as the system gets more capable, where does human control step back — and how far?

Can the same framework apply to code?

Structurally, yes. But there's one critical difference that changes the entire risk model.

---

## 1. Mapping SAE: A Six-Level Model for AI Code Autonomy

Let's map the SAE levels onto AI code decision-making:

| Level | Human Role | AI Role | SAE Equivalent |
|-------|-----------|---------|----------------|
| L0 | Writes everything | No autonomy (autocomplete at most) | L0: Fully manual |
| L1 | All decisions + all edits | Suggestions, completions | L1: Single assist feature |
| L2 | Continuous review + picks implementation | Generates functions/modules, needs confirmation | L2: Steering + acceleration assist |
| L3 | Semantic judgment only (accept/reject) | Completes features, opens PRs | L3: System leads, human can take over |
| L4 | Monitors boundaries + approves critical paths | Freely modifies within scoped modules, auto-fixes bugs | L4: Fully automated in specific scenarios |
| L5 | Defines goals only | Full design + implementation + refactoring | L5: Fully autonomous |

The core structure mirrors autonomous driving exactly: **human control moves down the stack, while responsibility moves up.**

From L0 to L5, the human role shifts clearly:

> Code writer → Code reviewer → Semantic gatekeeper → Goal definer

The same shift happens in autonomous driving:

> Driver → Supervisor → Emergency override → Passenger

The structures are isomorphic. Both are Human-in-the-loop systems evolving from the execution layer toward the accountability layer.

---

## 2. The Similarity: Decision Granularity Moves Up

The fundamental change in both systems is the same: **as automation increases, the human's job shifts from "how to do it" to "whether to allow it."**

In autonomous driving:
- L1–L2: Control the steering wheel
- L3–L4: Decide "should the system keep running"

In code systems:
- L1–L2: Focus on functions, variables, implementation details
- L3–L4: Judge "does this change match system intent"

On this point, the two are strikingly similar — which is exactly why the autonomous driving framework works as a template.

But from here, the two systems start to diverge.

---

## 3. The First Difference: Rollback

Autonomous driving is a real-time control system. Every frame of decision takes immediate effect — no undo. The car drifted left. That drift is a physical fact that happened.

Code systems aren't like that.

Every change goes into version control. You can revert, rollback, hotfix. The state of a code system is versioned — errors aren't endpoints, just correctable states.

This makes code systems feel "safer" than autonomous driving. There's always a way back.

But that intuition is flawed. Rollback only means "technically reversible" — not "cheap to reverse." As a system evolves, undoing a past decision can cost far more than reimplementing it from scratch. Which brings us to the second difference — the one that actually matters.

---

## 4. The Real Difference: Cumulative Degradation

A bad judgment call in autonomous driving, if it doesn't cause an accident, usually has no effect on the next drive.

The system re-perceives the environment every frame. Past errors don't alter sensor input or modify the control architecture. When each session ends, the state resets. Errors don't accumulate — they get absorbed in closed-loop feedback.

Code systems are completely different.

A bad abstraction gets committed. Now it's part of the system structure. Other modules start depending on it. New features get built on top of it. Tests get written around it. That original small mistake slowly becomes load-bearing — it reshapes the boundary conditions for every future change.

After a few of these, the system still runs. Features still work. But the structure is a mess. Nobody can explain why a certain interface was designed that way. That core logic? Everyone silently agrees: "if it runs, don't touch it."

This is cumulative degradation:

> Errors in autonomous driving are **noise that dissipates over time**.
> Errors in code systems are **constraints that accumulate in structure**.

One is an error-control problem. The other is a complexity-evolution problem.

---

## 5. L4 Is Where Things Start to Slip

Once you understand cumulative degradation, a more specific question becomes answerable:

**Autonomous driving running at L4 frequently — no problem. AI code running at L4 frequently — the codebase will likely spiral. Why?**

Autonomous driving's L4 is "constrained autonomy." It has geofencing, task boundaries, no state accumulation, each session independent. The AI controls the vehicle freely, but its action space is narrow — just direction and speed. It can't change the road itself. And crucially: **a mistake during some phase of L4 autonomous driving, if it doesn't cause an accident, has basically no effect on any future drives.** The system resets completely at the start of the next session. Errors leave no trace.

AI code's L4 is a completely different animal.

At L4, the AI can freely modify within a scoped module — refactor dependencies, auto-fix bugs. The boundaries look clear on the surface. But module boundaries in code were never physically isolated. A change "within the module" might quietly shift an interface contract, alter another module's assumptions, introduce a hidden coupling nobody noticed.

And these changes accumulate.

Today an L4 operation refactors a utility function's signature. Next week another L4 operation adds logic on top of it. The month after, another L4 operation pulls it into a module that used to be independent. Each one looked reasonable in isolation. But stack three of them and the system's abstraction boundaries have silently drifted.

**That's the real risk of L4 in code systems: not a single bad operation, but the cumulative effect of frequent L4 operations pushing the system from "controlled evolution" to "structural drift."**

Autonomous driving doesn't have this problem — roads don't change shape based on yesterday's driving decisions. Codebases do. Every autonomous AI edit reshapes the system's structure. That structure becomes the foundation for the next edit. And the one after that.

The danger of L4 isn't its individual output. It's that it's **an entry point into a self-modifying structural system**.

---

## 6. L2–L3 Is the Sweet Spot Right Now

Based on all of this, the conclusion is clear: **in AI-assisted code systems, L2 to L3 is the highest-leverage, lowest-risk, most sustainable range to operate in.**

Why L2–L3?

**L2: Humans control the implementation layer.**

AI writes code, but humans review line by line. All structural decisions belong to humans. AI output is a draft — humans are the real decision-makers. In this range, AI is a productivity tool. Complexity grows linearly. Abstraction boundaries stay in human hands.

**L3: Humans control the semantic layer.**

AI can complete a full feature or PR. Humans no longer read every line — they just judge "does this change match expected behavior?" The review surface moves up from code details to system semantics. Efficiency improves significantly, but humans remain the gatekeepers of meaning.

What both have in common: **humans still own the right to define abstraction boundaries.**

Above L4, AI starts to have the ability to modify those boundaries. Humans have exited structural control — only goal definition remains. In today's code systems, that means: nobody can guarantee the system is still evolving in a predictable direction.

---

## 7. Conclusion

Autonomous driving and AI code systems share the same classification structure — but their risk semantics are completely different.

Autonomous driving optimizes for safety and continuity. Errors are transient. State resets every frame. Cumulative degradation doesn't exist. Frequent L4 makes sense in that context.

Code systems optimize for maintainability, understandability, and evolvability. Errors enter the structure. State accumulates permanently. Complexity only grows. Frequent L4 is dangerous in that context.

AI makes the cost of producing code approach zero — but it also makes **the cost of producing structural errors** approach zero. The real pressure shifts to:

> How do you stop low-cost errors from entering high-cost structure?

L2–L3 is the most effective answer for this moment — not because it's the most advanced, but because it keeps humans in final control of system structure.

The endgame for autonomous driving is "no human needed."

But what software systems actually need is **bounded autonomy**.

In engineering practice, this points to two concepts worth exploring: **agent workflow** and **agent harness**. The former describes the decision boundaries an AI operates within during a task. The latter refers to the execution infrastructure wrapped around the model — the thing that constrains its behavior. Both are concrete paths toward bounded autonomy. More on that another time.