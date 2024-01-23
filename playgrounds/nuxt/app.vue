<script setup lang="ts">
import VueDepthViewer from "vue-depth-viewer"
import image from "./assets/image.png"
import depth from "./assets/depth.png"
import { ref } from "vue"
import "../../../lib/style.css"

const crop = ref(false)

const scenes = ref([
  {
    name: "Interior",
    image: image,
    depth: depth,
    options: {
      horizontalThreshold: 150,
      verticalThreshold: 180,
    },
  },
])
const selectedScene = ref(0)
</script>

<template>
  <div class="wrapper">
    <div class="options">
      <p style="margin-right: 6px">Scene:</p>
      <select v-model="selectedScene">
        <option v-for="(scene, index) in scenes" :key="index" :value="index">
          {{ scene.name }}
        </option>
      </select>
      <label style="margin-left: 18px">
        <input type="checkbox" v-model="crop" />
        Crop
      </label>
    </div>
    <div class="container">
      <img :src="scenes[selectedScene].image" class="image" />
      <img :src="scenes[selectedScene].depth" class="image" />
    </div>
    <VueDepthViewer
      :img="scenes[selectedScene].image"
      :depth-img="scenes[selectedScene].depth"
      :options="{
        horizontalThreshold: scenes[selectedScene].options.horizontalThreshold,
        verticalThreshold: scenes[selectedScene].options.verticalThreshold,
        crop,
      }"
      class="viewer"
    />
  </div>
</template>
<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background-color: #262626;
  color: #fff;
  font-size: larger;
  font-family: sans-serif;
}

.wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100vh;
  gap: 22px;
  padding: 22px;
}

select {
  background-color: #fff;
  border: none;
  border-radius: 4px;
  padding: 4px;
  font-size: 16px;
}

.options {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

.container {
  display: flex;
  height: 150px;
}

.image {
  width: 100%;
  height: 100%;
}

.viewer {
  width: 100%;
  max-width: 1200px;
  height: auto;
  border-radius: 8px;
}
</style>
