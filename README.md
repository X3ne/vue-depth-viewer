<div align="center">
  <h1>vue-depth-viewer</h1>
</div>

<p align="center">
  <i>Work in progress</i>
</p>

<br/>

Simulate a fake 3d view with depth map and WebGl for your vue apps.

## Installation

```
npm i vue-depth-viewer
```

## Usage

```vue
import "vue-depth-viewer/style.css"

<VueDepthViewer
  :img="image"
  :depth-img="depth"
  :options="{
    horizontalThreshold: 30,
    verticalThreshold: 150,
  }"
/>
```

## Custom css

You can add you custom css via the following properties

- `.vuedepthviewer__container` for the container

- `.vuedepthviewer__img` for the placeholder image

## Playground

To use the playground just go to the `./playground/vite` or `./playground/nuxt` and run `npm i` and `npm run dev`.
