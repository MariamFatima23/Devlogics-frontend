# Requirements Document

## Introduction

This document defines the functional and non-functional requirements for the Theme Management feature of the E-portal admin panel. Requirements are derived from the design document and capture what the system must do to enable code-free, global color customization of the website.

---

## Requirements

### Requirement 1: Global Theme Persistence

**User Story:** As an administrator, I want the website's color palette to be stored in the database so that theme changes persist across server restarts and browser sessions.

#### Acceptance Criteria

1.1 The `SiteSettings` MongoDB document MUST contain a `theme` sub-document with fields: `primary`, `secondary`, `accent`, `bgLight`, `bgDark`, `cardBg`, `cardDark`, `textColor`, `borderColor`, `heroFrom`, `heroTo`, `footerBg`.

1.2 Each color field MUST default to a valid hex color value matching the existing Persian Blue palette when no custom value has been saved.

1.3 When the `theme` sub-document is absent from a legacy `SiteSettings` document, the system MUST treat all fields as their default values without throwing an error.

1.4 The `GET /api/site-settings` endpoint MUST return the `theme` sub-document as part of the response, accessible to all clients (public endpoint).

1.5 The `PATCH /api/site-settings` endpoint MUST accept a `theme` JSON object in the request body and shallow-merge it into the existing `theme` sub-document, preserving any fields not included in the request.

---

### Requirement 2: CSS Custom Property Injection

**User Story:** As a frontend developer, I want the active theme colors to be available as CSS custom properties so that all components automatically use the correct colors without per-component changes.

#### Acceptance Criteria

2.1 The application MUST define the following CSS custom properties in `:root` with default values: `--theme-primary`, `--theme-secondary`, `--theme-accent`, `--theme-bg-light`, `--theme-bg-dark`, `--theme-card-bg`, `--theme-card-dark`, `--theme-text`, `--theme-border`, `--theme-hero-from`, `--theme-hero-to`, `--theme-footer-bg`.

2.2 At application startup, the `ThemeProvider` component MUST call `applyTheme()` to overwrite the CSS fallback values with the values fetched from `GET /api/site-settings`.

2.3 `applyTheme()` MUST call `document.documentElement.style.setProperty()` for each of the 12 CSS variable mappings in a single synchronous loop.

2.4 If `theme.heroFrom` is empty or undefined, `--theme-hero-from` MUST be set to the value of `theme.primary`.

2.5 If `theme.heroTo` is empty or undefined, `--theme-hero-to` MUST be set to the value of `theme.secondary`.

2.6 If `theme.footerBg` is empty or undefined, `--theme-footer-bg` MUST be set to the value of `theme.primary`.

---

### Requirement 3: ThemeProvider React Context

**User Story:** As a React component author, I want a `ThemeContext` so that any component in the tree can read the active theme or trigger a live theme update.

#### Acceptance Criteria

3.1 A `ThemeProvider` component MUST be created at `src/context/ThemeContext.jsx` that wraps the application and provides `{ theme, applyTheme }` via React context.

3.2 `ThemeProvider` MUST fetch site settings from `GET /api/site-settings` on mount and initialize the context's `theme` value from the response's `theme` field.

3.3 If the API call fails, `ThemeProvider` MUST silently fall back to the `DEFAULT_THEME` constant (Persian Blue palette) without displaying an error to end users.

3.4 A `useTheme()` custom hook MUST be exported from `ThemeContext.jsx` that returns the current `ThemeContextValue`.

3.5 `useTheme()` MUST throw a descriptive error when called outside of a `ThemeProvider`.

3.6 The `ThemeProvider` MUST be added to `App.jsx` (or the root component) wrapping all routes and components.

---

### Requirement 4: Admin Theme Colors UI Panel

**User Story:** As an administrator, I want a dedicated "Theme Colors" tab in the Site Settings panel where I can pick new colors for the website's palette and save them without editing any code.

#### Acceptance Criteria

4.1 The existing "Theme Colors" tab in `ManageSiteSettings.jsx` MUST be populated with a color-editing UI displaying all 9 global theme tokens: Primary Color, Secondary Color, Accent Color, Light Background, Dark Background, Card Light, Card Dark, Text Color, Border Color.

4.2 Each token MUST be editable via an `<input type="color">` native color picker AND a text field showing the current hex value.

4.3 Changing a color in the color picker or hex text field MUST immediately call `applyTheme()` to provide a live visual preview across the whole page before the admin saves.

4.4 The UI MUST include a collapsible "Section-Specific Overrides" section exposing Hero Gradient From, Hero Gradient To, and Footer Background as optional fields.

4.5 Each token label MUST include a short description of which elements it affects (e.g., "Primary Color — navbar, buttons, gradients").

4.6 A "Reset to Defaults" button MUST be available that restores all fields to the Persian Blue default palette and calls `applyTheme()` with the defaults.

4.7 A live preview strip MUST be rendered in the Theme Colors tab showing swatches of all active theme colors before the admin saves.

4.8 Clicking the "Save Changes" button MUST include the current `theme` form state serialized as JSON in the `FormData` PATCH request body under the key `theme`.

4.9 After a successful save, the success message MUST read "Theme saved! Website colors updated instantly."

---

### Requirement 5: Automatic Component Color Propagation

