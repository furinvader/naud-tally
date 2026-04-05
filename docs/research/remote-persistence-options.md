# Remote Persistence Options

## Goal

Compare simple remote persistence approaches for the host-operated pilot so the app can recover after reinstall, replacement-device setup, or connection loss without losing the local-first workflow.

## Product Constraints

- The host must be able to keep working offline on the tablet.
- The app already saves state locally first.
- The remote solution should be simple for the host to set up.
- Reconnect sync should happen after connectivity returns.
- Same-device reload recovery is not enough anymore.
- Simultaneous multi-tablet live collaboration is not required for the current pilot.

## Option 1: Google Sheets as the Primary Remote Store

### Why it is attractive

- A yearly spreadsheet is easy for a host to understand.
- The data is human-readable outside the app.
- Sheets could double as a manual export or reporting surface.

### Main drawbacks

- Browser use still requires Google Cloud setup, OAuth client setup, an API key, and browser access tokens through Google Identity Services.
- Sheets supports append and update operations, but it is still a spreadsheet API rather than an app-sync engine.
- Offline replay, duplicate writes, row identity, and conflict handling would all need app-specific rules.
- Data modeling for open tabs, billed tabs, and live catalog changes becomes more fragile when represented as spreadsheet rows.
- Quotas and spreadsheet shape changes become operational concerns.

### Fit for this project

- Good fit for backup, export, or reporting.
- Weak fit for primary bidirectional app sync.

### Official references

- [Google Sheets JavaScript quickstart](https://developers.google.com/workspace/sheets/api/quickstart/js)
- [Google Identity Services for web apps](https://developers.google.com/identity/oauth2/web/guides/overview)
- [Read and write cell values](https://developers.google.com/workspace/sheets/api/guides/values)
- [Google Sheets API usage limits](https://developers.google.com/workspace/sheets/api/limits)

## Option 2: Firestore-Style App Database With Web Offline Support

### Why it is attractive

- It is designed for app data, not spreadsheets.
- The official web SDK supports offline persistence and later resync behavior.
- Guest tabs, billed history, and product catalog records map more naturally to documents than to spreadsheet rows.
- Restore on a replacement device aligns better with an app database than with a manual spreadsheet workflow.

### Main drawbacks

- It still requires project setup, authentication choices, and security rules.
- The team must define conflict handling, data ownership, and retention for guest-identifying data.
- It introduces platform dependency and billing or quota considerations.

### Fit for this project

- Strong fit for primary remote sync and recovery.
- Better technical match than Google Sheets if remote sync is now a product requirement.

### Official references

- [Firestore web offline persistence](https://firebase.google.com/docs/firestore/manage-data/enable-offline)
- [Firestore data model](https://firebase.google.com/docs/firestore/data-model)

## Option 3: Custom Backend and Database

### Why it is attractive

- Full control over data model, hosting, retention, and security.
- Easier to self-host if that becomes a hard requirement later.

### Main drawbacks

- Highest implementation and operations cost.
- The team would need to design auth, sync protocol, retries, conflict handling, backups, and restore flows from scratch.
- This is the slowest path for a small pilot that still wants to stay easy to set up.

### Fit for this project

- Best only if policy, ownership, or product constraints rule out managed services.
- Not the simplest next step for the current pilot.

## Recommendation

- Use a Firestore-style app database as the leading option for primary remote sync and recovery.
- Keep Google Sheets as a secondary option for backup, export, or reporting rather than as the primary sync engine.
- Avoid building a custom backend first unless a strong ownership or compliance requirement appears.

## Required Design Decisions Before Implementation

- how the host authenticates or connects the tablet to the remote store
- whether one venue, one season, or one calendar year maps to the top-level data partition
- how open tabs, billed tabs, and product catalog changes are identified and versioned
- what conflict rule applies during reconnect or restore
- whether restore is automatic on sign-in or explicit through a recovery action
- how long guest-identifying data should remain in remote storage

## Suggested Default Direction

- Keep local storage as the first write path for responsiveness and offline resilience.
- Add PWA support separately from sync work; a service worker alone will not solve recovery on a new device.
- Plan the sync layer around idempotent records, stable IDs, timestamps, and explicit recovery rules.
- If a spreadsheet is still desired, generate it from synced data or use it as an export target instead of making it the source of truth.
