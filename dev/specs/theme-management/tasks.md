# Implementation Plan: Theme Management

## Overview

This implementation plan covers all changes needed to deliver the Theme Management feature: backend model verification, a React ThemeContext, CSS variable wiring across components, and the admin UI color-picker panel. Most backend infrastructure already exists and requires only verification and tests.

## Tasks

### Phase 1: Backend — Model & API

- [ ] 1.1 Verify `SiteSettings.model.js` theme sub-document fields match the design (`primary`, `secondary`, `accent`, `bgLight`, `bgDark`, `cardBg`, `cardDark`, `textColor`, `borderColor`, `heroFrom`, `heroTo`, `footerBg`) and add any missing fields with their default values
- [ ] 1.2 Verify the `PATCH /api/site-settings` handler correctly deep-merges the `theme` JSON body field into the existing `theme` sub-document (already implemented — confirm behavior and add a test)
- [ ] 1.3 Write an integration test for `GET /api/site-settings` asserting the `theme` sub-document is present in the response with all 12 fields
- [ ] 1.4 Write an integration test for `PATCH /api/site-settings` asserting that a student JWT returns 403 and no JWT returns 401

### Phase 2: Frontend — ThemeContext

- [ ] 2.1 Create `src/context/ThemeContext.jsx` with `ThemeProvider` component and `useTheme` hook
  - Define `DEFAULT_THEME` constant with all 12 Persian Blue default hex values
  - Implement `applyTheme(colors)` function that calls `document.documentElement.style.setProperty` for each of the 12 CSS variable mappings, with fallback logic for `heroFrom`, `heroTo`, and `footerBg`
  - `ThemeProvider` fetches `GET /api/site-settings` on mount, merges with `DEFAULT_THEME`, calls `applyTheme`, and exposes `{ theme, applyTheme }` via context
  - Catch API errors silently and fall back to `DEFAULT_THEME`
  - `useTheme()` throws a descriptive error if called outside `ThemeProvider`
- [ ] 2.2 Add `<ThemeProvider>` to `App.jsx` (or the root component) wrapping all routes
- [ ] 2.3 Write unit tests for `applyTheme()`:
  - Given a full `ThemeColors` object, assert each CSS variable is set correctly
  - Given `heroFrom = ""`, assert `--theme-hero-from` equals `colors.primary`
  - Given `footerBg = ""`, assert `--theme-footer-bg` equals `colors.primary`
- [ ] 2.4 PBT: Write a property-based test (fast-check) for `applyTheme` — for any valid hex color string `c`, `applyTheme({ primary: c, ...defaults })` sets `--theme-primary` to `c`
- [ ] 2.5 Create `src/utils/theme.js` with the `validateHexColor(value)` utility function and write unit tests:
  - Returns `true` for `#fff`, `#04065c`, `#FFFFFF`, and `""` (empty string)
  - Returns `false` for `notacolor`, `rgb(0,0,0)`, `#ZZZZZZ`, `null`
- [ ] 2.6 PBT: Write a property-based test (fast-check) for `validateHexColor` — `validateHexColor(s)` returns `true` iff `s === ""` or `s` matches `^#[0-9A-Fa-f]{3}$` or `^#[0-9A-Fa-f]{6}$`

### Phase 3: Frontend — CSS Variable Wiring

- [ ] 3.1 Confirm all 12 CSS custom properties exist in `index.css :root` with correct Persian Blue defaults (already present — verify completeness against design)
- [ ] 3.2 Update `Navbar.jsx` to replace the hardcoded `style={{ background: '#04065c' }}` with `style={{ background: 'var(--theme-primary)' }}`
- [ ] 3.3 Update `Dashboard.jsx` sidebar `style` props to use `var(--theme-primary)` and `var(--theme-secondary)` for the gradient backgrounds (desktop and mobile sidebars, and top header bar)
- [ ] 3.4 Update `UniversityLanding.jsx` hero section gradient to use `var(--theme-hero-from)` and `var(--theme-hero-to)` CSS variables
- [ ] 3.5 Audit `index.css` utility classes (`.dp-btn-primary`, `.btn-cta`, `.dp-card`, `.dp-badge`) — replace hardcoded Persian Blue hex values with the corresponding `--theme-*` CSS variables wherever appropriate

### Phase 4: Admin UI — Theme Colors Tab

- [ ] 4.1 In `ManageSiteSettings.jsx`, populate the existing "Theme Colors" tab with a color-picker grid for the 9 global tokens and a collapsible "Section Overrides" section for `heroFrom`, `heroTo`, `footerBg`
  - Each token: `<input type="color">` + hex text `<input>` side by side
  - Include descriptive label for each token (e.g., "Primary Color — navbar, buttons, gradients")
  - `onChange` of either input calls `applyTheme()` from `ThemeContext` for live preview
- [ ] 4.2 Wire `validateHexColor()` to the hex text inputs — invalid inputs show a red border; Save button is disabled while any global token is invalid
- [ ] 4.3 Add a "Reset to Defaults" button that sets all theme form fields to `DEFAULT_THEME` values and calls `applyTheme(DEFAULT_THEME)`
- [ ] 4.4 Add a live preview swatch strip in the Theme Colors tab showing a colored dot/block for each active theme color
- [ ] 4.5 In `handleSubmit`, include `data.append('theme', JSON.stringify(form.theme))` before the PATCH call, and after a successful save call `applyTheme(updatedSettings.theme)` from `ThemeContext`
- [ ] 4.6 Initialize `form.theme` in the `useEffect` that fetches site settings — merge the API response's `theme` field with `DEFAULT_THEME` to ensure no keys are undefined

### Phase 5: Integration & Verification

- [ ] 5.1 Manual smoke test: change Primary Color to green in the admin panel, save, verify Navbar and sidebar update to green without page reload
- [ ] 5.2 Manual smoke test: set `heroFrom` and `heroTo` to custom colors — verify only the Hero section changes
- [ ] 5.3 Manual smoke test: clear `heroFrom` — verify Hero reverts to using Primary Color
- [ ] 5.4 Manual smoke test: simulate API failure (disconnect network, reload) — verify site still renders in default Persian Blue palette
- [ ] 5.5 Run existing backend tests to confirm no regressions: `cd backend && npm test`

## Task Dependency Graph

```json
{
  "waves": [
    { "wave": 1, "tasks": ["1.1", "1.2"] },
    { "wave": 2, "tasks": ["1.3", "1.4", "2.1", "3.1"] },
    { "wave": 3, "tasks": ["2.2", "2.3", "2.4", "2.5", "2.6", "3.2", "3.3", "3.4", "3.5"] },
    { "wave": 4, "tasks": ["4.1", "4.2", "4.3", "4.4", "4.5", "4.6"] },
    { "wave": 5, "tasks": ["5.1", "5.2", "5.3", "5.4", "5.5"] }
  ]
}
```

## Notes

- The `SiteSettings.model.js` `theme` sub-document and the `PATCH /api/site-settings` theme merge logic already exist — Phase 1 tasks are primarily verification and test-writing, not new implementation.
- All 12 CSS custom properties already exist in `index.css` — Phase 3 is primarily a wiring exercise replacing hardcoded hex values with `var(--theme-*)` references.
- The "Theme Colors" tab stub already exists in `ManageSiteSettings.jsx` — Phase 4 fills it in.
- Property-based test tasks (2.4, 2.6) are marked `PBT` and require fast-check. Install with `npm install --save-dev fast-check` if not already present.
- Live preview (calling `applyTheme` on `onChange`) is a UX enhancement — if performance issues arise, debounce the call with a 50–100ms delay.
