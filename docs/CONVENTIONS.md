# Project Conventions: `cp_utility` (cu)

This document outlines the coding standards, naming conventions, and development workflow for the `cp_utility` project. These conventions are designed to be "industry standard" for modern C++ development, ensuring clarity, performance, and long-term maintainability.

---

## 1. Naming Conventions

Consistency in naming is the foundation of readable code. We follow a modern "LLVM-like" convention (with some Google influences for clarity).

| Entity | Convention | Example |
| :--- | :--- | :--- |
| **Files** | `snake_case` | `config_manager.cpp`, `test_runner.hpp` |
| **Namespaces** | `snake_case` | `cu`, `cu::resolver` |
| **Classes / Structs** | `PascalCase` | `ConfigManager`, `ProblemData` |
| **Functions / Methods** | `camelCase` | `fetchProblem()`, `validateInput()` |
| **Local Variables** | `camelCase` | `retryCount`, `problemSlug` |
| **Member Variables** | `camelCase_` (trailing underscore) | `workspacePath_`, `isInitialized_` |
| **Constants** | `kPascalCase` (prefixed with k) | `kMaxRetries`, `kDefaultTimeout` |
| **Enums (Type)** | `PascalCase` | `Difficulty` |
| **Enum Values** | `PascalCase` | `Easy`, `Medium`, `Hard` |
| **Macros** | `SCREAMING_SNAKE_CASE` | `CU_DEBUG_PRINT` |
| **Template Type Parameters** | `PascalCase` (usually `T` or descriptive) | `template <typename TValue>` |

---

## 2. Language Standard & Modern Features

We target the latest stable C++ standard (**C++20** or higher).

### Core Principles
- **Immutability by Default**: Use `const` for everything that doesn't change. This aids both the compiler and the reader.
- **Type Safety**:
    - Use `enum class` for all enumerations.
    - Use `[[nodiscard]]` for functions that returns handles or critical result objects.
    - Prefer `std::string_view` for constant string parameters to avoid unnecessary copies.
    - Use `std::span` (C++20) for viewing contiguous memory (arrays/vectors).
- **Compile-time Evaluation**: Use `constexpr` and `consteval` wherever possible to move computation from runtime to compile time.
- **No Raw Ownership**: 
    - Never use `new` or `delete`. 
    - Use `std::unique_ptr` for exclusive ownership.
    - Use `std::shared_ptr` only when multiple owners are strictly necessary.
    - Prefer references (`&`) or raw pointers (`*`) for *non-owning* access, assuming the object outlives the caller.

### Error Handling
- **Exceptions**: Reserved for truly exceptional circumstances (memory failure, missing critical files, unexpected OS errors). Don't use them for control flow.
- **Fallible Operations**: Use `std::expected<T, E>` (C++23) or `std::optional<T>` for common failure paths (e.g., "file not found", "invalid input").
- **Assertions**: Use `assert()` during development for programmer errors (invariants) that should never happen if the internal logic is correct.

---

## 3. Physical & Logical Organization

### File Structure
- **Public Headers**: All public APIs go in the `include/` directory.
- **Implementations**: All implementation code goes in `src/`.
- **Header Guards**: Use `#pragma once` at the start of every header file.
- **Headers vs. Implementation**:
    - Keep headers as light as possible (minimize includes).
    - Use forward declarations for types that are only used as pointers or references.
    - Implementation-specific details (private members, helper functions) should be hidden in `.cpp` files or internal namespaces.

### Includes
Order your includes from "most specific" to "most general" to catch hidden dependency issues:
1.  The primary header for the file (e.g., `ConfigManager.cpp` includes `ConfigManager.hpp` first).
2.  Project headers (`#include "cu/..."`).
3.  Library headers (e.g., `#include <spdlog/spdlog.h>`).
4.  Standard library headers (e.g., `#include <vector>`).

---

## 4. Documentation (Doxygen)

All code meant for developer consumption (classes, public methods, types) MUST be documented using Doxygen-style Javadoc comments.

### Style Guide
- Use `/** ... */` for multiple lines or `///` for single lines.
- Always include a `@brief` summary.
- Use `@param` for every argument and `@return` for descriptions of return values.
- Mention exceptions with `@throws`.

**Example:**
```cpp
/**
 * @brief Fetches a LeetCode problem by its slug.
 * 
 * This method performs a network request to the LeetCode API.
 * 
 * @param slug The unique problem identifier (e.g., "two-sum").
 * @return std::expected<ProblemData, Error> The problem data if successful, otherwise an error.
 * @throws NetworkException if the internet connection is physically disconnected.
 */
std::expected<ProblemData, Error> fetchProblem(std::string_view slug);
```

---

## 5. Coding Style & Formatting

We use **Clang-format** with a consistent configuration to ensure the codebase remains visually unified.

- **Bracing**: K&R or Allman style (as defined in `.clang-format`).
- **Indentation**: 4 spaces (no tabs).
- **Control Flow**:
    - Always wrap `if`, `for`, and `while` bodies in braces `{}` even for single-line statements — this prevents "dangling else" bugs.
    - Prefer early-return / "guard clause" patterns to reduce nesting level.

---

## 6. Git Workflow & Commits

### Branching
- **Main Branch**: `main`. Always kept in a building, deployable state.
- **Feature Branches**: `feat/description` or `fix/description`. Work is done in short-lived branches and merged via Pull Request.

### Conventional Commits
Commit messages should follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification:
- `feat:` for new features.
- `fix:` for bug fixes.
- `docs:` for documentation changes.
- `chore:` for build system or dependency updates.
- `test:` for adding or updating tests.
- `perf:` for performance improvements.

**Example:**
`feat: add problem caching layer`

---

## 7. Testing

- Every new piece of logic (especially in `resolver`, `fetcher`, and `config`) must have an associated test.
- Tests are located in the `tests/` directory and should be named `test_*.cpp`.
- Aim for high test coverage of edge cases (network failure, malformed JSON, empty workspace, etc.).
