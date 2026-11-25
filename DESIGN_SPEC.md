# Design Spec — Hyrule Encyclopedia

Derived from three reference images (Link card, Zelda card, N64-style item screen). Sampled values are real pixels.

## Roles
- `Link.jpeg`, `Zelda.jpeg`: character-card targets (portrait 480x640, 3:4).
- `Inventory.png`: pause-menu target for the inventory modal.

## Palette
| Role | Value |
|---|---|
| Card backdrop (warm brown) | `#32241b` / `#34231b` |
| Torn band (near black) | `#0d0d0d` |
| Nameplate | `#0a0a0a` with dim gold hairline `#7a6a4a` |
| Nameplate text | ivory `#fefff3` |
| Link tunic green | `#5f7455` (light) `#2b3614` (shadow) |
| Link hair gold | `#ffd374` |
| Skin | `#f4bf89` |
| Zelda purple | `#ac6fb5` / `#6c3e65` |
| Ivory cloth | `#dbd5d9` |
| Inventory frame blue | `#0d2845`, bright `#9dc3fc`, deep `#0d2296` |
| Inventory panel grey | `#333846`, `#2a2c31` |
| Stone / wood | `#8c7e66`, `#755a3a` |
| Triforce gold (kept from original site) | `#f4c542` / `#b8860b` |

## Type
Cinzel (small-caps feel, letter-spaced) for headings and nameplates; Crimson Text for body. Nameplate text is ivory, ~1.6rem, tracking 3px.

## Shape and surface
- Portrait sits on a brown field crossed by a diagonal **torn black band** (jagged clip-path).
- **Nameplate**: black bar, double hairline border, ornament glyphs either side, overlapping the bottom of the portrait.
- Inventory: blue beveled frame, 4-column item grid with bright square **selection brackets**, red hearts across the top, green rupee gem + count bottom-left, "Return / Save / Decide" buttons top right, "To Map" bar at the bottom.
- Light: soft top-left key light; portraits get a moving specular sheen on hover.

## Signature details
1. Torn black band behind a bottom-bleeding portrait.
2. Black nameplate with ivory small-caps.
3. Gold selection brackets (also used as the Z-target reticle).
4. Blue beveled N64 pause frame with item grid.
5. Forest green + Triforce gold atmosphere (original site identity).
6. Rupee counter and heart row as the persistent HUD.

## Components
Shared tokens in `style.css` (`:root`). Reusable: `.card` (portrait), `.nameplate`, `.panel`, `.btn`, dialog box, item-get popup, inventory.
