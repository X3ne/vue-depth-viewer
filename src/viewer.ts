import { Ref } from 'vue-demi'
import fragmentShaderSource from './shaders/fragment.glsl?raw'
import vertexShaderSource from './shaders/vertex.glsl?raw'

export interface ViewerOptions {
  image: string;
  depthImage: string;
  verticalThreshold?: number;
  horizontalThreshold?: number;
  crop?: boolean;
  useMouse?: boolean;
  useScreen?: boolean;
}

class Uniform {
  private location: WebGLUniformLocation | null = null

  constructor(
    private name: string,
    private suffix: string,
    private program: WebGLProgram,
    private gl: WebGLRenderingContext
  ) {
    this.location = gl.getUniformLocation(program, name)
  }

  public set(...values: any[]): void {
    if (this.location !== null) {
      const method = `uniform${this.suffix}` as keyof WebGLRenderingContext
      const uniformMethod = this.gl[method] as (
        location: WebGLUniformLocation,
        ...values: any[]
      ) => void
      uniformMethod.apply(this.gl, [this.location, ...values])
    } else {
      console.warn(`Uniform "${this.name}" not found`)
    }
  }
}

class Rect {
  private buffer: WebGLBuffer | null = null

  static verts: Float32Array = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1])

  constructor(private gl: WebGLRenderingContext) {
    this.buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer)
    gl.bufferData(gl.ARRAY_BUFFER, Rect.verts, gl.STATIC_DRAW)
  }

  public render(): void {
    if (this.buffer !== null) {
      this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4)
    } else {
      console.warn('Rect buffer not found')
    }
  }
}

export class Viewer {
  private container: HTMLElement
  private canvas: HTMLCanvasElement
  private gl: WebGLRenderingContext
  private program: WebGLProgram
  private ratio = 1
  private width = 0
  private height = 0

  private image: string
  private depthImage: string
  private imageAspect = 1
  private verticalThreshold: number
  private horizontalThreshold: number
  private crop: boolean
  private useMouse: boolean
  private useScreen: boolean

  private uResolution: Uniform | null = null
  private uRatio: Uniform | null = null
  private uThreshold: Uniform | null = null
  private uMouse: Uniform | null = null
  private uCrop: Uniform | null = null

  private billboard: Rect | null = null
  private positionLocation: number | null = null

  private mouseX = 0
  private mouseY = 0
  private mouseTargetX = 0
  private mouseTargetY = 0

  private textures: WebGLTexture[] = []

  constructor(
    element: Ref<HTMLDivElement | null | undefined>,
    options: ViewerOptions
  ) {
    if (!element.value) {
      throw new Error('No container element found')
    }

    this.container = element.value
    this.canvas = document.createElement('canvas')
    this.canvas.style.position = 'absolute'
    this.canvas.style.top = '0'
    this.canvas.style.left = '0'
    this.canvas.style.zIndex = '10'
    this.canvas.style.opacity = '1'
    this.container.appendChild(this.canvas)

    const gl = this.canvas.getContext('webgl')
    if (!gl) {
      throw new Error('WebGL not supported')
    }
    this.gl = gl

    const program = this.gl.createProgram()
    if (!program) {
      throw new Error('Failed to create program')
    }
    this.program = program

    this.ratio = window.devicePixelRatio
    this.width = this.container.offsetWidth
    this.height = this.container.offsetHeight

    this.image = options.image
    this.depthImage = options.depthImage
    this.verticalThreshold = options.verticalThreshold ?? 0.1
    this.horizontalThreshold = options.horizontalThreshold ?? 0.1
    this.crop = options.crop ?? false
    this.useMouse = options.useMouse ?? true
    this.useScreen = options.useScreen ?? false

    this.resizeHandler = this.resizeHandler.bind(this)
    this.render = this.render.bind(this)

    this.createScene()
    this.resizeHandler()
    this.addTexture()

    if (this.useMouse) {
      this.useMouseFn()
    }
  }

  private addShader(src: string, type: number) {
    const shader = this.gl.createShader(type)
    if (!shader) {
      throw new Error('Failed to create shader')
    }

    this.gl.shaderSource(shader, src)
    this.gl.compileShader(shader)
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      console.error(this.gl.getShaderInfoLog(shader))
      throw new Error('Shader compile error')
    }

