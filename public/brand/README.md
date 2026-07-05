# Brand Assets Placeholder

Drop the real brand files here using these exact filenames so no code changes are needed:

| Filename | Purpose | Suggested size |
|---|---|---|
| `logo-full.svg` | Full logo (icon + wordmark), used in the header | any (SVG scales) |
| `logo-mark.svg` | Icon-only mark | any (SVG scales) |
| `favicon.ico` | Browser tab icon | 32x32 (multi-res ICO) |
| `apple-touch-icon.png` | iOS home-screen icon | 180x180 |
| `og-image.png` | Social share preview image | 1200x630 |
| `hero-photo.jpg` | Homepage hero photo | 1600px wide, web-optimized |

Until these are provided, `logo-placeholder.svg` (a simple "JAI" monogram in the brand palette) is used in
`src/components/layout/Header.tsx`. Once `logo-full.svg` is added, update that one `<Image src>` reference.
