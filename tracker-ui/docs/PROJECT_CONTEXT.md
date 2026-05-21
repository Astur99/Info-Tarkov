# Info Tarkov - Project Context

Last updated: 2026-05-21

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

`npm.cmd run lint` currently passes with no errors or warnings.

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

Email confirmation is currently disabled in Supabase because the email quota is too low for testing and public onboarding. Signup should create a session immediately and the UI should message "account created / session started" instead of asking the user to confirm email.

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
- `vite.config.js`
- `netlify.toml`
- `netlify/functions/pmc-profile.js`
- `src/lib/supabaseClient.js`
- `src/lib/moduleStateSync.js`
- `src/modules/`
- `src/components/ui/`
- `src/hooks/`
- `src/services/`

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
- `src/components/about/ChangelogView.jsx`
- `src/components/about/ProjectDossierView.jsx`
- `src/data/changelog.js`

Modules:

- `src/modules/maps/MapsView.jsx`
- `src/modules/kappa/KappaTree.jsx`
- `src/modules/kappa/QuestOptimizerModule.jsx`
- `src/modules/kappa/kappaApi.js`
- `src/modules/kappa/kappaData.js`
- `src/modules/kappa/kappaStorage.js`
- `src/modules/kappa/kappaUtils.js`
- `src/modules/story/StoryDecisions.jsx`
- `src/modules/bosses/BossesIntel.jsx`
- `src/modules/goons/GoonsTracker.jsx`
- `src/modules/flea/FleaTracker.jsx`
- `src/modules/hideout/HideoutModule.jsx`
- `src/modules/hideout/HideoutHeader.jsx`
- `src/modules/hideout/HideoutStationList.jsx`
- `src/modules/hideout/HideoutStationDetail.jsx`
- `src/modules/hideout/hideoutApi.js`
- `src/modules/hideout/hideoutStorage.js`
- `src/modules/hideout/hideoutUtils.js`
- `src/modules/armor/ArmorSimulator.jsx`
- `src/modules/prestige/PrestigeModule.jsx`
- `src/modules/keys/KeysModule.jsx`
- `src/modules/pmc/PmcProfileModule.jsx`
- `src/modules/live-events/LiveEvents.jsx`
- `src/modules/troubleshooting/TroubleshootingView.jsx`
- `src/modules/server-status/ServerStatus.jsx`

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

## Current Source Organization

Components and modules are now separated by responsibility:

```txt
src/components/
  about/
  admin/
  auth/
  communication/
  layout/
  ui/

src/modules/
  armor/
  bosses/
  flea/
  goons/
  hideout/
  kappa/
  keys/
  live-events/
  maps/
  pmc/
  prestige/
  server-status/
  story/
  troubleshooting/

src/hooks/
src/services/
```

`components/` is for app-wide UI, layout, auth/admin/about/communication surfaces. `modules/` is for domain modules opened from the home menu. `hooks/` and `services/` are prepared for the next cleanup phase, where repeated state and API logic will be extracted from large modules.

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

Admin-only internal documentation:

- `?view=project-dossier` renders `src/components/about/ProjectDossierView.jsx`.
- The bottom-left `DOSSIER` button is only shown when `userRole === 'admin'`.
- The route is also guarded in `App.jsx`, so non-admin users do not render the dossier even if they force the URL manually.

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

File: `src/modules/kappa/KappaTree.jsx`

Support files:

- `src/modules/kappa/kappaApi.js`
- `src/modules/kappa/kappaData.js`
- `src/modules/kappa/kappaStorage.js`
- `src/modules/kappa/kappaUtils.js`

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
- Collector data, trader config, local/cloud progress persistence and tarkov.dev queries are separated into helper files
- quest graph layout is derived through `buildQuestGraph` instead of being stored as separate state
- KappaTree no longer appears in the current ESLint error list; remaining lint debt is in other modules/components

Local storage keys:

- `sherpa_progreso_misiones_pvp`
- `sherpa_progreso_misiones_pve`
- `sherpa_modo_misiones_activo`
- `info_tarkov_collector_items_pvp`
- `info_tarkov_collector_items_pve`

Supabase table:

- `quest_progress`

### Decisiones / Finales

File: `src/modules/story/StoryDecisions.jsx`

Contains story/endings and point-of-no-return information.

### Intel: Bosses