    this.gl.attachShader(this.program, shader)
  }

  private resizeHandler() {
    this.width = this.container.offsetWidth
    this.height = this.container.offsetHeight
    this.canvas.width = this.width * this.ratio
    this.canvas.height = this.height * this.ratio
    this.canvas.style.width = `${this.width}px`
    this.canvas.style.height = `${this.height}px`

    let a1, a2
    if (this.crop === false) {
      if (this.height / this.width < this.imageAspect) {
        a1 = (this.width / this.height) * this.imageAspect
        a2 = 1
      } else {
        a1 = 1
        a2 = this.height / this.width / this.imageAspect
      }
    } else {
      if (this.height / this.width < this.imageAspect) {
        a1 = 1
        a2 = this.height / this.width / this.imageAspect
      } else {
        a1 = (this.width / this.height) * this.imageAspect
        a2 = 1
      }
    }

    this.uResolution?.set(this.width, this.height, a1, a2)
    this.uRatio?.set(1 / this.ratio)
    this.uThreshold?.set(this.horizontalThreshold, this.verticalThreshold)
    this.uCrop?.set(this.crop ? 1 : 0)

    this.gl.viewport(0, 0, this.width * this.ratio, this.height * this.ratio)
  }

  private resize() {
    this.resizeHandler()
    window.addEventListener('resize', this.resizeHandler)
  }

  private createScene() {
    this.addShader(vertexShaderSource, this.gl.VERTEX_SHADER)
    this.addShader(fragmentShaderSource, this.gl.FRAGMENT_SHADER)

    this.gl.linkProgram(this.program)
    this.gl.useProgram(this.program)

    this.uResolution = new Uniform('resolution', '4f', this.program, this.gl)
    this.uMouse = new Uniform('mouse', '2f', this.program, this.gl)
    this.uRatio = new Uniform('pixelRatio', '1f', this.program, this.gl)
    this.uThreshold = new Uniform('threshold', '2f', this.program, this.gl)
    this.uCrop = new Uniform('crop', '1i', this.program, this.gl)

    this.billboard = new Rect(this.gl)
    this.positionLocation = this.gl.getAttribLocation(
      this.program,
      'a_position'
    )
    this.gl.enableVertexAttribArray(this.positionLocation)
    this.gl.vertexAttribPointer(
      this.positionLocation,
      2,
      this.gl.FLOAT,
      false,
      0,
      0
    )
  }

  private loadImage(source: string, callback: () => void) {
    const image = new Image()
    image.src = source

    image.onload = callback

    return image
  }

  private loadImages(
    images: string[],
    callback: (images: HTMLImageElement[]) => void
  ) {
    let loaded = 0
    const total = images.length
    const imgs: HTMLImageElement[] = []

    const onImageLoad = () => {
      loaded++
      if (loaded === total) {
        callback(imgs)
      }
    }

    for (let i = 0; i < total; i++) {
      const img = this.loadImage(images[i], onImageLoad)
      imgs.push(img)
    }
  }

  private addTexture() {
    this.loadImages([this.image, this.depthImage], this.start.bind(this))
  }

  private start(images: HTMLImageElement[]) {
    this.imageAspect = images[0].naturalHeight / images[0].naturalWidth

    for (let i = 0; i < images.length; i++) {
      const texture = this.gl.createTexture()
      if (!texture) {
        throw new Error('Failed to create texture')
      }
      this.gl.bindTexture(this.gl.TEXTURE_2D, texture)

      this.gl.texParameteri(
        this.gl.TEXTURE_2D,
        this.gl.TEXTURE_WRAP_S,
        this.gl.CLAMP_TO_EDGE
      )
      this.gl.texParameteri(
        this.gl.TEXTURE_2D,
        this.gl.TEXTURE_WRAP_T,
        this.gl.CLAMP_TO_EDGE
      )
      this.gl.texParameteri(
        this.gl.TEXTURE_2D,
        this.gl.TEXTURE_MIN_FILTER,
        this.gl.LINEAR
      )
      this.gl.texParameteri(
        this.gl.TEXTURE_2D,
        this.gl.TEXTURE_MAG_FILTER,
        this.gl.LINEAR
      )

      this.gl.texImage2D(
        this.gl.TEXTURE_2D,
        0,
        this.gl.RGBA,
        this.gl.RGBA,
        this.gl.UNSIGNED_BYTE,
        images[i]
      )
      this.textures.push(texture)
    }

    const u_image0Location = this.gl.getUniformLocation(this.program, 'image0')
    const u_image1Location = this.gl.getUniformLocation(this.program, 'image1')

    this.gl.uniform1i(u_image0Location, 0)
    this.gl.uniform1i(u_image1Location, 1)

    this.gl.activeTexture(this.gl.TEXTURE0)
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures[0])
    this.gl.activeTexture(this.gl.TEXTURE1)
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures[1])

    this.resize()
    this.render()
  }

  private render() {
    this.mouseX += this.mouseTargetX - this.mouseX
    this.mouseY += this.mouseTargetY - this.mouseY

    this.uMouse?.set(this.mouseX, this.mouseY)

    this.billboard?.render()
    requestAnimationFrame(this.render)
  }

  private useMouseFn() {
    if (this.useScreen) {
      window.addEventListener('mousemove', (e) => {
        const halfX = this.width / 2
        const halfY = this.height / 2

        this.mouseTargetX = (halfX - e.clientX) / halfX
        this.mouseTargetY = (halfY - e.clientY) / halfY
      })
      return
    }

    this.canvas.addEventListener('mousemove', (e) => {
      const halfX = this.width / 2
      const halfY = this.height / 2

      this.mouseTargetX = (halfX - e.clientX) / halfX
      this.mouseTargetY = (halfY - e.clientY) / halfY
    })
  }

  public rerender(options: ViewerOptions) {
    console.log('rerender', options)

    this.image = options.image
    this.depthImage = options.depthImage
    this.verticalThreshold = options.verticalThreshold ?? 0.1
    this.horizontalThreshold = options.horizontalThreshold ?? 0.1
    this.crop = options.crop ?? false
    this.useMouse = options.useMouse ?? false
    this.useScreen = options.useScreen ?? false

    this.textures = []
    this.addTexture()
  }

  public destroy() {
    window.removeEventListener('resize', this.resizeHandler)
    this.container.removeChild(this.canvas)
  }
}
