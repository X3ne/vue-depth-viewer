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
<VueDepthViewer
  :img="image"
  :depth-img="depth"
  :options="{
    horizontalThreshold: 30,
    verticalThreshold: 150,
  }"
/>
```

## Playground

To use the playground just go to the `./playground/vite` and run `npm i` and `npm run dev`.