File: `src/modules/bosses/BossesIntel.jsx`

Boss intelligence module with boss data, gear, locations, loot and weak points.

Features:

- boss search
- map filter
- difficulty filter
- visible target counter
- local boss images through Vite asset glob
- spawn chance breakdown per map from `tarkov.dev`
- tactical entry plan based on boss difficulty and local intel

### Tracker de Goons

File: `src/modules/goons/GoonsTracker.jsx`

Uses external tracker information and HTML parsing. Can break if source HTML changes.

### Flea Market Tracker

File: `src/modules/flea/FleaTracker.jsx`

Market/economy module for prices and profitability style workflows.

Features:

- PVP/PVE market switch
- uses `tarkov.dev` GraphQL `items(gameMode: regular)` for PVP prices
- uses `tarkov.dev` GraphQL `items(gameMode: pve)` for PVE prices
- hot-deal/anomaly radar per selected mode
- item search per selected mode
- selected item detail with historical price sparkline and trader sell values

### Gestion del Refugio

File: `src/modules/hideout/HideoutModule.jsx`

Support files:

- `src/modules/hideout/hideoutApi.js`
- `src/modules/hideout/hideoutStorage.js`
- `src/modules/hideout/hideoutUtils.js`
- `src/modules/hideout/HideoutHeader.jsx`
- `src/modules/hideout/HideoutStationList.jsx`
- `src/modules/hideout/HideoutStationDetail.jsx`

Hideout planning module.

Features:

- PVP/PVE market switch
- uses `tarkov.dev` GraphQL `hideoutStations(gameMode: regular)` for PVP prices
- uses `tarkov.dev` GraphQL `hideoutStations(gameMode: pve)` for PVE prices
- local checklist per mode/station/level for marking gathered item requirements
- cloud sync for checklist and built station levels when `user_module_state` exists
- built-level tracking per station
- total hideout progress and count of unlocked next upgrades
- pending budget subtracts already marked requirements
- labels item requirements as FIR when requirement attributes indicate found-in-raid
- shows required hideout stations/levels, trader requirements and skill requirements
- station sidebar is ordered by natural progression rather than alphabetically
- internal API/query logic is separated from the component in `hideoutApi.js`
- local/cloud persistence is separated in `hideoutStorage.js`
- pure helpers for storage keys, progress, availability, FIR detection, prices and formatting live in `hideoutUtils.js`
- header, station sidebar and station detail UI are separated into dedicated components while preserving the same visible interface
- Hideout no longer appears in the current ESLint error list; remaining lint debt is in other modules/components.

Local storage keys:

- `info_tarkov_hideout_items_pvp`
- `info_tarkov_hideout_items_pve`
- `info_tarkov_hideout_levels_pvp`
- `info_tarkov_hideout_levels_pve`

### Simulador Balistico

File: `src/modules/armor/ArmorSimulator.jsx`

Ballistics/armor simulator. ESLint reports some technical debt around effects and unused assignments.

### Prestigios

File: `src/modules/prestige/PrestigeModule.jsx`

Support file:

- `src/modules/prestige/prestigeData.js`

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
- visual insignia panel using `src/assets/prestiges/prestige_1.png` through `prestige_6.png`
- ES/EN i18n wiring for UI, requirement labels and reward labels
- separated prestige data/icons in `prestigeData.js` for easier maintenance and future languages
- optimized prestige insignias at practical in-app sizes to keep the bundle lighter

Image:

- `src/assets/backgrounds/prestigios.png`
- `src/assets/prestiges/prestige_1.png` through `prestige_6.png`

Data was checked against the official Escape From Tarkov Wiki prestige page.

### Sistema de Llaves

File: `src/modules/keys/KeysModule.jsx`

Tactical key search engine with a live catalog from `tarkov.dev` and a curated important-key intel layer.

Features:

- loads all key/keycard-like items from `tarkov.dev`
- PVP/PVE market switch for key prices through `items(gameMode)`
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

File: `src/modules/kappa/QuestOptimizerModule.jsx`

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

File: `src/modules/pmc/PmcProfileModule.jsx`

Module for summarizing player wipe status.

Features:

