# DevTrail — starter project

> A developer's trail on every work item. Log blockers, solutions and progress as styled markdown cards on Azure Boards.

This starter implements **build-order steps 1–4**: the extension skeleton, the read path (existing comments rendered as cards), the card styling with the four-tag system, and the write path (markdown composer with preview, assignee-only gating). Still to come: inline image upload (step 5), filter/export and Marketplace polish (step 6).

## Project layout

```
devtrail/
├── vss-extension.json          # Extension manifest (contribution, scopes, files)
├── overview.md                 # Marketplace description page
├── package.json                # Scripts + dependencies
├── webpack.config.js
├── tsconfig.json
├── static/img/logo.png         # Extension icon
└── src/DevTrail/
    ├── DevTrail.html           # Iframe host page
    ├── DevTrail.tsx            # Entry: SDK init + form events
    ├── App.tsx                 # Load trail, assignee gate, post
    ├── tags.ts                 # The 4-tag system ([BLOCAGE]…) + detection
    ├── markdown.ts             # marked + DOMPurify (md → safe HTML)
    ├── i18n.ts                 # FR/EN strings, auto-detected
    ├── styles.css              # Native-ADO-looking card design
    └── components/
        ├── CommentCard.tsx     # Colored-border history card
        └── Composer.tsx        # Tag dropdown + write/preview tabs
```

## 1. Prerequisites

- Node.js ≥ 18
- A [Marketplace publisher](https://marketplace.visualstudio.com/manage) (free) — note your **publisher ID**
- An Azure DevOps org for testing (e.g. your `testdevops` org)

## 2. Setup

```bash
npm install
```

Edit `vss-extension.json` and replace `YOUR-PUBLISHER-ID` with your real publisher ID.

## 3. Build & package

```bash
npm run build        # webpack → dist/
npm run package      # builds + creates out/<publisher>.devtrail-0.1.0.vsix
```

(`npm run package:dev` auto-increments the patch version — handy while iterating.)

## 4. Publish privately & test

1. Upload the `.vsix` at <https://marketplace.visualstudio.com/manage> (it stays **private** because `"public": false`).
2. On the extension's page, **Share** it with your test organization.
3. In the org: **Organization settings → Extensions → Shared → Install**.
4. Open any work item: the **DevTrail** group appears on the form. Assign the item to yourself to see the composer; post a card.

Tip: comments posted by DevTrail also appear in the native Discussion section — that's by design (native storage, no lock-in).

## 5. Going public (later)

When v1 is ready: set `"public": true`, add screenshots + a proper `overview.md`, bump the version, `npm run package`, upload. Microsoft validates public extensions before listing.

## How the tag system works

The selected type is stored *inside* the comment as a leading marker — e.g. `<p><strong>[BLOCAGE]</strong></p>` — so the type survives everywhere: native Discussion, exports, and DevTrail's cards (which parse the marker to pick border color + icon). A comment without a recognized marker falls back to **green / Progress** ("everything good"). Both FR and EN markers are recognized (`[BLOCKER]` ≡ `[BLOCAGE]`, `[PROGRESS]` ≡ `[AVANCEMENT]`).

## Roadmap (matches the agreed build order)

- [x] 1. Skeleton — manifest + form group loading on the work item
- [x] 2. Read path — native comments rendered as cards
- [x] 3. Card styling — colored border, icon, author/date, tag detection
- [x] 4. Write path — markdown + preview, post as native comment, assignee-only
- [ ] 5. Images — upload via attachments API + inline `<img>` embed
- [ ] 6. Filter (author / date / type) + export (MD/CSV), FR/EN polish, public listing
