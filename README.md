# Dave Towing

Static, dependency-free 13-page website. Serve dist/ as the web root. Run node build.mjs after changing business-config.json to synchronize cinematic configuration. HTML files and assets are editable directly. Page-content.json and templates.json retain original content and shared markup.

## Verified from supplied briefs
Dave Towing; 414-629-3990; Instagram srtbigdave33; towing, roadside assistance, lockouts, jump starts, tire changes; open 7 days. The original flyer itself was not attached. Public search did not independently verify identity or coverage; Instagram could not be fetched. Do not infer 24-hour operation from seven-day opening.

## Outstanding production inputs
Authentic logo and company photos; actual equipment details for Meet the Truck hotspots; confirmed coverage boundaries for an accurate map and location pages; confirmed operating hours; permission and attribution for any customer reviews. These features are intentionally not fabricated. Contact is call-first; no decorative or unhandled form.

## Midnight Recovery
Current state: polished static concept fallback, NOT finished moving footage or a physics simulation. Asset source: built-in Imagegen. No actual fleet is represented. Prompt: photorealistic white commercial flatbed on a wet highway at 1:30 AM, black bed, amber lights, front three-quarter view on right two thirds, negative space left, accurate proportions, restrained reflections, no text/logos.
Provide approved 6–8 second desktop and portrait MP4 footage, matching final-frame posters, and authentic vehicle branding. Configure introDesktop/introMobile in business-config.json and run node build.mjs. Player supports immediate skip, persistent phone access in header, session replay prevention, reduced motion, save-data bypass, playback-error fallback and an 8.5 second timeout. No video file is requested until configured. Verify motion and lighting against the supplied cinematic brief before activation.

## Verification limits
JavaScript syntax and static route/link/metadata checks are run. Browser visual QA and Core Web Vitals require a reachable browser preview and have not been claimed.

## GitHub and local setup

Extract this ZIP and upload the contents of the dave-towing folder to your GitHub repository. It contains the latest published version, including removal of all link arrows and the updated cinematic player. No Git history, credentials, or Sites hosting identity is included.

With Node.js installed:

```
npm run build
npm run check
npm start
```

Open http://127.0.0.1:4173. There are no npm dependencies to install.

Deploy dist/ as the website root on any static host. This site uses root-relative URLs, so GitHub Pages requires a user/organization root site or a custom domain; a repository subpath requires updating URLs first. Update canonical URLs, social metadata, sitemap.xml, and robots.txt when changing the domain.

The cinematic video is not included. The current website displays a static concept image until approved footage is configured.
