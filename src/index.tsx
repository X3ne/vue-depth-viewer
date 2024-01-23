import { defineComponent, onBeforeUnmount, onMounted, ref, watch } from 'vue-demi'
import { Viewer } from './viewer'
import './style.css'

export interface DepthViewerOptions {
  horizontalThreshold?: number
  verticalThreshold?: number
  crop?: boolean
  useMouse?: boolean
  useScreen?: boolean
}

export interface DepthViewerProps {
  img: string
  depthImg: string
  options?: DepthViewerOptions
}

export default defineComponent<DepthViewerProps>({
  name: 'VueDepthViewer',
  props: ['img', 'depthImg', 'options'] as unknown as undefined,
  setup(props) {
    const viewerRef = ref<HTMLDivElement | null>(null)
    let viewer: Viewer | null = null

    onMounted(() => {
      viewer = new Viewer(viewerRef, {
        image: props.img,
        depthImage: props.depthImg,
        horizontalThreshold: props.options?.horizontalThreshold,
        verticalThreshold: props.options?.verticalThreshold,
        crop: props.options?.crop,
        useMouse: props.options?.useMouse,
        useScreen: props.options?.useScreen,
      })
    })

    onBeforeUnmount(() => {
      if (viewer) {
        viewer.destroy()
      }
    })

    watch(() => props, (newProps) => {
      if (viewer) {
        viewer.rerender({
          image: newProps.img,
          depthImage: newProps.depthImg,
          horizontalThreshold: newProps.options?.horizontalThreshold,
          verticalThreshold: newProps.options?.verticalThreshold,
          crop: newProps.options?.crop,
          useMouse: props.options?.useMouse,
          useScreen: props.options?.useScreen,
        })
      }
    }, { deep: true })

    return () => (
      <div ref={viewerRef} class="vuedepthviewer__container">
        <img src={props.img} class="vuedepthviewer__img" style={props.options?.crop ? 'object-fit: cover;' : 'object-fit: contain;'} />
      </div>
    )
  }
})
