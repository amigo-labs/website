# The amigo app theme

One theme for every amigo app. Surfaces, text, status colours, type, sizes
and components are the same everywhere; an app differs only in its accent,
the `accent` of its `docs/site/project.yml`. The website itself keeps its own
look.

| File | What |
| ---- | ---- |
| `theme.json` | The source: neutrals for dark and light, status colours, type, spacing, radii, shadows |
| `lib.ts` | Builds the theme for one accent, checks its contrast, writes CSS and Rust |
| `components.css` | The `am-*` component classes, copied into each app as is |
| `lib.test.ts` | `pnpm test`: every project accent and four hard cases are legible in both modes |

`scripts/theme.ts` writes the files into an app
([docs/project-data.md](../docs/project-data.md#app-theme)).

## Using it in an app

- Load `tokens.css`, then `components.css`. Load Inter yourself (self-hosted,
  latin subset); a native app keeps the system UI font and takes the sizes.
- Dark is the default. Without a `data-theme` on the root element the theme
  follows the system; `data-theme="light"` or `"dark"` pins a mode. Offer
  System, Dark and Light.
- Never edit the generated files and never write a raw colour next to them:
  a value that is missing is added to `theme.json` here.

## Colour

- Build screens from `bg` (the window), `surface` (panels on it) and
  `surface-raised` (fields and nested blocks on a panel). No fourth level.
- Text is `text`, `text-secondary` or `text-muted`; all three hold 4.5:1 on
  `bg`, `surface`, `surface-raised` and `hover`.
- `border` is a hairline between surfaces. Anything the user has to find (a
  field, a checkbox, a slider rail) is outlined with `border-strong` (3:1).
- The accent has four roles. `accent` is decorative only: progress fills, the
  selected-edge bar, slider thumbs. `accent-ink` is the accent as text or
  icon. `accent-solid` is the fill of the primary button and of checked
  controls, always with `on-accent` on it. `accent-subtle` is the fill of a
  selected row or chip. Never put text in `accent`.
- Status uses the same split: `success`, `warning`, `danger` for fills and
  dots, `*-ink` for text, `*-subtle` for banner and chip grounds,
  `danger-solid` for a destructive button. A status always has a word or an
  icon next to its colour; with a red accent (Blinzel) that is what tells
  `danger` apart.
- The focus ring is 2px `focus`, offset 2px.
- No glow, no gradients. The accent marks what is active, selected or the
  one primary action: about a tenth of a screen.

## Type, space, shape

- `text-body` (14/20) is the default; `text-body-sm` and `control-sm` for
  dense editors and inspectors, `control-lg` for touch. `text-label` is the
  only uppercase style. Use them as `font: var(--am-text-body)`.
- Spacing is the 4px grid, `space-1` to `space-16`; panel padding and the
  phone gutter are `space-4`.
- `radius-sm` for controls, `radius-md` for panels and menus, `radius-lg`
  for dialogs, `radius-full` for toggles, dots and rails.
- Depth is borders first; `elev-1` to `elev-3` only for what floats.
- Motion: `dur-fast` for state changes, `dur-base` for panels, `ease-out`;
  none under `prefers-reduced-motion`.

## Components

`components.css` has Button, Field, Toggle (switch, checkbox, radio), Slider,
SegmentedControl, Tabs, Chip, ProgressBar, Banner, Panel, list rows, Menu
and Dialog as plain classes (`am-btn am-btn--primary`, `am-input`, …).
Button, Field and SegmentedControl have a dense variant (`--sm`, 24px) for
editors and inspectors. The slider (`am-range`) shows its travelled part in
the accent: set `--am-range-fill` to the value as a percentage on the input. An app
uses them directly or wraps them in its own components; it does not restyle
them.

## Changing the theme

Change `theme.json` or `components.css` here, run `pnpm test`, then rerun
`pnpm theme` for every app: their CI fails until the copies match.
