# Midnight Recovery — parked-truck showcase

The current intro lasts 4.2 seconds. The truck and all wheels remain fixed in world space. A slow, eased camera arc covers about 3 degrees on desktop and 2 degrees on mobile. The photographic vehicle layers retain their world orientation instead of turning to face the camera. Amber lights pulse smoothly at low intensity; headlights remain constant.

The earlier driving path, braking, wheel rotation, moving proxy rig, second vehicle, planar reflection pass, shadow maps, environment-map generation and per-frame contact-shadow calculations have been removed. Lane markings, guardrail posts and distant vegetation use instanced geometry. Local browser checks observed 17 draw calls on mobile and 23 on desktop, with no rendering errors. These are rendering-cost checks, not broad-device FPS benchmarks.

The final frame stays beneath the homepage copy. Skip Intro, Escape, Replay Intro, session-based replay prevention, reduced-motion preferences, save-data bypass and photo fallback remain in place. A new session key allows visitors to see this revised version once.

The truck uses photographic cutout layers in a lightweight WebGL environment. This is a limited-angle animated concept rather than a freely orbitable vehicle model. The scene stops rendering after completion.

Three.js 0.180.0 is bundled locally under the included MIT licence. No new paid service or external runtime dependency is required.
