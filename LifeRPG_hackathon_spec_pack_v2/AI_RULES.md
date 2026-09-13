# AI Agent Rules

## Primary principle

AI agents accelerate implementation. Humans own architecture, scope, claims and final verification.

## Before editing

Every agent must:
1. read relevant specs
2. inspect current implementation
3. identify files to change
4. identify dependencies
5. avoid unrelated changes

## Required behavior

Agents must:
- preserve working code
- explain unfamiliar concepts to beginner developers
- add tests for domain logic
- report files changed
- report commands/tests run
- report limitations

## Forbidden

Do not:
- rewrite entire repo casually
- remove tests to make builds pass
- invent APIs
- change database schema silently
- trust client progression values
- use localStorage as primary persistence
- hardcode production secrets
- invent SEO claims
- fabricate user counts/reviews
- create fake persistence
- add major features during final QA

## RPG rule

Never allow frontend code to become authoritative for:
- XP
- Gold
- Level
- Attributes
- Streak
- Inventory

## Database rule

Any mutation affecting multiple records must consider a transaction.

## AI-generated code review

Human team must review:
- auth
- session
- DB permissions
- reward transaction
- purchase transaction
- environment config

## Beginner-support mode

When using a technology the team does not understand:
- explain what it does
- explain why it is needed
- show minimal implementation
- create a test
