---
name: translate-md
description: Sync bilingual markdown pairs. Usage: /translate-md [directory or file path] [--yes|-y]. Ensures every .md file has an English version (.md) and a Chinese version (_zh.md) side by side.
---

# Task

Ensure every `.md` file in the target path has a bilingual pair:

- `a.md` — always the **English** version
- `a_zh.md` — always the **Chinese** version

The user may provide a path as an argument (directory or single file). If no argument is given, use the current working directory. The optional `--yes` or `-y` flag skips the confirmation prompt.

# Steps

1. **Check for flags.** If the arguments contain `--yes` or `-y`, set `skip_confirm = true`. Otherwise `skip_confirm = false`.
2. **Determine the target path** from the user's argument (excluding flags), or default to the current working directory.
3. **Scan files.** If the path is a single `.md` file, collect just that file. If a directory, recursively collect all `.md` files.
4. **Skip any file whose name ends with `_zh.md`** — these are managed outputs, not inputs.
5. **Detect language for each qualifying file** — read the content and determine whether the primary language is Chinese or English.
   - **Case A** — content is Chinese: planned operations are `write: a_zh.md` + `overwrite: a.md → English`
   - **Case B** — content is English: planned operation is `write: a_zh.md` only (`a.md` unchanged)
6. **Preview and confirm** (skip this step if `skip_confirm = true`):
   - Print a preview of all planned operations, e.g.:
     ```
     Will process 3 files:

     [Case A] proposal.md (Chinese)
       write:     proposal_zh.md
       overwrite: proposal.md → English

     [Case B] design.md (English)
       write: design_zh.md

     [Case B] tasks.md (English)
       write: tasks_zh.md
     ```
   - Use the **AskUserQuestion tool** with options `["Yes, proceed", "No, cancel"]`.
   - If the user selects "No, cancel": print `Cancelled. No files written.` and exit.
7. **Execute** — for each qualifying file in order:
   - Print the filename being processed.
   - **Case A — content is Chinese:**
     1. Write the original Chinese content to `a_zh.md` (create or overwrite).
     2. Translate the content to English.
     3. Overwrite `a.md` with the English translation.
   - **Case B — content is English:**
     1. Translate the content to Chinese, save as `a_zh.md` (create or overwrite).
     2. Leave `a.md` unchanged.
   - In both cases, preserve all markdown syntax exactly:
     - Headings (`#`, `##`, etc.)
     - Links (`[text](url)`) — translate link text, keep URLs unchanged
     - Code blocks (` ``` `) — do NOT translate content inside code blocks
     - Inline code (`` `code` ``) — do NOT translate
     - Tables — translate cell text, keep table structure
     - Bold/italic markers
     - HTML tags if present
8. **Print a summary:**
   - Files processed: Case A count / Case B count
   - Files skipped (e.g. `_zh.md` inputs, oversized files)
   - List of created/updated file pairs

# Translation rules

- Translate only human-readable natural language text.
- Maintain the original tone and meaning.
- Do not alter markdown formatting characters.
- For frontmatter (YAML between `---`): translate values but keep keys unchanged.
- **Do NOT translate** any of the following — keep them as-is in the Chinese output:
  - Code, inline code, URLs, file paths
  - Technical terms, API names, library/framework names, protocol names, format names (e.g. JSON, REST, WebSocket, Docker, JWT, YAML, HTTP, SDK, CLI, LLM, RAG, etc.)
  - Command names, variable names, parameter names, function names
  - Proper nouns and brand names
  - Abbreviations and acronyms that are standard in the industry
- When in doubt whether a term is "technical", keep it in English.

# Constraints

- Skip files larger than 2MB.
- Process files sequentially.
- Print the filename being processed before each file.
