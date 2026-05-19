# Info Tarkov - Project Context

Last updated: 2026-05-19

This document is the working context for continuing development in a fresh Codex/ChatGPT thread.

## Project

Info Tarkov is a modular intelligence hub for Escape From Tarkov. It is meant to centralize tactical information, player progression, quest planning, economy tools, boss intel, live events, server status, support tickets and future guidance features.

The project lives locally at:

```txt
C:\Users\juanc\Documents\Codex\Info Tarkov\tracker-ui
```

Use `npm.cmd` on Windows PowerShell:

```txt
npm.cmd run dev
npm.cmd run build
npm.cmd run lint
```

`npm.cmd run build` currently passes.

`npm.cmd run lint` currently reports pre-existing technical debt, mainly React hook lint rules and small cleanup issues. Build is the reliable verification command for now.

## Stack

Frontend:

- React
- Vite
- JavaScript
- Inline component styling plus global CSS variables in `src/index.css`
- `React.lazy` and `Suspense` for code splitting
- `i18next` and `react-i18next` for multilingual support

Backend:

- Supabase
- PostgreSQL
- Supabase Auth
- Row Level Security
- SQL RPC functions

Persistence:

- `localStorage` for guest mode and small local checklists
- Supabase for authenticated user data

Deploy target:

- Netlify

Repository workflow:

- Local project linked to GitHub
- Netlify deploy expected from GitHub

## Important Files

Main app:

- `src/App.jsx`
- `src/main.jsx`
- `src/lib/supabaseClient.js`

Global visual layer:

- `src/main.jsx` mounts `terminal-global-effects` before the app content.
- `src/index.css` owns the optimized tactical grid, static HUD glow, scanlines, hover scanner effects and reduced-motion fallback.
- Module root screens use `fade-in-slide terminal-panel` where applicable.
- Home menu cards use `terminal-module-card` for hover scanner effects.
- Performance note: the global visual layer was optimized after lag reports. Constant full-screen animations, blend/mask effects and animated noise were removed; most effects are static or hover-triggered.

Auth/admin/communication:

- `src/components/auth/Auth.jsx`
- `src/components/auth/AccountSettings.jsx`
- `src/components/admin/AdminPanel.jsx`
- `src/components/communication/UserMessages.jsx`

Layout/about:

- `src/components/layout/LanguageSwitcher.jsx`
- `src/components/about/AboutView.jsx`
- `src/components/about/AsturView.jsx`

Modules:

- `src/components/modules/MapsView.jsx`
- `src/components/modules/KappaTree.jsx`
- `src/components/modules/StoryDecisions.jsx`
- `src/components/modules/BossesIntel.jsx`
- `src/components/modules/GoonsTracker.jsx`
- `src/components/modules/FleaTracker.jsx`
- `src/components/modules/HideoutModule.jsx`
- `src/components/modules/ArmorSimulator.jsx`
- `src/components/modules/PrestigeModule.jsx`
- `src/components/modules/KeysModule.jsx`
- `src/components/modules/QuestOptimizerModule.jsx`
- `src/components/modules/LiveEvents.jsx`
- `src/components/modules/TroubleshootingView.jsx`
- `src/components/modules/ServerStatus.jsx`

Translations:

- `src/i18n/index.js`
- `src/i18n/languages.js`
- `src/i18n/locales/es.json`
- `src/i18n/locales/en.json`

Assets:

- `src/assets/backgrounds/`

Current known background files include:

- `bosses.png`
- `finales.png`
- `finales2.png`
- `flea.png`
- `goons.png`
- `hideout.png`
- `kappa.png`
- `liveevents.png`
- `llaves.png`
- `mapas.png`
- `pmc.png`
- `prestigios.png`
- `questoptimizer.png`
- `simulador.png`
- `troubleshooting.png`

## Current Component Organization

Components were reorganized from a flat `components/` folder into grouped folders:

```txt
src/components/
  about/
  admin/
  auth/
  communication/
  layout/
  modules/
```

This caused Git to show old component files as deleted and the new folders as untracked/moved. This is expected after the reorganization.

## App Navigation

`App.jsx` is still the central manual router.

Navigation uses:

- `currentView` React state
- `navigateToView(view)`
- `window.history.pushState`
- `window.history.replaceState`
- `popstate`

