# MediFlow PWA Icons

This folder contains SVG source icons and a PNG generator tool for the MediFlow PWA.

## Required PNG Files

The `manifest.json` references these PNG files, which **must** be present for the PWA install prompt to appear:

| File | Size | Purpose |
|------|------|---------|
| `icon-192.png` | 192×192 | Standard PWA icon (Chrome install prompt, Android home screen) |
| `icon-512.png` | 512×512 | Splash screen / high-res icon |
| `icon-512-maskable.png` | 512×512 | Maskable icon for Android adaptive icons |

## How to Generate the PNG Files

### Option 1 — Use the built-in generator (recommended)

1. Open `generate-icons.html` in any modern browser (Chrome, Firefox, Edge).
2. Click **"Download All Icons"**.
3. Move the three downloaded PNG files into this `icons/` folder.

### Option 2 — Export from SVG sources

SVG source files are provided:

- `icon-192.svg` → export as `icon-192.png` at 192×192 px
- `icon-512.svg` → export as `icon-512.png` at 512×512 px
- For `icon-512-maskable.png`: use `icon-512.svg` but export **without** rounded corners (full-bleed background).

Tools you can use: Inkscape, Figma, SVGOMG, ImageMagick (`convert icon-512.svg -resize 512x512 icon-512.png`).

### Option 3 — Use ImageMagick (CLI)

```bash
convert -background "#0A858C" icon-192.svg icon-192.png
convert -background "#0A858C" icon-512.svg icon-512.png
cp icon-512.png icon-512-maskable.png
```

## Brand Colors

| Name | Hex |
|------|-----|
| Primary teal | `#0A858C` |
| Dark teal | `#055C61` |
| White | `#FFFFFF` |

## Replacing with Real Icons

Replace any of the generated PNG files with your real branded assets at any time. The filenames must match those listed in `manifest.json`.
