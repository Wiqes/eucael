---
name: unit-testing
description:
  'Guidance for writing and maintaining unit tests in this repository. Use when
  creating or updating tests for Angular components, services, directives,
  pipes, guards, interceptors, and utility functions. Emphasizes isolated tests,
  clear arrange-act-assert structure, reliable mocks, and fast, deterministic
  execution.'
---

# Unit Testing Best Practices

Apply this skill whenever creating or modifying unit tests to keep the suite
fast, reliable, and maintainable.

## When to Use This Skill

- Writing or refactoring unit tests
- Reviewing tests for clarity, coverage, or reliability
- Creating mocks, stubs, or test doubles
- Investigating flaky or slow tests

## Core Principles

- Tests must be deterministic and isolated.
- Prefer small, focused tests over broad integration scenarios.
- Keep tests readable and descriptive.
- Follow SOLID/DRY/KISS in test code too.

## Structure and Style

- Use Arrange–Act–Assert (AAA) consistently.
- Prefer explicit test names: describe expected behavior and conditions.
- Avoid shared mutable state across tests.
- Minimize global setup; keep setup close to the test.

## Angular-Specific Guidance

- Use Angular TestBed only when necessary.
- Prefer shallow tests for components; mock child components.
- Use `fakeAsync`/`tick` or `waitForAsync` appropriately for async flows.
- Prefer the `async` pipe in templates to avoid manual subscriptions in tests.

## Mocking and Test Doubles

- Mock external services and HTTP calls.
- Use spies for method verification, not for complex behavior.
- Keep mocks simple and typed.

## Performance and Reliability

- Keep tests fast; avoid real timers or network calls.
- Reset spies and mocks after each test.
- Avoid random data unless seeded and controlled.

## Coverage Guidance

- Cover critical logic branches and edge cases.
- Avoid asserting implementation details; test behavior.
- Include negative cases and error handling.

## Review Checklist

- Tests are isolated and deterministic.
- Clear AAA structure and descriptive names.
- Mocks/stubs are minimal and typed.
- Async logic is handled reliably.
- No unnecessary TestBed usage.
- No flaky or slow patterns introduced.
- ESLint errors are checked and resolved before considering the work done.

## Troubleshooting

- If a test is flaky, remove timing assumptions and isolate async logic.
- If a test is slow, reduce TestBed usage or heavy setup.
- If tests are brittle, refactor to assert behavior instead of internals.