This means:

- Clicking a module writes `?view=module-id` into the URL.
- Browser Back returns to the app menu instead of leaving the app.
- Internal "back to menu" buttons replace history cleanly.
- Direct URLs like `?view=kappa`, `?view=keys`, `?view=about` work.

## Code Splitting

Modules and major views are lazy-loaded in `App.jsx`.

This removed the previous Vite warning about the main JS bundle being larger than 500 kB.

Current build still has a main chunk around 465 kB and separate module chunks.

## Current Home Menu Order

The intended current order is:

1. Mapas tacticos
2. Misiones / Kappa
3. Decisiones / Finales
4. Intel: Bosses
5. Tracker de Goons
6. Flea Market Tracker
7. Gestion del Refugio
8. Simulador Balistico
9. Prestigios
10. Sistema de Llaves
11. Perfil de PMC
12. Eventos en Directo
13. Troubleshooting

Eventos en directo should be immediately before Troubleshooting.

## Current Modules

### Mapas tacticos

Module for map consultation. Intended to grow into tactical maps with extra layers for extracts, quests, loot, danger zones and keys.

### Misiones / Kappa

File: `src/components/modules/KappaTree.jsx`

Uses `tarkov.dev` GraphQL to load tasks.

Features:

- PVP/PVE progress separation
- localStorage guest persistence
- Supabase persistence when authenticated
- quest completion
- branch autocompletion
- branch unmarking
- Kappa filtering
- pending-only filtering
- per-trader quest tree
- Collector/Fence subpanel for Kappa item checklist
- local Collector item checklist separated by PVP/PVE
- 42 Collector/Kappa required items based on the current Collector handover list
- attempts to load Collector item icons/wiki data from `tarkov.dev`

Local storage keys:

- `sherpa_progreso_misiones_pvp`
- `sherpa_progreso_misiones_pve`
- `sherpa_modo_misiones_activo`
- `info_tarkov_collector_items_pvp`
- `info_tarkov_collector_items_pve`

Supabase table:

- `quest_progress`

### Decisiones / Finales

File: `src/components/modules/StoryDecisions.jsx`

Contains story/endings and point-of-no-return information.

### Intel: Bosses

File: `src/components/modules/BossesIntel.jsx`

Boss intelligence module with boss data, gear, locations, loot and weak points.

### Tracker de Goons

File: `src/components/modules/GoonsTracker.jsx`

Uses external tracker information and HTML parsing. Can break if source HTML changes.

### Flea Market Tracker

File: `src/components/modules/FleaTracker.jsx`

Market/economy module for prices and profitability style workflows.

### Gestion del Refugio

File: `src/components/modules/HideoutModule.jsx`

Hideout planning module. ESLint currently flags a fallback helper ordering issue, but build passes.

### Simulador Balistico

File: `src/components/modules/ArmorSimulator.jsx`

Ballistics/armor simulator. ESLint reports some technical debt around effects and unused assignments.

### Prestigios

File: `src/components/modules/PrestigeModule.jsx`

New module for prestige requirements.

Features:

- Prestige 1 to 6
- PMC level requirement
- money requirement
- quests
- story requirements
- skills
- hideout requirements
- rewards
- local checklist per requirement
- progress percentage

Image:

- `src/assets/backgrounds/prestigios.png`

Data was checked against the official Escape From Tarkov Wiki prestige page.

### Sistema de Llaves

File: `src/components/modules/KeysModule.jsx`

Tactical key search engine with a live catalog from `tarkov.dev` and a curated important-key intel layer.

Features:

- loads all key/keycard-like items from `tarkov.dev`
- fallback curated key set if external API fails
- search by key, quest, map, tag, recommendation
- filter by map
- filter by category
- important-key filter
- important keys first toggle
- priority labels
- icon, wiki link, price and item size when available
- usage and recommendation notes

Image:

- `src/assets/backgrounds/llaves.png`

This module is intentionally prepared to grow into a full key database.

### Quest Optimizer

File: `src/components/modules/QuestOptimizerModule.jsx`

Subtool integrated inside `Misiones / Kappa` for recommending the best map for the next raid. It is no longer shown as a standalone home card.

Features:

