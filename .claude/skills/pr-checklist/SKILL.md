---
name: pr-checklist
description: Runs the pre-PR checklist and generates a Pull Request description in English. Use this skill whenever the user asks to check a PR, review changes before merging, or prepare a branch for review.
---

# Pull Request Checklist

When this skill is invoked, inspect the modified files in the current branch and perform the following steps. **Always write your entire response and the final PR description in English**, regardless of the language used in the user's prompt.

1. **Automated Checks**: Verify that unit tests pass and ensure no leftover `console.log` statements, debug code, or unresolved `TODO` comments remain.
2. **Code Quality**: Check for edge cases, error handling, and adherence to project conventions.
3. **PR Description**: Generate a ready-to-paste Pull Request description in English using this exact template:

## What Changed
- [Bullet points summarizing the technical changes]

## How to Test
1. [Step-by-step instructions to verify the changes]

## Impact & Notes
- [Any breaking changes, migrations, or dependencies]
