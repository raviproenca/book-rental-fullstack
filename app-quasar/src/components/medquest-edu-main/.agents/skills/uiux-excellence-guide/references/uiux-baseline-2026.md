# UI UX Baseline 2026

Use this baseline to convert subjective requests into objective implementation rules.

## Layout, Spacing, and Density

- Use a base-4 spacing ramp (`0, 2, 4, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48`).
- Define margins and gutters by viewport/window class, not per device model.
- Keep one grid system per surface; avoid ad-hoc spacing values.
- Treat density as a tokenized mode (`standard`, `compact`), not scattered overrides.

## Typography and Legibility

- Define text styles as tokens: size, weight, line-height, and tracking.
- Avoid very light weights for UI-critical text.
- Support user text spacing overrides without breaking layout or functionality.
- Enforce strong hierarchy using contrast, scale, spacing, and alignment together.

## Contrast and Accessibility

- Text contrast: minimum `4.5:1`.
- Non-text contrast (borders, focus indicators, key UI affordances): minimum `3:1`.
- Keep keyboard focus visible and not obscured by sticky headers or overlays.
- Implement robust focus styles for keyboard and high-contrast scenarios.

## Touch and Target Ergonomics

- iOS-style minimum touch target: `44x44 pt`.
- Material-style minimum touch target: `48x48 dp`.
- WCAG 2.2 target size baseline for web: `24x24 CSS px` (minimum compliance level).
- Increase clickable area with invisible padding when visual size must stay compact.

## Motion and Feedback

- Use motion only when it communicates state, continuity, or feedback.
- Keep transitions short and consistent via motion tokens.
- Respect reduced motion preference with safe fallbacks.

Recommended CSS fallback:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

## Microcopy and Error Handling

- Write concise, direct, present-tense copy.
- Explain what happened, why it matters, and how to fix it.
- Avoid blame-oriented wording.
- Prefer action-first labels and helper text near the point of failure.

## UX Performance Guardrails (Web)

- LCP good threshold: `<= 2.5s`.
- INP good threshold: `<= 200ms`.
- CLS good threshold: `<= 0.1`.
- Evaluate at p75, segmented by mobile and desktop when possible.

## Validation Stack

- Run automated checks (for example Lighthouse + axe-core) as triage.
- Perform manual validation for flows, semantics, focus, and edge cases.
- Track behavior analytics to confirm real frictions and post-release impact.
