# @arus/parsers

Turns forwarded bank and e-wallet messages into transaction drafts.

Each provider and channel has its own parser in `src/providers/<provider>/<channel>.ts`.
Every parser starts as a placeholder: it recognises nothing until its sender list is filled
and always answers `awaiting-samples`.

## Adding a real parser

1. Put redacted samples in `fixtures/<provider>/<channel>/` (see the redaction rules in the
   project's email validation doc). Raw `.eml` files are git-ignored.
2. Fill `senders` with the verified sender addresses or `@domain` entries.
3. Replace `placeholderParser` with a parser that returns `parsed` drafts, using
   `parseRupiah` and `toPlainText`.
4. Add a test that runs every fixture in that folder.

Parsers must stay free of Node and browser APIs so the same code runs in Next.js and in
Supabase Edge Functions.
