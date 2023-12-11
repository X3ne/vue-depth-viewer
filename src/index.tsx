import { defineComponent, onMounted, ref, toRefs, watch } from 'vue-demi'
import { props } from './props'
import { Viewer } from './viewer'
import './style.css'

export default defineComponent({
  name: 'VueDepthViewer',
  props,
  setup(props) {
    const viewerRef = ref<HTMLDivElement | null>(null)
    let viewer: Viewer | null = null
    const propsRefs = toRefs(props)

    onMounted(() => {
      viewer = new Viewer(viewerRef, {
        image: props.img,
        depthImage: props.depthImg,
        horizontalThreshold: props.options.horizontalThreshold,
        verticalThreshold: props.options.verticalThreshold,
      })
    })

    watch(() => props.options, (newOptions) => {
      if (viewer) {
        viewer.rerender({
          image: propsRefs.img.value,
          depthImage: propsRefs.depthImg.value,
          horizontalThreshold: newOptions.horizontalThreshold,
          verticalThreshold: newOptions.verticalThreshold,
        })
      }
    }, { deep: true })

    return () => (
      <div ref={viewerRef} class="vuedepthviewer__container">
        <img src={props.img} class="vuedepthviewer__img" />
      </div>
    )
  }
})
