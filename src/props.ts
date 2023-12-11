/**
 * Props for Vue Component
 */
export const props = {
  /**
   * The source image to display
   * @description The value of the `src` attribute of `<img src="" />`
   */
  img: {
    type: String,
    required: true,
    default: '',
  },

  /**
   * The source of the depth image to display
   * @description The value of the `src` attribute of `<img src="" />`
   */
  depthImg: {
    type: String,
    required: true,
    default: '',
  },

  options: {
    type: Object,
    required: false,
    default: () => ({}),
  },
}
