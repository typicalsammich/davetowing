# Midnight Recovery — current implementation

An eight-second hybrid 2.5D/WebGL animation replaces the old image fade. A photographic truck-body cutout and three independent photographic wheel layers move through a dimensional roadside scene. A geometric rig supplies headlights, warning lights, shadow proxies and calibrated vehicle travel. Desktop includes faint roughened planar road reflections; mobile omits the reflection pass and lowers pixel density.

Motion is calibrated kinematic animation, not a full vehicle-physics solver. The truck covers 56 metres, slows progressively, steers onto the shoulder, stops, and settles. Wheel rotation follows distance divided by tyre radius. The truck imagery is illustrative, not a verified Dave Towing fleet photo. The visual layers remain camera-facing, so this is not a freely orbitable photorealistic vehicle model.

Skip, Escape, replay, once-per-session playback, reduced motion, save-data bypass, tab-visibility stopping, WebGL-error fallback and a loading timeout are included. The last rendered scene remains under the homepage copy. The original hero photograph remains the fallback.

No paid video service is used. Three.js 0.180.0 is vendored locally under its MIT licence in dist/assets/vendor/THREE-LICENSE.txt.

## Image assets
Built-in Imagegen produced a photorealistic white commercial flatbed cutout in front three-quarter view with transparent wheel openings, and a separate face-on commercial wheel with chrome rim. These were optimized to recovery-truck.webp and recovery-wheel.webp. The selected company logo is reused as a door decal.

## Verification
Browser playback, progressing animation timestamps, desktop/mobile composition, immediate skip and replay were checked. No browser rendering errors were observed. Numeric checks verify bounded shoulder travel, monotonic forward movement, progressive braking and a complete stop. No Core Web Vitals or broad hardware benchmarks are claimed.