**User Story:** As an administrator, I want all website components — Navbar, Footer, Hero, buttons, cards, and links — to automatically use the theme colors I set, without any per-component manual updates.

#### Acceptance Criteria

5.1 The Navbar component MUST use `var(--theme-primary)` for its background color instead of the current hardcoded hex value.

5.2 The Hero / `UniversityLanding` component MUST use `var(--theme-hero-from)` and `var(--theme-hero-to)` for its gradient background.

5.3 The Dashboard sidebar MUST use `var(--theme-primary)` and `var(--theme-secondary)` for its gradient background.

5.4 The Dashboard top header bar MUST use `var(--theme-primary)` and `var(--theme-secondary)` for its gradient background.

5.5 Primary buttons and CTA elements MUST use `var(--theme-primary)` as the base color.

5.6 Accent and highlight elements (badges, active nav indicators, notification dots) MUST use `var(--theme-accent)`.

5.7 Page and section backgrounds in light mode MUST use `var(--theme-bg-light)`.

5.8 Card backgrounds MUST use `var(--theme-card-bg)` for light cards and `var(--theme-card-dark)` for dark-variant cards.

5.9 All border and divider lines MUST use `var(--theme-border)`.

5.10 Body text color MUST be controlled by `var(--theme-text)`.

---

### Requirement 6: Section-Specific Overrides

**User Story:** As an administrator, I want to optionally override the Hero and Footer colors independently so I can customize specific sections without changing the global palette.

#### Acceptance Criteria

6.1 Setting `heroFrom` and `heroTo` to non-empty hex values MUST cause the Hero section to use those colors for its gradient, independent of `primary` and `secondary`.

6.2 Clearing `heroFrom` and/or `heroTo` (setting to empty string) MUST cause the Hero section to fall back to `primary` and `secondary` respectively.

6.3 Setting `footerBg` to a non-empty hex value MUST cause the Footer to use that color as its background, independent of `primary`.

6.4 Clearing `footerBg` (setting to empty string) MUST cause the Footer to fall back to `primary`.

6.5 Section overrides MUST NOT affect any components outside their designated section.

---

### Requirement 7: Input Validation

**User Story:** As a system, I want theme color inputs to be validated so that only valid hex color strings are saved to the database.

#### Acceptance Criteria

7.1 The `validateHexColor(value)` function MUST return `true` for any string matching `^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$` and for empty strings.

7.2 `validateHexColor(value)` MUST return `false` for any string that does not match the above pattern (e.g., `"notacolor"`, `"rgb(0,0,0)"`, `"#ZZZZZZ"`).

7.3 The Save button in the Theme Colors tab MUST be disabled when any required color field (the 9 global tokens) contains an invalid hex value.

7.4 Invalid color fields in the Theme Colors UI MUST display a visible error indicator (red border or inline message).

---

### Requirement 8: Access Control

**User Story:** As a security requirement, only administrators must be able to modify theme settings.

#### Acceptance Criteria

8.1 The `PATCH /api/site-settings` endpoint MUST return HTTP 401 for unauthenticated requests.

8.2 The `PATCH /api/site-settings` endpoint MUST return HTTP 403 for requests from authenticated users whose role is not `admin`.

8.3 The "Theme Colors" tab in `ManageSiteSettings` MUST only be reachable via the admin dashboard, which is itself guarded by role-based access in `Dashboard.jsx`.

---

### Requirement 9: Graceful Degradation

**User Story:** As an end user, I want the website to load and render correctly even if the theme API is unavailable, so I never see a broken or unstyled page.

#### Acceptance Criteria

9.1 The CSS custom properties defined in `index.css :root` MUST serve as baseline fallback values for all theme variables, ensuring components render in the default Persian Blue palette without any JavaScript.

9.2 When `ThemeProvider` catches an API error on mount, it MUST call `applyTheme(DEFAULT_THEME)` to ensure the CSS variables are explicitly set to the default palette.

9.3 The application MUST render without any console errors when the API is unavailable during theme initialization.

---

### Requirement 10: Consolidated Settings Fetch

**User Story:** As a performance requirement, the site settings API should be called as few times as possible per page load.

#### Acceptance Criteria

10.1 The `ThemeProvider` MUST be the single source of truth for site settings related to theme data; components that previously fetched `/api/site-settings` independently for theme data MUST read from `ThemeContext` instead.

10.2 The `Navbar.jsx` component's existing `api.get('/site-settings')` call for `portalName` and `logoUrl` MAY remain separate (it fetches non-theme data), or it MAY be refactored to also read from context — this is a refactor decision left to implementation.

---

## Glossary

| Term | Definition |
|---|---|
| Theme | A named set of color values that defines the visual palette of the website |
| Design Token | A named color variable (e.g., Primary Color) that maps to a semantic role in the UI |
| CSS Custom Property | A CSS variable defined with `--name` syntax, readable and overridable at runtime |
| ThemeProvider | React context provider component responsible for fetching and applying the active theme |
| applyTheme | Function that writes theme color values to CSS custom properties on `document.documentElement` |
| Section Override | An optional per-section color that overrides the global design token for a specific area (Hero, Footer) |
| SiteSettings | The MongoDB document that persists all site configuration including the theme sub-document |
| Persian Blue Palette | The default color scheme of the E-portal (navy `#04065c`, mid-blue `#023e8a`, cyan `#48cae4`) |