- uses the Tarkov username stored in `user_profiles` or Supabase Auth metadata
- separated PVP/PVE lookup
- includes an in-module search bar for looking up other indexed players without changing the account-linked username
- stores a small local search history under `info_tarkov_pmc_profile_history`
- uses static public JSON indexes instead of the Turnstile-protected search endpoint:
- PVP: `https://players.tarkov.dev/profile/index.json`
- PVE: `https://players.tarkov.dev/pve/index.json`
- fetches the resolved profile from `https://players.tarkov.dev/profile/{accountId}.json` or `/pve/{accountId}.json`
- calculates PMC level from experience with `https://json.tarkov.dev/regular/items` playerLevels by accumulating each level's required experience step, matching tarkov.dev behavior
- displays normalized public fields when available: nickname, level, faction, experience, PMC time, raids, survival rate, kills, deaths, PMC kills, prestige, account type, last active estimate, equipment, favorites, skills, all completed achievements, rare achievements and public updated time
- shows the top stat band as a wrapped responsive block, not as a horizontally scrolling strip
- includes sync status, top achievement in the main profile sheet, main tarkov.dev link in the search bar, AccID copy action and PNG public card export
- shows equipment as tactical slot cards and achievements as one full-width filtered panel with rare-achievement showcase
- has a clear error state if the player is not in the daily static index yet
- includes direct access to `https://tarkov.dev/players` so users can open/search a profile there before waiting for the static index update
- includes a manual refresh action

Support file:

- `src/modules/pmc/pmcApi.js`
- `netlify/functions/pmc-profile.js`

Local storage key:

- `info_tarkov_pmc_profile_mode`
- `info_tarkov_pmc_profile_history`

Image:

- `src/assets/backgrounds/pmc.png`

Production note:

- `/api/pmc-profile` is redirected by Netlify to `/.netlify/functions/pmc-profile`.
- `vite.config.js` also registers a local middleware for `/api/pmc-profile` during `npm.cmd run dev`.
- This proxy exists because `players.tarkov.dev` JSON responds server-side but may not expose browser CORS headers.
- `/api/pmc-profile` uses no-store cache headers and the frontend adds a timestamp query param so corrected profile calculations are not stuck behind stale browser/CDN cache.
- The Function must not parse the full PVP `players.tarkov.dev/profile/index.json` into an object. That index is large enough to inflate heap heavily in Netlify; resolve the accountId with text matching instead.
- The Function must not load full `json.tarkov.dev/regular/items`, `items_es` or translated task bundles in production. That caused Netlify `Runtime.OutOfMemory` / 502 on large PVP profiles.
- The production-safe path fetches the static profile first, extracts only visible/favorite item template IDs, then uses `api.tarkov.dev/graphql` for `playerLevels` and `items(ids: ...)`.
- Achievement metadata comes from the lighter static tasks endpoint plus English translations, avoiding the high-memory GraphQL achievements catalog path.
- The Function returns `allAchievements` for the complete player achievement table and `rareAchievements` limited to the most exclusive entries.

### Eventos en Directo

File: `src/modules/live-events/LiveEvents.jsx`

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

File: `src/modules/troubleshooting/TroubleshootingView.jsx`

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

## Changelog / Versioning

Files:

- `src/components/about/ChangelogView.jsx`
- `src/data/changelog.js`

Route:

- `?view=changelog`

Current app version:

- `0.14.11`

Behavior:

- Public ChangeLog is available from the home bottom-left button.
- Version entries are grouped as public product milestones rather than one entry per tiny commit.
- The technical rebuild is tracked as subversions `0.13.0` through `0.13.6` instead of one overloaded umbrella entry.
- The PMC account connection and global PVP/PVE preference are tracked as `0.14.0`.
- `0.14.1` documents the Turnstile limitation for automatic player extraction.
- `0.14.2` hardens registration usernames and admin user listing.
- `0.14.3` polishes no-email-verification signup, Admin Panel 2.0 filters/detail, and Account Hub.
- `0.14.4` switches PMC Profile to the static players.tarkov.dev indexes and public profile JSONs.
- `0.14.5` adds the PMC in-module player search and fixes level calculation to match tarkov.dev cumulative XP.
- `0.14.6` disables PMC profile caching and expands visible profile intel with last activity, account flags, skills, achievements, equipment and favorites.
- `0.14.7` compacts the PMC layout and fixes production 502/OutOfMemory by replacing full JSON catalog loads with targeted GraphQL calls.
- `0.14.8` removes horizontal scrolling from the PMC stat block, adds PMC search history/actions/export card, shows all completed achievements in a filtered panel while keeping rare achievements limited, and reduces PMC Function memory by matching the player index as text instead of parsing it fully.
- `0.14.9` adds visual Prestige insignias and transparent-background Prestige 4 asset.
- `0.14.10` removes the duplicated PMC tarkov.dev action button and keeps only Copy AccID / Export card in the lower actions panel.
- `0.14.11` cleans the Prestige module by separating data/icons, wiring UI copy to ES/EN i18n, optimizing prestige insignia assets, removing an accidental old App copy and adding a pre-production checklist.
- `APP_VERSION` in `src/data/changelog.js` should stay aligned with `package.json`.
- Changelog data is localization-ready: each entry stores text per language key (`es`, `en`, future `ru`, `de`, `fr`, `it`, etc.).
- While the app is beta, use `0.x` versions. Patch number for small fixes, minor number for visible features or module changes, and reserve `1.0.0` for the first stable public release.

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
- Prestige UI
- some shared text

