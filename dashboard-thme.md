# Dashboard Theme Guide

**Status: this is the stock shadcn/ui "neutral" default theme, unmodified** — expressed as raw HSL triplets for Tailwind's `hsl(var(--token))` convention rather than OKLCH. Every token is grayscale (0% saturation) except `--destructive`. There is no brand color, no accent color, and no expressive signature. Before handing this to an agent to "refactor to," decide whether that's intentional (fine for an internal admin tool where speed > identity) or a placeholder you forgot to replace (not fine for anything user-facing or brand-facing). This doc describes what exists, not what's good.

---

## 1. Token Source of Truth

All colors are defined as CSS custom properties holding **raw `H S% L%` triplets** (no `hsl()` wrapper in the variable itself), set inside `@layer base` and split into `:root` (light) and `.dark` (dark mode). Tailwind config must reference them as `hsl(var(--token))` — e.g. `background: "hsl(var(--background))"` — for this to work. **Rule for the agent: never hardcode a hex/rgb/hsl value or a raw Tailwind palette class (`bg-gray-100`, `text-slate-900`, etc.) in a component. Always use the semantic utility class the token maps to (`bg-background`, `text-foreground`, `border-border`, `ring-ring`).** If a component currently has inline colors, that's refactor debt — flag and replace it, don't leave it "for later."

### Radius
```
--radius: 0.5rem   (base unit; shadcn derives lg/md/sm as calc(var(--radius) - Npx) in tailwind.config, not redefined here)
```

### Light mode (`:root`)
| Token | Value (H S% L%) | Role |
|---|---|---|
| `--background` | 0 0% 100% | page background — pure white |
| `--foreground` | 0 0% 3.9% | primary text — near-black |
| `--card` | 0 0% 100% | card surface |
| `--card-foreground` | 0 0% 3.9% | text on card |
| `--popover` | 0 0% 100% | popover/dropdown surface |
| `--popover-foreground` | 0 0% 3.9% | text on popover |
| `--primary` | 0 0% 9% | primary action color — near-black |
| `--primary-foreground` | 0 0% 98% | text on primary — near-white |
| `--secondary` | 0 0% 96.1% | secondary surface — light gray |
| `--secondary-foreground` | 0 0% 9% | text on secondary |
| `--muted` | 0 0% 96.1% | muted background |
| `--muted-foreground` | 0 0% 45.1% | muted/secondary text |
| `--accent` | 0 0% 96.1% | hover/highlight surface |
| `--accent-foreground` | 0 0% 9% | text on accent |
| `--destructive` | 0 84.2% 60.2% | **only chromatic color** — red, for delete/error |
| `--destructive-foreground` | 0 0% 98% | text on destructive |
| `--border` | 0 0% 89.8% | borders/dividers |
| `--input` | 0 0% 89.8% | input borders |
| `--ring` | 0 0% 3.9% | focus ring |
| `--chart-1..5` | orange, teal, dark-teal, yellow, amber | data viz palette — the only place actual hue variety exists in light mode |

Note: this HSL variant has **no `--sidebar*` tokens** — if the current codebase has a sidebar, it's currently falling back to `background`/`border`/etc., or hardcoded. Check before assuming parity with any prior OKLCH version of this theme.

### Dark mode (`.dark`)
Same token names, inverted lightness. Background drops to `0 0% 3.9%`, foreground rises to `0 0% 98%`. `--primary` and `--primary-foreground` **swap roles** (primary becomes light, foreground becomes dark) — this is correct and intentional for dark mode, don't "fix" it. `--destructive` drops both saturation and lightness (84.2%→62.8% sat, 60.2%→30.6% light) for dark-background legibility — it's a darker, more muted red, not the same red at lower opacity. Chart colors switch to a fully different, more saturated hue set (blue/green/orange/purple/pink) — not a lightness flip of the light-mode set, a distinct palette.

---

## 2. What the agent should DO

1. **Audit first, refactor second.** Grep the codebase for hardcoded colors (`#`, `rgb(`, `rgba(`, raw Tailwind color classes like `bg-gray-100`, `text-slate-900`) and replace every one with the matching semantic token above. This is the actual point of this file — consistency, not aesthetics.
2. **Respect semantic pairing.** Never pair `--foreground` with `--card` if `--card-foreground` exists for that context. Background/foreground tokens are pairs — always use them together, never mix across pairs (e.g. don't put `--muted-foreground` text on `--primary` background).
3. **Preserve the light/dark contract.** Any new component must define behavior for both `:root` and `.dark` — no dark-mode-only afterthoughts.
4. **Leave chart colors alone unless building new data viz.** `--chart-1` through `--chart-5` are the only intentionally chromatic tokens outside destructive — don't repurpose them for UI chrome.
5. **Don't invent new tokens ad hoc.** If a component needs a color this system doesn't have (e.g. a "success" or "warning" state), that's a real gap — surface it as a decision, not a silent addition.

## 3. What the agent should NOT do

- Don't "improve" the palette by injecting brand colors into these tokens without sign-off — that's a design decision, not a refactor, and belongs in a separate pass.
- Don't collapse `--muted` and `--accent` even though they're numerically identical in light mode — they're semantically distinct (muted = de-emphasis, accent = interactive highlight) and may diverge later.
- Don't assume `0 0% L%` (zero saturation = pure gray) is a bug. It's the actual current state of this theme. It IS the flag — see the top of this doc.
- Don't silently rename `--radius: 0.5rem` to `0.625rem` or otherwise mix it up with the OKLCH variant of this theme if one exists elsewhere in the repo — pick one source of truth and delete the other, don't let both linger.

---

## 4. Open decision for you, not the agent

This theme has no identity beyond "shadcn default, light/dark." If this dashboard is meant to be memorable, differentiated, or brand-carrying, that work hasn't started — this refactor will just make the *absence* of a identity more consistent. Decide that before your agent burns hours polishing a placeholder.