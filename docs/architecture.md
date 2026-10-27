# Architecture

## Capture paths

| Path                                   | Platform | Status  |
| -------------------------------------- | -------- | ------- |
| Email forwarding to a per-user address | All      | Phase 3 |
| SMS via iOS Shortcuts                  | iPhone   | Phase 4 |
| Statement import (CSV/PDF)             | Web      | Phase 3 |
| Manual entry                           | Web      | Phase 2 |

No companion app: users rely on built-in phone features only.

## Data flow

```
email / sms ──► raw_events ──► parsers ──► transactions ◄── manual / import
                    │                          ▲
                    └── unsupported / failed ──┴── review queue
```

Every inbound message is stored unchanged in `raw_events` before parsing, so a parser can be
fixed and re-run without losing data. A transaction fingerprint (user, direction, amount,
5-minute bucket, account) deduplicates the same payment seen through two channels.

## Security model

- Row-level security on every user table: a user only ever sees their own rows.
- Roles live in `profiles.role` and reach the JWT through `custom_access_token_hook`.
  Users cannot change their own role (column-level grants).
- `public.is_super_admin()` requires both the `super_admin` role and an `aal2` session.
- Admins can read profiles and the audit log, never other users' transactions.
- `audit_logs` is append-only, enforced by a trigger that also blocks the table owner.
  Admin actions are written through `log_admin_action`, which requires a reason.
- The `/admin` route returns 404 to everyone except verified super admins.

## Parsers

`packages/parsers` holds one parser per provider and channel. Each starts as a placeholder that
recognises no sender and answers `awaiting-samples`. Real parsers replace placeholders once
redacted sample emails exist; see `packages/parsers/README.md`.

## Design system

Design tokens are exported from the Arus design system into `apps/web/design/tokens.json` and
compiled into CSS variables by `npm run tokens`. Components follow the design system's naming.
