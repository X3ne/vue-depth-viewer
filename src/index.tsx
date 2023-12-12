import { defineComponent, onBeforeUnmount, onMounted, ref, toRefs, watch } from 'vue-demi'
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
        crop: props.options.crop,
      })
    })

    watch(() => props.options, (newOptions) => {
      if (viewer) {
        viewer.rerender({
          image: propsRefs.img.value,
          depthImage: propsRefs.depthImg.value,
          horizontalThreshold: newOptions.horizontalThreshold,
          verticalThreshold: newOptions.verticalThreshold,
          crop: newOptions.crop,
        })
      }
    }, { deep: true })

    return () => (
      <div ref={viewerRef} class="vuedepthviewer__container">
        <img src={props.img} class="vuedepthviewer__img" style={props.options.crop ? 'object-fit: cover;' : 'object-fit: contain;'} />
      </div>
    )
  }
})
