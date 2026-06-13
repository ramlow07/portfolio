# Build Prompt — Premium 3D Coin for a Fintech Portfolio Hero

You are building a single, hero-centerpiece **3D coin** for a personal portfolio
website. The coin is the visual anchor of the page and must look **expensive,
trustworthy, and physically real** — a minted precious-object, not a cartoon
game coin. Read this whole document before writing code. Every detail matters;
treat omissions as intentional minimalism, not as license to add clutter.

---

## 0. Context you must honor

- **Whose site:** Luam Ramlow — Senior Software Engineer, **fintech specialist**.
  Tagline: *"I build software that moves money."* The coin is the metaphor for
  value/trust/money done with engineering precision.
- **Aesthetic of the site:** dark, minimal, editorial. Near-black canvas, warm
  off-white text, a single flame/vermilion accent. Restraint over spectacle.
- **Design tokens (match these exactly):**
  - Canvas / background: `#0a0a0c` (ink). A soft secondary `#101013`.
  - Text / light: `#f2ede3` (warm paper).
  - Accent ("flame"): `#ff4a2b`, with a warmer ember `#ff7a45`.
  - Typeface: **Geist** (sans) and **Geist Mono** for any labels.
- **Placement:** right-hand column of a split hero (text left, coin right) on
  desktop; stacked above the text on mobile. The coin sits on the **dark page
  background** (transparent canvas), no opaque panel behind it.
- **Stack:** React 19 + Vite + TypeScript, **React Three Fiber** (`@react-three/fiber`),
  **three**, **@react-three/drei**, **@react-three/postprocessing**. Smooth scroll
  is **Lenis**, animation is **GSAP + ScrollTrigger** (already in the project).
- **Non-negotiables:** lazy-loaded, code-split, 60fps desktop / smooth mobile,
  honors `prefers-reduced-motion`, and never blocks page load.

---

## 1. The character of the coin (the feeling)

Before geometry: the coin should feel like a **proof-grade minted medallion** —
the kind that ships in a felt box, struck once, mirror-polished. When it turns,
the **milled edge throws a shimmering comb of light** and the **mirror fields
flash** a sharp specular streak. It should read as *heavy* — slow, weighty
rotation, never spinning fast or cheaply. Dark metal with **warm flame light
licking the edges**, so it belongs to the brand without being gold-rush tacky.

Reference feelings: a platinum proof coin, a brushed titanium watch caseback, the
weight of a casino chip, the precision of a Swiss mint. **Not** a Mario coin, not
a crypto Bitcoin token, not chrome, not yellow cartoon gold.

---

## 2. Physical anatomy & geometry (model every part)

Model a real numismatic coin. A coin is a **right circular cylinder** with two
struck faces and a worked edge. Build, name, and respect each feature:

### 2.1 Proportions
- **Diameter : thickness ≈ 11:1** (chunky, premium — like a thick commemorative).
  In scene units: **diameter ≈ 2.6**, **thickness ≈ 0.24**. Camera framed so the
  coin occupies ~70% of the visual column height.
- The edge is not a sharp 90° corner: add a **small chamfer/bevel** (≈3–5% of
  thickness) where each face meets the edge, so the rim catches a highlight line.

### 2.2 The edge (the star of the rotation)
- **Reeded / milled edge:** vertical grooves around the circumference. Use **~120
  reeds**. Model them as **real geometry** (not just a normal map) because the
  payoff is how they scintillate during rotation. Each reed is a shallow
  rounded ridge; valleys slightly darker (AO), ridges catch the key + flame light.
- Provide a config flag for **edge style**: `reeded` (default), `plain`,
  `lettered` (incuse text around the edge — see §4.4), or `segmented`
  (alternating reeded/plain sectors, like a €2 coin).

### 2.3 Each face (obverse + reverse) has these layers, outer→inner
1. **Raised rim** — a smooth raised ring at the very edge of the face that
   protects the design. It is the highest flat plane and reads as a bright
   circular highlight.
2. **Denticles / beading** — a ring of fine repeating teeth or dots just inside
   the rim (~80–110 elements). Subtle, jewel-like. Optional via flag.
3. **Fields** — the flat recessed background plane of the face. On a proof coin
   the fields are **mirror-polished** (very low roughness) → they reflect the
   environment and flash.
4. **Legends** — raised lettering following the perimeter inside the denticles
   (the inscriptions; see §4).
