# UI Contract For Pricing Screens

This project uses a shared CSS contract so CAMS, Margin Funding, and future screens match consistently.

## 1) CSS Layering (mandatory)

- `src/main/resources/static/css/base.css`
  - Global reset, box model, base typography, global body/background only.
- `src/main/resources/static/css/layout.css`
  - App shell structure (`.app-shell`, `.content`, responsive shell behavior).
- `src/main/resources/static/css/header.css`
  - Header-only styles.
- `src/main/resources/static/css/sidebar.css`
  - Sidebar-only styles.
- `src/main/resources/static/css/page-header.css`
  - Reusable page header/breadcrumb blocks.
- `src/main/resources/static/css/grid.css`
  - AG Grid shared theme + cell/filter/pagination styles.
- `src/main/resources/static/css/grid-manager.css`
  - Shared Grid Manager bar/dropdowns/modal/toast styles.
- `src/main/resources/static/css/grid-page.css`
  - Shared page-level grid layout rules used by both CAMS and Margin Funding.
- Screen CSS files (example: `pricing-inquiry.css`)
  - Screen-specific UI only. Do not redefine shared shell/header/sidebar/grid-manager behavior here.

## 2) Template inclusion rules

Every pricing screen must include:

- `${ctx}/css/app.css`
- `${ctx}/css/grid.css` (if AG Grid page)
- `${ctx}/css/grid-manager.css` (if Grid Manager macro used)
- `${ctx}/css/grid-page.css` (if AG Grid page using shell layout)

Do not include `header.css`, `layout.css`, `sidebar.css`, `page-header.css` directly in screens that already include `app.css`.

## 3) Markup contract for AG Grid screens

- `<body class="cams-page">` or `<body class="mfi-page">` (screen scope class required).
- Grid container must use:
  - `class="ag-theme-alpine app-grid"`
- Grid Manager should come from:
  - `src/main/resources/templates/components/grid-manager-macro.ftl`

## 4) JS contract

- Create grids via `DynamicGrid.createGrid(config)` only.
- Initialize manager after grid creation:
  - `GridManager.init(window.gridApi, '<gridElementId>')`
- Do not create alternate grid-manager DOM/JS implementations per screen.

## 5) PR checklist for UI parity

- No duplicate style definitions for `.app-shell`, `.content`, `.sidebar`, `.gm-*`, `.ag-theme-alpine`.
- No inline size styles for grid containers (use `.app-grid`).
- 100% zoom screenshot proof for:
  - CAMS Eligibility
  - Margin Funding Item Maintenance
- Validate:
  - Header fixed and aligned
  - Sidebar not overlapping content unexpectedly
  - Grid area fills content card without clipping
  - Grid Manager dropdowns visible and clickable

## 6) Asset cache strategy (team rule)

- Do not commit manual `?v=` query-string bumps in template asset links by default.
- During local debugging only, temporary `?v=` bumps are allowed to force browser refresh.
- Before commit/PR, remove temporary `?v=` bumps and keep clean asset paths.
- Long term preferred approach is build-time fingerprinting/hashed asset filenames.

## 7) New grid screen starter (copy vs reuse)

When building a new grid-based pricing screen, use this pattern.

### Copy these per new screen

- Screen template (rename and edit):
  - `src/main/resources/templates/pricing/margin-funding-maintenance.ftl`
- Screen JS (rename and edit):
  - `src/main/resources/static/js/margin-funding-maintenance.js`
- Screen CSS only if needed (rename and keep minimal):
  - `src/main/resources/static/css/margin-funding-maintenance.css`

### Reuse these shared files (do not copy)

- Toolbar macro:
  - `src/main/resources/templates/components/action-toolbar.ftl`
- Grid Manager macro:
  - `src/main/resources/templates/components/grid-manager-macro.ftl`
- Shared grid engine:
  - `src/main/resources/static/js/dynamic-grid.js`
- Shared Grid Manager behavior:
  - `src/main/resources/static/js/grid-manager.js`
- Shared toolbar behavior (density/download):
  - `src/main/resources/static/js/grid-toolbar.js`
- Shared toolbar styling:
  - `src/main/resources/static/css/action-toolbar.css`
- Shared grid/layout styling:
  - `src/main/resources/static/css/grid.css`
  - `src/main/resources/static/css/grid-manager.css`
  - `src/main/resources/static/css/grid-page.css`
  - `src/main/resources/static/css/app.css`

### What to customize in the new screen

- In screen FTL:
  - `actionItems` list (which toolbar buttons to show, labels, icon SVG, order)
  - Grid title/breadcrumb text
  - Grid id
- In screen JS:
  - API endpoint
  - Column definitions
  - CSV export filename
  - Grid manager init grid id
  - Any screen-specific actions
- In screen CSS:
  - Only true screen-specific overrides; do not duplicate shared toolbar/grid/layout rules.

### Important convention

- Keep button declaration per screen, but keep rendering/behavior shared.
- Class naming for shared toolbar controls is generic `gt-*` (not screen-specific prefixes).

## 8) How it works (end-to-end flow)

Use this to explain the architecture quickly to other devs.

1. Screen loads
- Screen FTL imports shared macros and defines screen-specific config:
  - toolbar `actionItems`
  - grid container id
  - page text (title/breadcrumb)

2. Shared toolbar renders UI
- `components/action-toolbar.ftl` renders the toolbar from `actionItems`.
- Right section hosts shared grid manager + view controls (density/download).

3. Screen JS creates the grid
- Screen JS calls `DynamicGrid.createGrid(config)`.
- `gridApi` is returned and stored for runtime actions.

4. Shared modules attach behavior
- `grid-manager.js` wires column/preference UI.
- `grid-toolbar.js` wires density buttons and CSV download.
- Screen JS wires screen-specific actions (for example Execute/Refresh handling).

5. User performs actions
- Execute: applies pending floating filters through grid API flow.
- Refresh: resets filters/sort/page using `gridApi`.
- Density: updates row/header sizing via `gridApi.setGridOption(...)`.
- Download: exports visible data via `gridApi.exportDataAsCsv(...)`.

6. Data source mode
- In server mode, grid requests go to screen endpoint (BFF/api URL from screen JS).
- Backend owns final filtering/sorting/pagination behavior.
- UI stays stable; mostly endpoint/contract mapping changes during integration.

### Quick one-line summary

- Screen files declare "what this screen needs"; shared files implement "how grid pages behave."
