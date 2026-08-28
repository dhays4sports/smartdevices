# Baseline Intake and Migration Inventory

Status: complete · SD-FND-0.1 · 2026-08-22 UTC

## Integrity decision

The supplied `Smartdevicesv3-main(2).zip` was verified before extraction. Its SHA-256 is `08aad9341d0545821493800dd2ffb7e874afed1b3f613b91c903bfd5bfeffa8d`, exactly matching the protected baseline stated by the owner. The archive is retained outside the release packages and is never nested inside a v4 package.

## Actual v3 architecture

The archive is a seven-file static site under one accidental wrapper folder. It contains `index.html`, `styles.css`, `script.js`, `README.txt`, two substantive SVGs, and a one-byte `assets/hi` file. There is no package manifest, component framework, database, API, authentication layer, test harness, environment contract, or deployment adapter.

| Baseline file | SHA-256 | v4 treatment |
|---|---|---|
| `README.txt` | `07f6b4650415e6b47a5a03debb9f561edac989e60c0863e8f154fcdb993893b4` | Historical reference; replaced by operational README |
| `assets/device-museum.svg` | `ece176a9df80ba2d6f05b9552fc6e249272020b3ee810c38e20c447382606052` | Preserved byte-for-byte at `public/legacy/device-museum.svg` |
| `assets/hi` | `01ba4719c80b6fe911b091a7c05124b64eeece964e09c058ef8f9805daca546b` | Non-functional one-byte artifact; recorded, not migrated |
| `assets/intelligence-globe.svg` | `e9bb37fddbf44591364fec2485b8163e34cefebf10765b36f18546293b03f026` | Preserved byte-for-byte at `public/legacy/intelligence-globe.svg` |
| `index.html` | `5975b780a411ad54c79e23d7b35638c976cfb3a3d2232b2bfc9d1b11d80349ef` | Brand/content source; replaced by typed routes and components |
| `script.js` | `6be5a78c89c7eda687179b78667aae084784d0f6d4398e498e48a9ab9ac793cd` | Static reveal/navigation behavior replaced by accessible React state |
| `styles.css` | `9222cf9205a23ee69d0f5b3f9c8a3f741b19e109e34bc9fb23151f4400b233c9` | Visual cues translated into the v4 token/component system |

## Preserved institutional contract

V4 retains SmartDevices.com as the primary identity, “The Future Has An Address.”, the SmartDevices Index, manifesto language, strategic-partnership access, the dark institutional visual language, and both protected SVGs. It does not imply ownership by a carrier, agency, CoverageFit, 408FARMERS, or Farmers.

## Migration inventory

The static page was migrated into a typed Vinext/Next application with public and professional route families, content JSON, a D1/Drizzle schema, secure disabled-by-default adapters, explicit local demo mode, automated tests, and a root-deployable build. No v3 production infrastructure existed to migrate.