5. **Devices** — the central raised design (the monogram/emblem; see §4). On a
   proof "cameo" coin the devices are **frosted/matte** (higher roughness) which
   creates a stunning contrast against the mirror fields. **Do this cameo
   contrast — it is the single most premium detail.**
6. **Relief** — devices and legends stand in **low relief** (bas-relief),
   raised ~2–4% of the diameter, with gently beveled sides (no vertical cliffs).
   Light grazing across relief is what makes a coin look struck, not printed.

### 2.4 How to author the relief
Pick the highest-quality path your toolchain allows, in order of preference:
- **(A) Modeled GLB:** sculpt obverse/reverse relief in Blender, bake
  **normal + AO + roughness (cameo) + height** maps, export GLB. Best result.
- **(B) Height/normal maps on a subdivided disc:** author the face design as a
  grayscale **heightmap** (SVG → height), convert to a **normal map**, and apply
  via `normalMap` (+ light `displacementMap` on a tessellated disc for silhouette
  on the relief). Good, fully procedural.
- **(C) Hybrid:** real geometry for rim + reeding + chamfer (silhouette-critical),
  normal maps for the fine face detail. Recommended balance of quality/perf.

---

## 3. Material & surface (PBR, metal is 100% reflection)

Metal has near-zero diffuse — it is **defined by what it reflects**, so the
environment map (§5) is as important as the material. Use
`MeshStandardMaterial`/`MeshPhysicalMaterial`.

### 3.1 Primary finish (default) — "Obsidian-flame proof"
- A **dark gunmetal / blackened-steel PVD** body: `metalness = 1.0`, base color a
  very dark warm graphite (`#1b1714`), so it stays dark on the dark page but the
  reflections + warm rim light give it life. Premium, on-brand, not gold-tacky.
- **Cameo roughness map:** mirror fields `roughness ≈ 0.08`; frosted devices &
  legends `roughness ≈ 0.45`; rim a touch satin `≈ 0.2`.
- Warmth comes from the **lighting/environment**, not from tinting the metal.

### 3.2 Provide two alternates behind a `finish` prop
- `bimetal`: outer ring cool steel (`#c9ccd2`), inner disc warm bronze
  (`#b87333` desaturated, not shiny gold) — a "fintech token" look (€1/€2 vibe).
- `rose-ember`: a restrained warm rose-gold (`#caa18a`), still low-saturation.
- (Default remains obsidian-flame.)

### 3.3 Micro-detail (this sells realism — do not skip)
- **Anisotropic brushing** on the fields or rim (subtle radial/circular brush
  direction) via anisotropy or a tangent-aligned roughness map.
- **Micro-scratches & swirl** baked into the roughness/normal at low intensity.
- **Fingerprint / dust hint:** a barely-there smudge in the roughness map (≤5%).
- **Edge wear:** rim highlights very slightly brighter/worn vs fields.
- Optional **clearcoat** (`clearcoat ≈ 0.3`, `clearcoatRoughness ≈ 0.1`) for a
  protective-lacquer sheen on proof finishes.
- Correct **color management**: `THREE.SRGBColorSpace`, `ACESFilmicToneMapping`,
  textures in the right color space (basecolor sRGB; normal/rough/metal linear).

---

## 4. The coin's design (what's actually struck on it)

This is a **bespoke token for Luam**, not a real currency. Keep typography in
**Geist / Geist Mono**, low-relief, elegant, sparse.

### 4.1 Obverse ("heads") — identity
- **Central device:** an **"LR" monogram** — interlocking, geometric, confident,
  in frosted cameo relief. (If a monogram is hard, use a single bold `LR`
  ligature.) This doubles as a brand mark; keep it clean enough to also work as a
  favicon/logo.
- **Top legend (curved):** `LUAM RAMLOW`.
- **Bottom legend (curved):** `FINTECH ENGINEER` (or `SÃO PAULO · BRASIL`).
- **Small marks:** `EST. 2021` near the lower field; tiny designer initials `LR`
  by the rim as a "mintmark" easter egg.

### 4.2 Reverse ("tails") — the story: *moving money*
Choose ONE, default to the first:
- **Value-flow emblem:** a stylized abstract of nodes connected by arcs with a
  directional arrow — "money moving through a system." Engraved/relief lines.
- **Denomination:** a large `001` or `∞` as the "value", with `ONE` / a unit
  legend — playful nod to a serialized first edition.
- **Globe/rails:** a minimal globe with two or three connection arcs (his
  cross-border work BR/DE/UK).

### 4.3 Surface treatment of the design
- Cameo: **frosted devices on mirror fields** (see §3.1). The monogram should go
  bright-then-dark as it sweeps past the key light.

