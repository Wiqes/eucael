---
name: debugging-and-fixing-bugs
description:
  'Guidance for debugging and fixing bugs in this repository. Use when
  investigating errors, test failures, runtime crashes, UI regressions,
  performance issues, or unexpected behavior. Emphasizes reproducible steps,
  minimal fixes, root-cause analysis, and safe verification.'
---

# Debugging and Fixing Bugs

Apply this skill whenever diagnosing and resolving issues to ensure fixes are
correct, minimal, and maintainable.

## When to Use This Skill

- Investigating runtime errors or crashes
- Fixing failing tests or build errors
- Debugging UI regressions or logic bugs
- Addressing performance problems or memory leaks

## Core Principles

- Reproduce the bug reliably before changing code.
- Identify root cause, not just symptoms.
- Implement the smallest safe fix.
- Add or update tests when appropriate.
- Verify behavior after the fix.

## Debugging Workflow

1. **Reproduce**
   - Capture exact steps, inputs, and environment.
   - Confirm the issue is consistent.

2. **Localize**
   - Narrow scope to a feature, component, or service.
   - Inspect logs, stack traces, and error messages.

3. **Isolate**
   - Identify minimal code path that triggers the bug.
   - Check recent changes and related dependencies.

4. **Fix**
   - Apply minimal changes that address root cause.
   - Avoid unrelated refactors unless required.

5. **Verify**
   - Re-run tests and reproduce steps.
   - Confirm no regressions.

## Angular-Specific Guidance

- Use proper change detection strategies and avoid heavy template expressions.
- Verify input/output contracts and lifecycle expectations.
- Check subscription cleanup and async flows.
- Ensure state updates are deterministic (signals or RxJS patterns).

## Performance and Reliability

- Look for expensive DOM updates or missing `trackBy`.
- Avoid repeated calculations in templates.
- Keep side effects contained and observable.

## Review Checklist

- Root cause identified and documented.
- Fix is minimal and targeted.
- Tests cover the regression where feasible.
- No new warnings or errors introduced.
- Code remains readable and maintainable.
- ESLint errors are checked and resolved before considering the work done.

## Troubleshooting

- If reproduction is inconsistent, log inputs and timing.
- If a fix feels large, revisit the root-cause hypothesis.
- If tests are missing, add focused unit tests.