Still pending:

- most internal module text
- admin panel
- major data-heavy modules such as PMC Profile, Keys, Bosses, Flea, Hideout and simulator

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
VITE_PUBLIC_SITE_URL
```

`VITE_PUBLIC_SITE_URL` is used for Supabase email confirmation redirects. It should be the public app origin, for example `https://infotarkov.com`. `Auth.jsx` falls back to `https://infotarkov.com` if the env var is missing, so email verification should not redirect to localhost from production signups.

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
- optional generic module sync table: `user_module_state`

SQL files:

- `docs/supabase-user-module-state.sql`
- `docs/supabase-user-profile-preferences.sql`
- `docs/PRE_PRODUCTION_CHECKLIST.md`

Run `supabase-user-module-state.sql` in Supabase to enable cloud sync for newer modules such as Hideout. Without it, those modules keep working locally and show a local/cloud warning.

Run `supabase-user-profile-preferences.sql` to add:

- `user_profiles.tarkov_username`
- `user_profiles.primary_game_mode`
- unique case-insensitive username indexes
- `is_username_available(candidate_username)`
- `handle_new_user_profile()` trigger for confirmed/unconfirmed signups
- updated `list_admin_users()` fallback to Auth metadata
- `admin_get_user_progress(target_user_id)` for Admin Panel user detail

Registration stores those values in Supabase Auth metadata as a fallback. The app also keeps the selected main mode in localStorage under `info_tarkov_default_game_mode`.

## Known Technical Debt

`npm.cmd run lint` currently passes with no errors or warnings after the `0.14.3` Account/Admin update. Re-run after the `0.14.8` PMC readability pass before deploy.

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
- Added PVP/PVE market mode switch to Flea Market Tracker.
- Added public Patch Notes / Changelog view and started versioning at `0.9.0`.
- Improved Hideout Management with PVP/PVE prices, item checklist, FIR labels and station/trader/skill requirements.
- Fixed Hideout FIR detection so normal buyable requirements are not marked FIR unless the API exposes an explicit positive found-in-raid attribute.
- Reordered Hideout station sidebar to follow natural construction progression instead of alphabetical order.
- Added Hideout 2.0 built-level tracking, total progress and unlocked/blocked upgrade status.
- Added generic `user_module_state` sync helper and SQL for cloud-syncing Hideout and PMC Profile.
- Added Bosses 2.0 difficulty filter, spawn breakdown by map and tactical entry plans.
- Added Hideout auto-checklist behavior: marking a station as built to level X marks material requirements for all levels up to X.
- Completed hybrid PVP/PVE pass: Keys now has PVP/PVE prices, PMC Profile stores separated PVP/PVE profiles and Prestige is explicitly marked PVP-only.
- Switched PMC Profile from the Turnstile-protected player search endpoint to the static `players.tarkov.dev` PVP/PVE profile indexes.
- Added PMC Profile search for other players and corrected level calculation using cumulative playerLevels XP.
- Expanded PMC Profile with no-cache sync, account flags, last activity estimate, skill levels, recent/rare achievements, visible equipment and favorites.
- Fixed production PMC Function memory usage by querying only required item IDs and compact achievement/player level data through GraphQL.
- Optimized Prestige insignia assets, removed an accidental old App copy, wired Prestige to i18n and added `docs/PRE_PRODUCTION_CHECKLIST.md`.

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
