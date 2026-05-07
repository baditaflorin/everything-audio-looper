# Deploy

Live app:

https://baditaflorin.github.io/everything-audio-looper/

Repository:

https://github.com/baditaflorin/everything-audio-looper

## Publishing

GitHub Pages serves the `main` branch `/docs` directory.

Manual publish:

```sh
make build
git add docs package.json package-lock.json
git commit -m "chore: publish pages build"
git push origin main
```

## Rollback

Revert the publishing commit and push:

```sh
git revert <commit>
git push origin main
```

## Custom Domain

No custom domain is configured in v1. If one is added later, create `docs/CNAME`, point DNS at GitHub Pages, and update ADR 0010.

GitHub Pages DNS reference:

https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site

## Pages Gotchas

- Vite base path must stay `/everything-audio-looper/`.
- GitHub Pages does not support `_headers` or `_redirects`.
- The SPA fallback is `docs/404.html`.
- Service worker scope must stay under `/everything-audio-looper/`.

