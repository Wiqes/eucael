<!-- Project Context -->

This is an Angular v19 project using PrimeNG for UI. The project follows modern Angular development practices and emphasizes maintainability, scalability, and performance.

<!-- Coding Standards -->

- Always break components and services into smaller, more focused parts to keep them simple and maintainable.
- Use Angular best practices and follow the Angular Style Guide
- Prefer standalone components over NgModules
- Use PrimeNG components for UI consistency
- Follow reactive programming patterns with RxJS
- Use TypeScript strict mode features
- Implement proper error handling and loading states

### Nomenclature

Use PascalCase for classes, enums, and typedefs.
Use camelCase for variables, functions, and methods.
Use snake_case for file and directory names.
Use UPPERCASE for constants.
Start each function with a verb.
Use verbs for boolean variables. Example: isLoading, hasError, canDelete, etc.
Use complete words instead of abbreviations and correct spelling.

- Except for standard abbreviations like API, URL, etc.
- Except for well-known abbreviations:
  - i, j for loops
  - err for errors
  - ctx for BuildContext

### Functions

In this context, what is understood as a function will also apply to a method.
Write short functions with a single purpose. Less than 20 instructions.
Name functions with a verb and something else.

- If it returns a boolean, use isX or hasX, canX, etc.
- If it doesn't return anything, use executeX or saveX, etc.
  Avoid nesting blocks by:
- Early checks and returns.
- Extraction to utility functions.
  Use higher-order functions (map, where, reduce, etc.) to avoid function nesting.
  Use default parameter values instead of checking for null.
  Reduce function parameters using objects for complex parameters.
  Use a single level of abstraction.

### Data

Don't abuse primitive types and encapsulate data in classes.
Prefer immutability for data.
Use interfaces for data structures.
Use enums for fixed sets of values.

### Classes

Follow SOLID principles.
Prefer composition over inheritance.
Write small classes with a single purpose.

- Less than 200 instructions.
- Less than 10 public methods.
- Less than 10 properties.

### Error Handling

Use exceptions for unexpected errors.
If you catch an exception, it should be to:

- Handle a specific, known error case.
- Add context before re-throwing.
- Otherwise, let a higher-level handler manage it.

<!-- Architecture Guidelines -->

- Always break components and services into smaller, more focused parts to keep them simple and maintainable.
- Follow feature-based folder structure
- Separate concerns: services for data access, components for presentation
- Use guards for route protection
- Implement interceptors for cross-cutting concerns (auth, credentials)
- Use state management patterns when appropriate

<!-- Specific Preferences -->

Always break components and services into smaller, more focused parts to keep them simple and maintainable.
Prefer using PrimeNG's built-in features and components over custom implementations to ensure consistency and reduce maintenance overhead.
