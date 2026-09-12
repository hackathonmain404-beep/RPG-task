# Performance

## Targets

Aim for a fast first meaningful render and responsive interactions.

## Frontend

- code-split non-critical routes
- lazy-load shop/history screens if useful
- optimize images
- avoid massive animation packages
- reduce unnecessary re-renders
- keep critical CSS lightweight

## Interaction

Task completion should feel immediate while the server confirms the mutation.

Use:
- optimistic visual state where safe
- skeletons
- disabled duplicate actions
- rollback/error presentation

## API

- paginate history
- avoid overfetching
- return compact dashboard payloads
- index common DB queries

## Database

Index:
- user task queries
- completion history
- activity log
- inventory

## Audit

Use Lighthouse on production.

Do not optimize numbers at the expense of correct behavior.