- reads mode PVP/PVE
- reads local KappaTree progress when guest
- reads Supabase `quest_progress` when logged in
- fetches tasks from `tarkov.dev` GraphQL
- groups pending quests by map
- scores maps based on pending quest density and Kappa tasks
- shows principal recommendation
- shows suggested quests, involved traders and key hints
- has fallback curated plans if tarkov.dev fails

Route compatibility:

- `?view=quest-optimizer` still opens KappaTree directly in the Quest Optimizer subtool.

### Perfil de PMC

File: `src/components/modules/PmcProfileModule.jsx`

New local-first module for summarizing player wipe status.

Features:

- localStorage guest persistence
- PMC nickname/callsign
- faction and PVP/PVE mode
- level, survival rate, raids, stash value, completed quests, Kappa items and hideout progress
- main objective selection: Kappa, Lightkeeper, Prestige, Economy
- weighted progress score
- tactical next-priority recommendations

Local storage key:

- `info_tarkov_pmc_profile`

Image:

- `src/assets/backgrounds/pmc.png`

### Eventos en Directo

File: `src/components/modules/LiveEvents.jsx`

Detects active/recent Tarkov events from `tarkov-dev/tarkovdata`.

Current behavior:

- reads direct raw GitHub source first
- tries jsDelivr CDN as secondary source
- tries AllOrigins proxy as a last automatic fallback
- normalizes array/object payload shapes
- classifies events as active, recent, ended or reference
- does not force stale manual events as active
- supports date-bounded verified manual events when automatic feeds miss an active event
- shows a manual reference link if all automatic sources fail
- includes visible counters for active/recent/ended events

Current verified manual event:

- `Full Speed Ahead`, active from 2026-05-15 through 2026-05-21, added because tarkovdata may miss it.

### Troubleshooting

File: `src/components/modules/TroubleshootingView.jsx`

Known issues and current technical/user-facing limitations.

Recently updated with:

- Kappa shared-search limitations
- guest localStorage persistence
- external API dependency
- Goons HTML parsing fragility
- partial i18n rollout
- lint technical debt
- Hideout fallback lint issue

This is not included in the About module explanations because it is support/diagnostic rather than a main Intel tool.

## Auth

File: `src/components/auth/Auth.jsx`

Features:

- email/password login
- email/password registration
- password requirements
- red/green checklist for requirements
- translated via i18n
- back to menu button

Password requirements:

- at least 8 chars
- uppercase
- lowercase
- number
- symbol

## Account Settings

File: `src/components/auth/AccountSettings.jsx`

Features:

- configure username
- username must be unique
- change password
- delete own account

Delete account uses Supabase RPC:

- `delete_own_account()`

The account deletion removes the user from `auth.users`, and related rows should cascade where configured.

## Roles / Owner

Admin/owner email:

```txt
juancarfele@gmail.com
```

Owner username used in UI:

```txt
Astur
```

Owner should be irrevocable:

- no remove-admin button for owner
- no delete owner
- no message/actions against owner
- show gold OWNER label

## Admin Panel

File: `src/components/admin/AdminPanel.jsx`

Features:

- app metrics
- visits total/today
- registered users
- online users
- user list
- role management
- delete users
- support tickets
- replies
- status changes
- global ticket deletion

Ticket action buttons were recently improved:

- current status is disabled with solid dot
- inactive status buttons use hollow dot and action labels
- reply button says "Responder al usuario"
- delete button says "Borrar para todos"

## Ticketing / Report System

User module:

- `src/components/communication/UserMessages.jsx`

Admin module:

- `src/components/admin/AdminPanel.jsx`

User flow:

- create ticket
- type: bug / suggestion / other
- subject + body
- see own tickets
- expand each ticket as a thread
- reply while not closed
- close ticket
- delete from own list only

Admin flow:

- list all feedback
- see replies in thread
- change status: open / reviewing / closed
- reply to user
- delete ticket globally

Tables/functions expected:

- `user_feedback`
- `feedback_replies`
- `reply_own_feedback(feedback_id, reply_body)`
- `close_own_feedback(feedback_id)`
- `delete_own_feedback(feedback_id)`
- `list_admin_feedback()`
- `admin_update_feedback_status(feedback_id, next_status)`
- `admin_reply_feedback(feedback_id, reply_body)`
- `admin_delete_feedback(feedback_id)`

