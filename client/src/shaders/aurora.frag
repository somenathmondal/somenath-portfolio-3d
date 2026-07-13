uniform float uTime;
uniform vec3 uAccent;   // active project accent (damped in JS)
uniform vec3 uBase;     // theme background color
uniform vec2 uMouse;    // pointer in NDC (-1..1), damped in JS
uniform float uIsDark;  // 1 in dark theme — aurora glows brighter there

varying vec2 vUv;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p *= 2.03;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 p = vUv * 2.0 - 1.0;

  // Domain-warped fbm: slow weather drifting through the frame
  vec2 drift = vec2(uTime * 0.03, -uTime * 0.02);
  vec2 warp = vec2(fbm(p * 1.4 + drift), fbm(p * 1.4 - drift + 5.2));
  float field = fbm(p * 1.1 + warp * 0.9 + drift);

  // The aurora leans toward the cursor
  float lean = exp(-distance(p, uMouse) * 1.4) * 0.35;
  field += lean;

  float amount = smoothstep(0.35, 0.95, field) * mix(0.16, 0.3, uIsDark);
  vec3 col = mix(uBase, uAccent, amount);

  // Faint vignette keeps edges quiet so the wheel stays the subject
  float vignette = smoothstep(1.6, 0.4, length(p));
  col = mix(uBase, col, vignette);

  gl_FragColor = vec4(col, 1.0);
}
