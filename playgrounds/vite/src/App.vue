<script setup lang="ts">
import VueDepthViewer from "depthviewer"
import image from "./assets/image.png"
import depth from "./assets/depth.png"
</script>

<template>
  <div class="wrapper">
    <div>
      <div class="container">
        <img :src="image" class="image" />
        <img :src="depth" class="image" />
      </div>
      <VueDepthViewer
        :img="image"
        :depth-img="depth"
        :options="{
          horizontalThreshold: 100,
          verticalThreshold: 150,
        }"
        class="viewer"
      />
    </div>
    <!-- <div>
      <div class="container">
        <img :src="image" class="image" />
        <img :src="depth" class="image" />
      </div>
      <VueDepthViewer
        :img="image"
        :depth-img="depth"
        :options="{
          horizontalThreshold: 30,
          verticalThreshold: 150,
        }"
        class="viewer"
      />
    </div> -->
  </div>
</template>
<style>
body {
  padding: 0;
  margin: 0;
}
.wrapper {
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100vw;
  height: 100vh;
}

.container {
  position: absolute;
  display: flex;
  height: 150px;
  z-index: 999;
}

.image {
  width: 100%;
  height: 100%;
}

.viewer {
  width: 100vw;
  height: 100vh;
}
</style>