## About / Astur

About:

- `src/components/about/AboutView.jsx`
- reached from `ABOUT` button bottom-left
- URL: `?view=about`

About explains:

- what Info Tarkov is
- what users can do
- user system
- admin panel
- ticket system
- frontend architecture
- backend/persistence
- technologies
- current state
- only main user-facing tools from the menu, not internal/admin/support modules

Astur:

- `src/components/about/AsturView.jsx`
- reached from `BY ASTUR` bottom-right
- URL: `?view=astur`

Social links:

- Twitch: `https://www.twitch.tv/AsturTV`
- X: `https://x.com/juankar_hh`
- Instagram: `https://www.instagram.com/juankar_hh/`

## i18n

Base multilingual support exists.

Currently translated:

- home menu
- login/register
- report/ticket UI
- Misiones / Kappa main UI and Collector checklist UI
- Account settings UI
- Server status UI
- Troubleshooting UI
- Live events UI
- some shared text

Still pending:

- most internal module text
- admin panel
- major data-heavy modules such as PMC Profile, Keys, Bosses, Flea, Hideout, Prestige and simulator

Approach:

- Use `useTranslation()`
- Store translations in `src/i18n/locales/es.json` and `en.json`
- Keep supported language metadata in `src/i18n/languages.js`; adding future languages should be a new locale JSON import/resource plus one `languageOptions` entry.
- Use interpolation placeholders such as `{{mode}}`, `{{count}}`, `{{total}}` instead of assembling translated phrases manually in components.
- New or edited UI components should avoid hardcoded user-facing strings. Prefer `common.*` for repeated labels and module namespaces such as `account.*`, `serverStatus.*`, `kappa.*`.
- Keep proper nouns like bosses, maps, quest names and items in their official names unless there is a strong reason to translate.

## Supabase Notes

Client file:

- `src/lib/supabaseClient.js`

There was previously a hardcoded fallback URL/key. It should eventually be removed once env vars are fully stable in local/Netlify.

Expected env vars:

```txt
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

Known major tables/RPCs used:

- `quest_progress`
- `user_roles`
- `user_profiles`
- `app_visits`
- `app_active_sessions`
- `user_feedback`
- `feedback_replies`
- admin stats/list users RPCs
- ticket RPCs listed above
- account deletion RPC

## Known Technical Debt

`npm.cmd run lint` currently reports:

- `react-hooks/set-state-in-effect` in several modules
- missing effect dependencies
- `HideoutModule` fallback helper referenced before declaration
- `ArmorSimulator` unused assignments

This does not block build, but should be cleaned before serious public launch.

## Recent Completed Work

- Reorganized components into folders.
- Added lazy loading/code splitting.
- Fixed browser Back button behavior with `history.pushState`.
- Added About page.
- Added Astur social page.
- Added Prestige module with checklist.
- Added Keys module.
- Added Quest Optimizer module, now integrated inside KappaTree.
- Added PMC Profile module.
- Added images:
  - `prestigios.png`
  - `llaves.png`
  - `questoptimizer.png`
  - `pmc.png`
- Improved Admin ticket buttons.
- Updated Troubleshooting.
- Updated About to explain only main user-facing tools.

## Next Good Steps

Recommended next work:

1. Test ticketing in browser with one user and admin side by side.
2. Test ticketing in browser with one user and admin side by side.
3. Expand `KeysModule` data or move key data into a separate data file.
4. Improve `QuestOptimizerModule` with better task-map detection if `tarkov.dev` schema supports richer map/objective data.
5. Start syncing PMC Profile with authenticated accounts.
6. Continue i18n phase 2: AccountSettings, AdminPanel, ServerStatus, Troubleshooting, LiveEvents.
7. Clean lint debt module by module.

## Important Behavior To Preserve

- Do not break KappaTree branch completion/uncompletion logic.
- Do not remove guest mode.
- Do not make login mandatory.
- Keep owner immutable.
- Keep admin-only Admin button.
- Keep Report hidden from admins.
- Keep browser Back behavior inside the app.
- Keep lazy loading/code splitting.
- Keep module card image system with `bgImage` and `imagePosition`.
