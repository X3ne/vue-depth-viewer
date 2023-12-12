#ifdef GL_ES
  precision mediump float;
#endif

uniform vec4 resolution;
uniform vec2 mouse;
uniform vec2 threshold;
uniform float pixelRatio;
uniform bool crop;
uniform sampler2D image0;
uniform sampler2D image1;

const float HALF = 0.5;
const float ONE = 1.0;
const float BORDER_WIDTH = 0.0001;

vec2 mirrored(vec2 v) {
  vec2 m = mod(v, 2.0);
  return mix(m, 2.0 - m, step(1.0, m));
}

void main() {
  vec2 uv = pixelRatio * gl_FragCoord.xy / resolution.xy;
  vec2 vUv = (uv - vec2(HALF)) * resolution.zw + vec2(HALF);
  vUv.y = ONE - vUv.y;

  vec4 depthMapValue = texture2D(image1, mirrored(vUv));

  vec2 displacement = (depthMapValue.r - HALF) * mouse.xy / threshold;
  vec2 fake3d = vUv + displacement;

  if (!crop && (
    fake3d.x < BORDER_WIDTH || fake3d.x > ONE - BORDER_WIDTH ||
    fake3d.y < BORDER_WIDTH || fake3d.y > ONE - BORDER_WIDTH
  )) {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
  } else {
    gl_FragColor = texture2D(image0, mirrored(fake3d));
  }
}
