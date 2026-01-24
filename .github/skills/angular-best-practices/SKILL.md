---
name: angular-best-practices
description:
  'Ensure Angular code follows best practices for performance, architecture, and
  maintainability. Use when writing, reviewing, or refactoring Angular
  components, services, directives, pipes, routing, and state logic in this
  project. Enforces standalone components, inject(), input()/output(),
  viewChild()/viewChildren()/contentChild()/contentChildren(), signals
  (signal/computed/effect), clean templates, SOLID/DRY/KISS, and scalable file
  organization.'
---

# Angular Best Practices

Apply this skill whenever creating or changing Angular code in this repository
to keep the codebase performant, scalable, and clean.

## When to Use This Skill

- Writing or refactoring Angular components, services, directives, pipes,
  guards, interceptors, or routes
- Reviewing Angular code for architecture, maintainability, or performance
- Working in Angular templates or component classes
- Introducing signals, dependency injection patterns, or new component APIs

## Core Principles

- Keep templates lean; move logic to component class or services.
- Prefer standalone components and feature-oriented structure.
- Enforce SOLID, DRY, KISS, and clean code practices.
- Favor composition over inheritance; use OOP best practices.
- Avoid unnecessary change detection work and expensive template expressions.

## Required Angular Patterns

### Standalone Components

- Use `standalone: true` in new components.
- Prefer `imports` in component metadata over module-based declarations.

### Dependency Injection

- Prefer `inject()` over constructor injection when it improves clarity.
- Keep services focused and single-responsibility.

### Inputs/Outputs and Queries

- Use `input()` and `output()` APIs for component contracts when available.
- Use `viewChild()`, `viewChildren()`, `contentChild()`, `contentChildren()` for
  queries.
- Keep `input()` and `output()` minimal and strongly typed.

### Signals

- Prefer `signal()` for local state.
- Use `computed()` for derived values.
- Use `effect()` for side effects with cleanup where needed.

## Performance Guidance

- Avoid heavy computations in templates; precompute in class or `computed()`.
- Use `trackBy` for `*ngFor` loops.
- Prefer `OnPush` change detection when practical.
- Avoid unnecessary subscriptions; use `async` pipe where possible.
- Unsubscribe or use `takeUntilDestroyed()` when using observables.

## Architecture and Organization

- Keep feature code within its feature folder under `src/app/features/`.
- Shared UI elements belong in `src/app/shared/ui/`.
- Cross-cutting services go in `src/app/core/services/`.
- Avoid circular dependencies; keep a clean dependency direction.

## Review Checklist

- Templates are clean and declarative; logic is in classes/services.
- Standalone components are used for new work.
- Proper use of `inject()`, `input()`, `output()`, and query APIs.
- Signals used for local state with `computed()` and `effect()` when
  appropriate.
- SOLID/DRY/KISS applied; no duplicated logic.
- Clear, readable code with strong typing and minimal side effects.
- ESLint errors are checked and resolved before considering the work done.

## Troubleshooting

- If performance is slow, inspect templates for heavy expressions and missing
  `trackBy`.
- If component APIs are unclear, refactor to explicit `input()`/`output()` and
  typed interfaces.
- If state is complex, refactor to signals with `computed()` and scoped
  services.
