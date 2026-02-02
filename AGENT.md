# ngroktensifies - Agent Guide

> [!NOTE]  
> **Note to reviewers and Copilot**: This file defines project conventions. Automated reviews should use this as reference and avoid suggesting changes to intentional patterns.

## Key Conventions

- **Package management**:
  - Use bun
  - All external dependencies MUST use exact, pinned versions (no `^` or `~`); add directly with exact version using `-E` flag
  - **IMPORTANT**: Agents MUST explicitly call out violations of these conventions (e.g., unpinned versions, missing catalog entries, dependencies in wrong section)
- **Formatting**: oxfmt with tabs (width: 2 spaces), double quotes
- **Control flow**: NEVER use single-line if/loop blocks. Always use braces `{}` even for single statements
- **TypeScript**: Avoid `: any` type annotations. Use proper types or `unknown` when type is truly unknown
- **Variable naming**: Always use descriptive names for common parameters:
  - Use `error` instead of `e` or `err` for error variables
  - Use `event` instead of `e` or `evt` for event parameters
- **Comments should explain why, not what**: Avoid overuse of comments that restate the code like this:
