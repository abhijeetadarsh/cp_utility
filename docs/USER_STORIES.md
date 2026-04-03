# cu — User Stories & Product Requirements

## Document Info

- **Project:** cu (C++ Competitive Utility)
- **Version:** 0.1.0
- **Last Updated:** 2024
- **Status:** In Progress

---

## Table of Contents

1. [Product Vision](#product-vision)
2. [User Personas](#user-personas)
3. [Epic 1 — Workspace & Configuration](#epic-1--workspace--configuration)
4. [Epic 2 — Fetch & Generation Engine](#epic-2--fetch--generation-engine)
5. [Epic 3 — Intelligent Problem Resolution](#epic-3--intelligent-problem-resolution)
6. [Epic 4 — Local Execution & Testing](#epic-4--local-execution--testing)
7. [Epic 5 — Problem Context System](#epic-5--problem-context-system)
8. [Epic 6 — Workspace Navigation & Utility](#epic-6--workspace-navigation--utility)
9. [Non Functional Requirements](#non-functional-requirements)
10. [Out of Scope](#out-of-scope)
11. [Appendix — Command Reference](#appendix--command-reference-summary)

---

## Product Vision

> **cu** is a blazing-fast, terminal-native C++ CLI tool that replaces
> the browser entirely for competitive programmers solving LeetCode problems.
> It fetches problems, generates boilerplate, runs local tests, and manages
> your entire problem workspace — all without leaving the terminal.

### The Problem It Solves

A competitive programmer's current workflow looks like this:

1. Open browser, navigate to LeetCode
2. Find the problem, read it in the browser
3. Copy boilerplate into a local file manually
4. Write a custom test harness by hand
5. Run tests manually, compare output manually
6. Switch back and forth between browser and editor constantly

**cu** collapses all of that into a single terminal workflow.

### The Ideal Workflow With cu

```
cu fetch "two sum"        # finds, downloads, sets as active
cu show                   # read problem in terminal
# write solution in editor
cu test                   # compile and run all test cases
cu add-test               # add an edge case you thought of
cu test                   # verify edge case passes
```

---

## User Personas

### Persona 1 — The Competitive Programmer

- Solves 3-5 LeetCode problems per day
- Lives in the terminal, uses Neovim or VS Code
- Hates context switching between browser and editor
- Wants instant feedback on test cases
- Cares deeply about execution time

### Persona 2 — The Interview Prepper

- Solving problems in focused sessions
- Wants to track which problems they have attempted
- Needs to revisit problems and add edge cases
- Works across multiple machines

### Persona 3 — The Beginner

- Just started competitive programming
- Wants to focus on writing solutions, not tooling
- Needs clear error messages and guidance
- Uses `cu init` once and never thinks about config again

---

## Epic 1 — Workspace & Configuration

### Overview

Everything related to setting up and managing the local environment.
This is the foundation every other Epic depends on.

---

### Story 1.1 — First Time Setup

**As a** developer setting up cu for the first time,
**I want to** run `cu init` inside a directory,
**So that** the current directory becomes my workspace and
all required config files are created.

#### What `cu init` Does

- Treats `pwd` as the workspace — no path prompt needed
- Creates a `.cuconfig/` folder inside `pwd` with required files
- Registers this workspace in the global workspaces list at `~/.cuconfig.json`
- Sets this workspace as the active workspace

#### `.cuconfig/` Folder Structure Created in pwd

```
<pwd>/
└── .cuconfig/
    ├── index.json       ← empty problems list, populated on fetch
    └── state.json       ← active problem state, starts empty
```

#### `index.json` Initial Structure

```json
[]
```

#### `state.json` Initial Structure

```json
{
  "activeProblem": "",
  "lastSet": ""
}
```

#### Global Config Structure at `~/.cuconfig.json`

```json
{
  "version": "0.1.0",
  "activeWorkspace": "C:/Users/abhijeet/problems",
  "workspaces": [
    {
      "path": "C:/Users/abhijeet/problems",
      "name": "problems",
      "createdAt": "2024-01-01T10:30:00"
    },
    {
      "path": "C:/Users/abhijeet/leetcode",
      "name": "leetcode",
      "createdAt": "2024-01-03T09:00:00"
    }
  ]
}
```

#### Acceptance Criteria

- [ ] Running `cu init` uses `std::filesystem::current_path()` as workspace
- [ ] Creates `.cuconfig/` directory inside `pwd`
- [ ] Creates `index.json` with an empty array `[]`
- [ ] Creates `state.json` with `{ "activeProblem": "", "lastSet": "" }`
- [ ] Writes `~/.cuconfig.json` if it does not exist, with `workspaces`
      array containing the current workspace as the first entry
- [ ] If `~/.cuconfig.json` already exists, appends current workspace
      to the `workspaces` array without overwriting existing entries
- [ ] Updates `activeWorkspace` to point to the current `pwd`
- [ ] If `cu init` is run in a directory already in the `workspaces` list,
      does not add a duplicate — updates `activeWorkspace` and
      reinitializes `.cuconfig/` only
- [ ] If `.cuconfig/` already exists in `pwd`, asks before reinitializing
- [ ] `name` field is derived automatically from the directory name
      using `std::filesystem::path::filename()`
- [ ] If two workspaces share the same directory name, appends a number
      suffix to keep names unique e.g. `problems` and `problems-2`

#### Error Cases

- No write permission in `pwd` → descriptive error, nothing written
- No write permission in home directory → descriptive error
- User cancels mid-init (Ctrl+C) → exit cleanly, no partial files written

#### Example Interaction — First Time

```
$ cd C:/Users/abhijeet/problems
$ cu init
Initializing workspace in C:/Users/abhijeet/problems...

✓ Created .cuconfig/index.json
✓ Created .cuconfig/state.json
✓ Global config created at C:/Users/abhijeet/.cuconfig.json

Workspace ready. Run 'cu fetch <problem>' to get started.
```

#### Example Interaction — Adding a Second Workspace

```
$ cd C:/Users/abhijeet/leetcode
$ cu init
Initializing workspace in C:/Users/abhijeet/leetcode...

✓ Created .cuconfig/index.json
✓ Created .cuconfig/state.json
✓ Workspace added to C:/Users/abhijeet/.cuconfig.json
✓ Active workspace switched to: leetcode

Workspace ready. Run 'cu fetch <problem>' to get started.
```

#### Example Interaction — Already Initialized

```
$ cu init
⚠ This directory is already a cu workspace.
  Reinitializing will reset .cuconfig/ but will not delete problem folders.
  Continue? (y/n): _
```

---

### Story 1.2 — View Current Config

**As a** developer,
**I want to** run `cu config show`,
**So that** I can see both my global config and the current
workspace config without opening files manually.

#### Acceptance Criteria

- [ ] Reads `~/.cuconfig.json` for global settings and workspace list
- [ ] Reads `.cuconfig/state.json` from the active workspace for active problem
- [ ] Reads `.cuconfig/index.json` for problem count per workspace
- [ ] If no global config found, suggests running `cu init`
- [ ] If `activeWorkspace` folder no longer exists on disk, warns user
- [ ] Marks the active workspace with a visual indicator in the list

#### Example Interaction

```
$ cu config show

Global (~/.cuconfig.json)
  version          →  0.1.0
  activeWorkspace  →  C:/Users/abhijeet/problems

Workspaces
  ▶ 1. problems   C:/Users/abhijeet/problems    4 problems
    2. leetcode   C:/Users/abhijeet/leetcode    12 problems

Active Workspace (.cuconfig/)
  activeProblem    →  two-sum
  totalProblems    →  4
```

---

### Story 1.3 — Update a Config Value

**As a** developer,
**I want to** run `cu config set <key> <value>`,
**So that** I can update a single config field without re-running init.

#### Acceptance Criteria

- [ ] `cu config set workspace <path>` updates only the `activeWorkspace` field
- [ ] Path is validated before writing — must exist in the `workspaces` list
- [ ] Unknown keys print a list of valid settable keys
- [ ] Success message confirms what was changed and what the old value was

#### Example Interaction

```
$ cu config set workspace C:/Users/abhijeet/leetcode
✓ activeWorkspace updated
  old: C:/Users/abhijeet/problems
  new: C:/Users/abhijeet/leetcode
```

---

### Story 1.4 — Reset Config

**As a** developer,
**I want to** run `cu config reset`,
**So that** I can wipe my global config and start fresh.

#### Acceptance Criteria

- [ ] Prompts for confirmation before deleting (y/n)
- [ ] Deletes `~/.cuconfig.json` on confirmation
- [ ] Does NOT delete any workspace directories or `.cuconfig/` folders
      inside workspaces — only the global pointer file is removed
- [ ] Prints a reminder to run `cu init` again

#### Example Interaction

```
$ cu config reset
⚠ This will delete ~/.cuconfig.json and unregister all workspaces.
  Your problem folders and solutions will not be affected.
  Continue? (y/n): y

✓ ~/.cuconfig.json deleted.
  Run 'cu init' inside a workspace directory to start again.
```

---

### Story 1.5 — Switch Active Workspace

**As a** developer with multiple workspaces,
**I want to** run `cu workspace use <name or path>`,
**So that** I can switch which workspace all commands operate on.

#### Acceptance Criteria

- [ ] `cu workspace list` prints all registered workspaces
- [ ] `cu workspace use <name>` matches by the `name` field
- [ ] `cu workspace use <path>` matches by full path
- [ ] Partial name matching uses the same disambiguation menu pattern
      as `cu use` — numbered list if multiple matches found
- [ ] Updates `activeWorkspace` in `~/.cuconfig.json` on selection
- [ ] If the selected workspace path no longer exists on disk,
      warns user and does not switch
- [ ] `cu workspace remove <name>` removes a workspace from the list
      without deleting the folder on disk

#### Example Interaction — Switch by Name

```
$ cu workspace use leetcode
✓ Active workspace switched to: C:/Users/abhijeet/leetcode
```

#### Example Interaction — Disambiguation Menu

```
$ cu workspace use code
Multiple matches found:

  1. leetcode   C:/Users/abhijeet/leetcode
  2. mycode     C:/Users/abhijeet/mycode

Enter number: 1
✓ Active workspace switched to: C:/Users/abhijeet/leetcode
```

#### Example Interaction — Missing Workspace

```
$ cu workspace use leetcode
⚠ Workspace path no longer exists: C:/Users/abhijeet/leetcode
  The folder may have been moved or deleted.
  Remove it from the list with: cu workspace remove leetcode
```

#### Example Interaction — List

```
$ cu workspace list

  #   Name       Path                              Problems
  ────────────────────────────────────────────────────────
▶ 1   problems   C:/Users/abhijeet/problems        4
  2   leetcode   C:/Users/abhijeet/leetcode        12
```

---

## Epic 2 — Fetch & Generation Engine

### Overview

Everything related to downloading problem data from LeetCode and
generating the local file structure.

---

### Story 2.1 — Fetch Problem by Slug

**As a** competitive programmer,
**I want to** run `cu fetch <slug>`,
**So that** the tool downloads the problem and generates all local files
inside the active workspace.

#### Acceptance Criteria

- [ ] Reads active workspace from `~/.cuconfig.json`
- [ ] POSTs to LeetCode's GraphQL API with the correct query
- [ ] Extracts title, difficulty, description, C++ boilerplate,
      and sample test cases from the response
- [ ] Creates `<activeWorkspace>/<slug>/` directory
- [ ] Writes `solution.cpp` with the C++ boilerplate
- [ ] Writes `problem.json` with full problem metadata
- [ ] Writes `tests.json` with sample test cases as a JSON array
- [ ] Appends a new entry to `.cuconfig/index.json`
- [ ] Sets the fetched problem as the active problem in `.cuconfig/state.json`
- [ ] If the folder already exists, asks before overwriting

#### File Structure Created

```
<activeWorkspace>/
└── two-sum/
    ├── solution.cpp     ← C++ boilerplate, ready to edit
    ├── problem.json     ← raw metadata, never edited by user
    └── tests.json       ← sample test cases array
```

#### `tests.json` Structure

```json
[
  {
    "id": 1,
    "input": "[2,7,11,15]\n9",
    "expected": "[0,1]",
    "custom": false
  }
]
```

#### `problem.json` Structure

```json
{
  "slug": "two-sum",
  "title": "Two Sum",
  "difficulty": "Easy",
  "content": "<p>Given an array...</p>",
  "fetchedAt": "2024-01-01T10:30:00"
}
```

#### `.cuconfig/index.json` Entry Added

```json
[
  {
    "slug": "two-sum",
    "title": "Two Sum",
    "difficulty": "Easy",
    "fetchedAt": "2024-01-01T10:30:00",
    "lastTestStatus": "untested"
  }
]
```

#### Error Cases

- Invalid slug → clear error, no folder created
- Network failure → descriptive error, no partial files left behind
- LeetCode API unreachable → suggest checking connection
- No active workspace → suggest running `cu init`

#### Example Interaction

```
$ cu fetch two-sum
Fetching two-sum from LeetCode...
✓ Problem downloaded: Two Sum (Easy)
✓ Files created in C:/Users/abhijeet/problems/two-sum/
✓ Active problem set to: two-sum
```

---

### Story 2.2 — View Problem Description

**As a** competitive programmer,
**I want to** run `cu show`,
**So that** I can read the problem statement without opening a browser.

#### Acceptance Criteria

- [ ] Reads `problem.json` from the active problem directory
- [ ] Strips all HTML tags from the description
- [ ] Renders title, difficulty, description, and sample test cases
- [ ] Works from any directory if active problem is set in `state.json`
- [ ] Works from inside the problem directory even if no active problem set
- [ ] Accepts optional argument `cu show <slug>` to show any problem
      in the active workspace

#### Example Interaction

```
$ cu show
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Two Sum                            [Easy]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Given an array of integers nums and an integer target, return
indices of the two numbers such that they add up to target.

Example 1:
  Input:  nums = [2,7,11,15], target = 9
  Output: [0,1]

Example 2:
  Input:  nums = [3,2,4], target = 6
  Output: [1,2]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Epic 3 — Intelligent Problem Resolution

### Overview

Making the tool frictionless by allowing natural language input
instead of requiring exact slugs.

---

### Story 3.1 — Fetch by Natural Language Search

**As a** developer,
**I want to** run `cu fetch "binary tree level order traversal"`,
**So that** the tool finds the correct problem automatically
without me memorizing exact slugs.

#### Acceptance Criteria

- [ ] Detects multi-word input (presence of spaces) and treats it
      as a search query rather than a slug
- [ ] Searches DuckDuckGo HTML endpoint for `leetcode <query>`
- [ ] Extracts the first `leetcode.com/problems/<slug>` URL using
      `std::regex`
- [ ] Passes the extracted slug to the standard fetch flow (Story 2.1)
- [ ] If no result found, prints a clear error and suggests trying
      a different search string

#### How Input Detection Works

```
cu fetch two-sum              →  no spaces, treat as slug directly
cu fetch "two sum"            →  spaces detected, trigger search
cu fetch "binary tree level"  →  spaces detected, trigger search
```

#### Error Cases

- Search returns no LeetCode URL → suggest trying a different query
- Network failure during search → descriptive error
- Extracted slug turns out to be invalid → falls through to fetch
  error handling from Story 2.1

---

### Story 3.2 — Use Problem by Partial Name

**As a** developer,
**I want to** run `cu use <partial>`,
**So that** I can switch active problems without typing the full slug.

#### Matching Behaviour

```
Zero matches   →  error message, suggest cu list
One match      →  set active immediately, no prompt
Two or more    →  numbered interactive disambiguation menu
```

#### Example — Zero Matches

```
$ cu use xyzabc
✗ No problems found matching "xyzabc"
  Run 'cu list' to see all fetched problems.
```

#### Example — One Match

```
$ cu use two
✓ Active problem set to: two-sum
```

#### Example — Disambiguation Menu

```
$ cu use tree
Multiple matches found:

  1. binary-tree-inorder-traversal      (Easy)
  2. binary-tree-level-order-traversal  (Medium)
  3. binary-tree-zigzag-traversal       (Medium)

Enter number: 2
✓ Active problem set to: binary-tree-level-order-traversal
```

#### Example — Invalid Menu Selection

```
Enter number: 9
✗ Invalid selection. Enter a number between 1 and 3:
Enter number: _
```

#### Acceptance Criteria

- [ ] Partial match uses case-insensitive substring search on slugs
      from `.cuconfig/index.json`
- [ ] Zero matches → error message with `cu list` suggestion
- [ ] Exactly one match → sets active immediately, no menu
- [ ] Multiple matches → numbered interactive menu
- [ ] Invalid menu input loops until valid number entered or Ctrl+C
- [ ] Ctrl+C during menu exits cleanly with no state change
- [ ] Exact slug input still goes through match() — resolves as one match

---

## Epic 4 — Local Execution & Testing

### Overview

Compiling and running solution code locally against test cases
without submitting to LeetCode.

---

### Story 4.1 — Run Local Test Cases

**As a** C++ developer,
**I want to** run `cu test`,
**So that** my solution is compiled and tested instantly against
all local test cases.

#### Acceptance Criteria

- [ ] Resolves active problem via context resolution (Epic 5)
- [ ] Compiles `solution.cpp` using `g++` with C++17 standard
- [ ] Runs each test case in `tests.json` — both sample and custom
- [ ] Shows `[PASS]` or `[FAIL]` for each test case
- [ ] Shows expected vs actual output on failure
- [ ] Shows execution time per test case and total at the end
- [ ] Compilation errors are shown cleanly, not as raw system output
- [ ] Updates `lastTestStatus` in `.cuconfig/index.json` after run
- [ ] Accepts optional `cu test <slug>` to test any problem directly

#### Example Interaction — All Passing

```
$ cu test
Compiling two-sum... done (0.3s)
Running 3 test cases...

  [PASS] Test 1  (1ms)
  [PASS] Test 2  (1ms)
  [PASS] Test 3  (1ms)

3/3 passed  ·  Total: 3ms
```

#### Example Interaction — Failure

```
$ cu test
Compiling two-sum... done (0.3s)
Running 3 test cases...

  [PASS] Test 1  (1ms)
  [FAIL] Test 2  (1ms)
         Expected: [1,2]
         Actual:   [0,1]
  [PASS] Test 3  (1ms)

2/3 passed  ·  Total: 3ms
```

#### Example Interaction — Compilation Error

```
$ cu test
Compiling two-sum...

✗ Compilation failed:
  solution.cpp:12:5: error: expected ';' after return statement
      return result
             ^

Fix the error and run 'cu test' again.
```

---

### Story 4.2 — Add Custom Test Case

**As a** developer debugging a failing submission,
**I want to** run `cu add-test`,
**So that** I can add edge cases I thought of to the local test suite.

#### Acceptance Criteria

- [ ] Resolves active problem via context resolution (Epic 5)
- [ ] Prompts for input and expected output interactively
- [ ] Appends new test case to `tests.json` with `"custom": true`
- [ ] Assigns the next available `id`
- [ ] New test case runs automatically on next `cu test`
- [ ] Confirms total test case count after adding
- [ ] Accepts optional `cu add-test <slug>` to target any problem

#### Example Interaction

```
$ cu add-test
Adding custom test case to two-sum

Enter input:
> [0,0]\n0

Enter expected output:
> [0,1]

✓ Test case 4 added. (4 total — 2 sample, 2 custom)
```

---

## Epic 5 — Problem Context System

### Overview

The active problem system that allows all commands to work from
anywhere in the filesystem without cd-ing into problem folders.

---

### Story 5.1 — Active Problem Context Resolution

**As a** developer working from the workspace root,
**I want** all problem commands to automatically target my active problem,
**So that** I never need to cd into a problem folder to work.

#### Context Resolution Priority

Every problem-related command resolves its target in this exact order:

```
1. Explicit argument passed     →  cu test two-sum
2. cwd is a problem folder      →  cd two-sum && cu test
3. state.json activeProblem     →  cu test  (from workspace root)
4. No context found             →  error with suggestion
```

#### `state.json` Structure

```json
{
  "activeProblem": "two-sum",
  "lastSet": "2024-01-01T10:30:00"
}
```

#### Commands With Two Variants

| Without arg (uses context) | With arg (explicit)         |
|----------------------------|-----------------------------|
| `cu show`                  | `cu show <slug>`            |
| `cu test`                  | `cu test <slug>`            |
| `cu add-test`              | `cu add-test <slug>`        |
| `cu open`                  | `cu open <slug>`            |
| `cu clean`                 | `cu clean <slug>`           |

#### Error — No Context Found

```
$ cu test
✗ No active problem set.
  Run 'cu use <slug>' to set one, or pass a problem name:
  cu test <slug>
```

#### Acceptance Criteria

- [ ] `ContextResolver` module implements the four-step priority chain
- [ ] `cwd` detection checks for presence of `solution.cpp` in current dir
- [ ] If inside a subfolder of a problem folder, walk up one level and check
- [ ] `cu fetch` sets active problem in `state.json` automatically after fetch
- [ ] `cu use` sets active problem in `state.json`
- [ ] All problem commands call `ContextResolver::resolve()` before any work

---

### Story 5.2 — Stale Context Detection

**As a** developer,
**I want** cu to detect when the active problem folder no longer exists,
**So that** I get a clear warning instead of a confusing file-not-found error.

#### Acceptance Criteria

- [ ] On every command startup, verify the active problem folder exists
- [ ] If missing, print a warning and clear `activeProblem` in `state.json`
- [ ] Suggest running `cu use` to set a new active problem
- [ ] Do not crash — exit gracefully after the warning

#### Example Interaction

```
$ cu test
⚠ Active problem 'two-sum' folder not found in workspace.
  The folder may have been moved or deleted.
  Active problem has been cleared.
  Run 'cu use <slug>' to set a new active problem.
```

---

## Epic 6 — Workspace Navigation & Utility

### Overview

Commands for browsing, managing, and navigating the local workspace.

---

### Story 6.1 — List All Fetched Problems

**As a** developer,
**I want to** run `cu list`,
**So that** I can see all problems I have fetched with their status.

#### Acceptance Criteria

- [ ] Reads `.cuconfig/index.json` from the active workspace
- [ ] Displays slug, title, difficulty, and last test status per problem
- [ ] Active problem is visually highlighted with `▶`
- [ ] Supports `cu list --difficulty easy` filter
- [ ] Supports `cu list --status failing` filter
- [ ] Shows summary counts at the bottom

#### Example Interaction

```
$ cu list

  #   Slug                              Difficulty  Last Test
  ─────────────────────────────────────────────────────────
▶ 1   two-sum                           Easy        ✓ Pass
  2   longest-palindromic-substring     Medium      ✗ Fail
  3   binary-tree-level-order           Medium      — Untested
  4   merge-k-sorted-lists              Hard        ✓ Pass

4 problems  ·  2 passing  ·  1 failing  ·  1 untested
```

---

### Story 6.2 — Open Problem in Browser

**As a** developer,
**I want to** run `cu open`,
**So that** I can jump to the LeetCode problem page for submission
or discussion without manually typing the URL.

#### Acceptance Criteria

- [ ] Opens `https://leetcode.com/problems/<slug>/` in the default browser
- [ ] Resolves active problem via context resolution (Epic 5)
- [ ] Accepts `cu open <slug>` to open any problem directly
- [ ] Uses the correct system call per OS:
  - Windows → `start`
  - macOS   → `open`
  - Linux   → `xdg-open`

---

### Story 6.3 — Workspace Status Overview

**As a** developer,
**I want to** run `cu status`,
**So that** I can see a high-level summary of my progress across
all fetched problems in the active workspace.

#### Acceptance Criteria

- [ ] Shows active workspace path and name
- [ ] Shows active problem
- [ ] Shows total problems fetched
- [ ] Shows count of passing, failing, and untested problems
- [ ] Reads all data from `.cuconfig/index.json` and `state.json`

#### Example Interaction

```
$ cu status

cu workspace status

  Workspace     C:/Users/abhijeet/problems  (problems)
  Active        two-sum

  Total         12 problems
  Passing       8
  Failing       2
  Untested      2
```

---

### Story 6.4 — Clean Build Artifacts

**As a** developer,
**I want to** run `cu clean`,
**So that** compiled binaries are removed from problem folders
without touching my solution files.

#### Acceptance Criteria

- [ ] Deletes the compiled runner binary from the problem folder
- [ ] Does not touch `solution.cpp`, `problem.json`, or `tests.json`
- [ ] Resolves active problem via context resolution (Epic 5)
- [ ] Accepts `cu clean <slug>` to clean any specific problem
- [ ] `cu clean --all` cleans binaries from every problem folder
      in the active workspace
- [ ] Prints what was deleted and how much space was freed

#### Example Interaction

```
$ cu clean
✓ Removed build artifacts from two-sum (saved 284kb)

$ cu clean --all
✓ Cleaned 12 problem folders (saved 3.1mb)
```

---

## Non Functional Requirements

### Performance

- `cu fetch` must complete within 3 seconds on a normal connection
- `cu test` compilation must not add more than 1 second of overhead
- `cu list` must render within 200ms regardless of problem count
- `cu show` must render within 100ms (reads local file only)

### Reliability

- No command should ever leave partial files behind on failure
- All file writes use write-then-rename pattern to prevent corruption
- Every command exits with a non-zero code on failure
- `.cuconfig/index.json` is rebuilt from workspace folders if corrupted

### Cross Platform

- All features work identically on Windows (MinGW64), Linux, and macOS
- No platform-specific code outside of explicitly marked platform modules
- Path handling uses `std::filesystem::path` throughout, never raw strings
- Browser open command is gated behind OS detection at compile time

### Logging

- `--verbose` flag enables debug logging on any command
- Release builds show only user-facing messages
- Debug builds show full timestamps, file, and line number in logs
- spdlog is used as the logging backend via a thin `Logger` wrapper

### Error Messages

- Every error message states what went wrong
- Every error message suggests what to do next
- No raw exception messages or stack traces are shown to the user
- All errors are printed to `stderr`, normal output to `stdout`

---

## Out of Scope

These are explicitly not planned for the current version:

- Submitting solutions to LeetCode (requires session authentication)
- Support for languages other than C++
- A TUI (terminal UI) dashboard
- Syncing solutions to cloud storage
- Support for other competitive programming platforms
  (Codeforces, HackerRank, AtCoder etc.)
- IDE plugins or extensions
- Solution diff comparison between attempts

---

## Appendix — Command Reference Summary

### Problem Commands

| Command | Description |
|---|---|
| `cu fetch <slug or query>` | Download a problem into the active workspace |
| `cu show [slug]` | Print problem description in terminal |
| `cu test [slug]` | Compile and run all test cases |
| `cu add-test [slug]` | Add a custom test case interactively |
| `cu use <partial>` | Set active problem with partial name matching |
| `cu open [slug]` | Open problem page in default browser |
| `cu clean [slug]` | Remove compiled build artifacts |

### Workspace Commands

| Command | Description |
|---|---|
| `cu list` | List all problems in active workspace |
| `cu status` | Show workspace progress summary |
| `cu workspace list` | List all registered workspaces |
| `cu workspace use <name>` | Switch active workspace |
| `cu workspace remove <name>` | Unregister a workspace (does not delete folder) |

### Config Commands

| Command | Description |
|---|---|
| `cu init` | Initialize current directory as a workspace |
| `cu config show` | Print global config and active workspace state |
| `cu config set <key> <value>` | Update a config value |
| `cu config reset` | Delete global config and start fresh |

### Global Flags

| Flag | Description |
|---|---|
| `--help` / `-h` | Show help for any command |
| `--version` / `-v` | Print current version of cu |
| `--verbose` | Enable debug-level log output |
| `--dry-run` | Preview what a command would do without executing |