import { defineComponent, onMounted, ref, watch } from 'vue-demi'
import { props } from './props'
import { Viewer } from './viewer'

export default defineComponent({
  name: 'VueDepthViewer',
  props,
  setup(props) {
    const viewerRef = ref<HTMLDivElement | null>(null)
    let viewer: Viewer | null = null

    onMounted(() => {
      viewer = new Viewer(viewerRef, {
        image: props.img,
        depthImage: props.depthImg,
        horizontalThreshold: props.options.horizontalThreshold,
        verticalThreshold: props.options.verticalThreshold,
      })
    })

    return () => (
      <div ref={viewerRef}>
      </div>
    )
  }
})