### 4.4 Edge lettering (if `edge = lettered`)
- Incuse (recessed) repeating text around the edge: `· MOVES MONEY ` repeated, or
  `· EST 2021 · LUAM RAMLOW `. Subtle; only legible on close inspection.

---

## 5. Lighting & environment

Metal needs a real **environment map** to reflect. Keep it **self-contained**
(no external HDRI fetch) using drei `<Environment>` with `<Lightformer>` panels,
or a small bundled studio HDRI.

- **Key light:** large soft area, upper-left, neutral white. Drives the main
  field flash.
- **Rim / kicker:** narrower bright panel, back-right, so the **chamfer and
  reeded edge ignite** with a light line as it turns.
- **Fill:** dim cool panel, lower-front, to keep shadow side from going pure black.
- **Flame accent:** ONE warm reflector/area light (`#ff5a2a` → `#ff7a45`) placed
  lower-left so warm light **rolls along the edge and rim highlights** as it
  spins. This is how the brand color appears — as reflected light, **never** as a
  flat orange tint on the metal.
- **Contact shadow:** a soft grounded shadow (drei `<ContactShadows>` or
  `<AccumulativeShadows>`) if the coin is "resting/levitating" above an implied
  surface; very soft, low opacity, so it floats elegantly.
- Tone mapping ACES; expose so the mirror fields can clip to a crisp white flash
  but the body stays rich and dark.

---

## 6. Composition & camera

- **Camera:** perspective, `fov ≈ 35`, positioned for a **¾ view**: the coin
  tilted ~18–25° off face-on so you simultaneously see **the face AND the
  thickness/edge** (this is what makes it read unmistakably 3D). Never dead-on
  flat.
- **Framing:** centered in the right column, generous negative space around it; do
  not let it touch the column edges.
- Slight **off-center, rule-of-thirds** placement is welcome.

---

## 7. Motion & animation (imagine real coin physics)

The motion must feel **heavy and precise**. Three layers, composed:

### 7.1 Idle (default loop)
- **Slow rotation about the vertical (Y) axis**, ~one full turn every **12–16s**,
  so the viewer sees face → reeded edge → reverse face → edge. This continuous
  reveal of both faces + the milled edge is the core hypnotic loop.
- Superimpose a **gentle nutation/wobble** (a few degrees of axis precession, like
  a coin spinning down on a table) so it's organic, not a rigid turntable.
- A subtle **vertical bob/float** (±0.03 units, ~4s sine) so it levitates.
- **Light response:** ensure the rotation speed and light placement produce a
  **specular flash** on the fields roughly once per face pass, and a continuous
  **shimmer on the reeded edge** during the edge pass. Tune for that payoff.

### 7.2 Intro (on load / on enter viewport)
- A **coin toss**: the coin enters with an upward parabola, **flips about the
  horizontal (X) axis** several times (fast → decelerating), and **settles** into
  the idle ¾ pose with an `easeOut` (and a tiny overshoot/settle wobble). Total
  ~1.4–2.0s. Make it feel like a real flip, not a linear spin-up.

### 7.3 Micro-interaction motion
- **Cursor parallax / magnetic tilt:** the coin tilts a few degrees toward the
  pointer (eased, springy), adding life and depth. Disable on touch.
- (Optional) **scroll coupling:** rotation phase nudges slightly with scroll so it
  feels connected to the page, but it must still idle when the user is still.

### 7.4 Easing & feel
- Use weighted easing (`power3/power4.out`, or spring with low stiffness/high
  damping). **Nothing snappy or fast** — gravitas. No bounce-house energy.

---

## 8. Interaction (delight, optional but desired)

Implement at least cursor-tilt; the rest are progressive enhancements:
- **Drag to spin:** click-drag (or touch-drag) imparts angular velocity; release →
  **inertia with friction decay** back to idle. Throwing it should feel weighty.
- **Hover:** subtle speed-up + a slight bloom/exposure lift, like it catches more
  light.
- **Click / tap:** **flip to the other face** (animated half-turn about X), so
  users can discover the reverse "moving money" emblem. Cursor shows an affordance
  (e.g., a small "flip" label) if the site has a custom cursor.
- All interactions must be **interruptible** and never fight the idle loop.

---

## 9. Post-processing & atmosphere

Use `@react-three/postprocessing`, tuned **subtle** (premium, not blown out):
- **Bloom:** low threshold so only the brightest field-flash/edge-shimmer blooms;
  small radius. This is what makes the proof finish sparkle. Don't overdo it.
