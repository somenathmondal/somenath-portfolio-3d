uniform sampler2D uMap;
uniform float uBrightness;  // slot emphasis: 1 at front, dimmer for neighbors
uniform float uDevelop;     // slot proximity: 1 = front (fully developed), 0 = far
uniform float uDissolve;    // effect toggle
uniform float uChroma;      // follows the ripple toggle
uniform vec3 uAccent;       // project accent for the developing edge
uniform vec2 uUvScale;      // cover-fit crop
uniform vec2 uUvOffset;

varying vec2 vUv;
varying float vDistort;

// Cheap value-noise fbm for the dissolve pattern
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
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p *= 2.1;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = vUv * uUvScale + uUvOffset;

  // Chromatic split proportional to how distorted this fragment is
  float shift = vDistort * 0.016 * uChroma;
  vec3 col;
  col.r = texture2D(uMap, uv + vec2(shift, 0.0)).r;
  col.g = texture2D(uMap, uv).g;
  col.b = texture2D(uMap, uv - vec2(shift, 0.0)).b;

  // Dissolve — the image "develops" through noise as the project reaches the front slot.
  // Undeveloped areas fall back to an accent-washed monochrome; the reveal edge glows accent.
  float n = fbm(vUv * 5.0);
  float t = uDevelop * 1.3 - 0.15;
  float reveal = smoothstep(n - 0.1, n + 0.1, t);
  float edge = max(0.0, 1.0 - abs(t - n) * 7.0);
  float gray = dot(col, vec3(0.299, 0.587, 0.114));
  vec3 undeveloped = mix(vec3(gray), uAccent, 0.4) * 0.65;
  vec3 dissolved = mix(undeveloped, col, reveal) + uAccent * edge * 0.3;
  col = mix(col, dissolved, uDissolve);

  col *= uBrightness;
  gl_FragColor = vec4(col, 1.0);
}
