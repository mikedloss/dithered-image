---
"@dloss/dithered-core": minor
"@dloss/dithered-image": patch
"@dloss/dithered-element": patch
---

Extract shared dithering engine into @dloss/dithered-core. Both dithered-image and dithered-element now depend on core as a regular dependency. dithered-element no longer requires dithered-image as a peer dependency -- just `npm install @dloss/dithered-element` works standalone.
