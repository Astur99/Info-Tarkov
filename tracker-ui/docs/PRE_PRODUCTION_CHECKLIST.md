# Info Tarkov - Pre-production Checklist

Use this checklist before copying the Codex workspace to the desktop project and deploying from GitHub/Netlify.

## 1. Local sanity

- Confirm you are working in `C:\Users\juanc\Documents\Codex\Info Tarkov\tracker-ui`.
- Review pending changes with `git status --short`.
- Make sure `src/data/changelog.js`, `package.json` and `package-lock.json` share the same version.
- Confirm the latest ChangeLog entry explains the user-facing changes.

## 2. Required commands

Run from `tracker-ui`:

```txt
npm.cmd run lint
npm.cmd run build
```

Both commands should pass before deployment.

## 3. Local smoke test

Open the app locally and check:

- Home menu loads without broken cards or missing images.
- Login/register flow still works without email verification.
- Account page saves username and main mode.
- Changelog opens and shows the latest version.
- Dossier is only visible for admin users.
- PMC Profile works in PVP and PVE for at least one known indexed player.
- Hideout switches PVP/PVE and keeps checklist/built levels.
- Kappa opens centered and Collector checklist still opens correctly.
- Prestige shows each level and its insignia.

## 4. Netlify Function smoke test

If PMC Profile was touched, test the function locally before deploy:

```txt
node -e "import('./netlify/functions/pmc-profile.js').then(async ({handler})=>{const r=await handler({queryStringParameters:{username:'Astur_',mode:'PVP'}}); console.log(r.statusCode); console.log(r.body.slice(0,300));})"
```

Expected: status `200` for an indexed player, no OutOfMemory behavior, and a compact JSON response.

## 5. Sync to desktop project

Preferred manual sync target:

```txt
C:\Users\juanc\OneDrive\Escritorio\Info Tarkov
```

Recommended approach: use a mirror/copy tool carefully and exclude generated folders such as `node_modules` and `dist`. Do not overwrite `.git` unless you intentionally want to replace repository metadata.

## 6. Post-deploy smoke test

After Netlify deploy:

- Open `https://infotarkov.com`.
- Check Home, Login, Account, ChangeLog and About.
- Open PMC Profile PVP and PVE.
- Open Flea, Hideout, Kappa and Prestige.
- Confirm `/api/pmc-profile?username=Astur_&mode=PVP` does not return `502`.
