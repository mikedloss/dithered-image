# @dloss/dithered-image

## 1.0.3

### Patch Changes

- 17b00a0: Extract shared dithering engine into @dloss/dithered-core. Both dithered-image and dithered-element now depend on core as a regular dependency. dithered-element no longer requires dithered-image as a peer dependency -- just `npm install @dloss/dithered-element` works standalone.
- Updated dependencies [17b00a0]
  - @dloss/dithered-core@1.1.0