- **SSAO / GTAO:** gentle, to seat the relief, denticles, and reeding (desktop
  only — drop on mobile).
- **SMAA** (or MSAA) for clean edges on the reeding.
- **Subtle vignette** to focus attention.
- Optional **very light chromatic aberration** at the extreme edges only.
- Match the site's **film grain** (the page already has a grain overlay; keep the
  canvas consistent — either rely on the page grain or add a matching low grain).

---

## 10. Performance & responsiveness

- **Lazy-load & code-split** the entire 3D module (`React.lazy` + `<Suspense>`);
  it must not be in the main bundle. Show a lightweight **static poster/fallback**
  (a pre-rendered PNG of the coin, or a CSS disc) until it's ready.
- **Quality tiers** via a prop (`high` | `low`):
  - `high` (desktop): full geometry reeding, 2k textures, dpr cap `[1, 2]`, full
    post FX.
  - `low` (mobile): normal-map reeding instead of geometry, 1k textures
    (KTX2/Basis compressed), dpr cap `[1, 1.5]`, **bloom only** (drop SSAO),
    fewer denticles, lower-poly disc.
- **Pause when offscreen:** IntersectionObserver → stop the render loop /
  `frameloop="demand"` when the hero scrolls away (battery + CPU).
- **Targets:** 60fps desktop, ≥30fps mid mobile. Keep draw calls minimal (merge
  geometry; one mesh per material).
- Dispose geometries/materials/textures on unmount.

---

## 11. Accessibility & fallbacks

- **`prefers-reduced-motion: reduce`** → no toss, no idle spin (or an extremely
  slow, optional drift); render a **static beauty pose**, or just show the poster
  PNG. Never animate aggressively for these users.
- **No WebGL / load failure** → graceful static poster image, page fully usable.
- The canvas is **decorative**: `aria-hidden="true"`; ensure all meaning is in the
  text. Don't trap focus or hijack scroll.
- Keep **LCP** fast: the hero text and poster must paint immediately; the live
  coin hydrates after.

---

## 12. Deliverables

1. A self-contained `Coin` React component:
   `<Coin quality="high|low" finish="obsidian|bimetal|rose" edge="reeded|plain|lettered" />`.
2. The 3D assets (GLB and/or the height/normal/roughness/AO map set) for obverse,
   reverse, and edge — or the procedural generators that produce them.
3. A **static poster PNG** (transparent, ~1200×1200) of the hero pose for the
   fallback/OG image.
4. Tunable config (rotation speed, light positions/intensities, bloom, tilt
   strength) surfaced as props or a small config object — well-commented.
5. Notes on how to swap the obverse/reverse artwork.

---

## 13. Acceptance checklist ("done" means all true)

- [ ] Reads instantly as a **real, heavy, minted coin** in a ¾ view — face + edge
      both visible.
- [ ] **Reeded edge shimmers** and **mirror fields flash** during rotation.
- [ ] **Cameo contrast**: frosted LR monogram against mirror fields is obvious.
- [ ] Brand **flame color appears only as reflected warm light** on edges/rim,
      never as a flat orange surface.
- [ ] Sits cleanly on the dark page (transparent canvas), premium, uncluttered.
- [ ] Smooth weighty idle spin + a real **coin-toss intro** + cursor tilt.
- [ ] Lazy-loaded, code-split, poster fallback, reduced-motion + no-WebGL handled.
- [ ] 60fps desktop; smooth on mobile via the `low` tier.
- [ ] Color-managed (sRGB/ACES), no banding, clean anti-aliased reeding.

---

## 14. Anti-patterns — do NOT do these

- ❌ Flat yellow **cartoon gold** / Mario-coin / casino sticker look.
- ❌ **Crypto** Bitcoin "₿", chrome, holographic rainbow, or neon.
- ❌ A **flat 2D disc** faked with a gradient — it must be real geometry/relief.
- ❌ **Fast, dizzying spin** or bouncy easing — kills the "weight/trust" feel.
- ❌ Tinting the metal solid orange to "add flame" — warmth comes from light.
- ❌ Blown-out bloom, heavy chromatic aberration, or busy backgrounds.
- ❌ Heavy uncompressed textures or a non-lazy bundle that hurts page load.
- ❌ Dead-on, face-only framing that hides the coin's thickness (looks 2D).

Build it like you're minting a one-off proof for a fintech founder who will
judge it on craft. Precision, weight, restraint, and that one warm flash of
flame on the edge.
