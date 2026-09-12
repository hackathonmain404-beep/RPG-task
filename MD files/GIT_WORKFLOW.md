# Git Workflow

## Main

`main` must remain deployable.

## Branches

```text
Backend
Frontend
feat/auth
feat/tasks
feat/rpg
feat/streak
feat/attributes
feat/economy
feat/ui
feat/seo
feat/accessibility
fix/...
```

## Rules

- No direct experimental work on main
- Small commits
- Merge early
- Pull before beginning a new dependent task
- Update shared contracts with breaking changes

## Commit requirement

The official problem statement requires at least 3 chronological commits. Do not game this requirement with meaningless empty commits.

Aim for a clean real history with multiple meaningful changes.

## Suggested checkpoints

1. scaffold
2. auth
3. CRUD
4. RPG engine
5. economy
6. polish
7. deployment
8. final fixes
