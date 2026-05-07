# Contributing

Thanks for helping improve Everything Audio Looper.

## Local Setup

```sh
npm install
make install-hooks
make dev
```

## Commit Style

Use Conventional Commits:

```text
feat: add browser recorder
fix: clamp onset slice length
docs: expand deployment notes
```

## Checks

Before pushing, run:

```sh
make lint
make test
make build
make smoke
```
