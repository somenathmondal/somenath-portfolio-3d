uniform sampler2D uMap;
uniform float uBrightness;  // slot emphasis: 1 at front, dimmer for neighbors
uniform float uDevelop;     // slot proximity: 1 = front (fully developed), 0 = far
uniform float uDissolve;    // effect toggle
uniform float uRipple;      // effect toggle — drives the refraction lens
uniform vec2 uMouse;        // pointer position in plane UV space (damped)
uniform float uMouseActive; // damped 0..1 while pointer is over the plane
uniform float uShock;       // shockwave progress 0..1
uniform vec2 uShockCenter;
uniform vec2 uSize;         // plane dimensions, for aspect-correct distances
uniform vec3 uAccent;       // project accent for the developing edge
uniform vec2 uUvScale;      // cover-fit crop
uniform vec2 uUvOffset;

varying vec2 vUv;

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
  vec2 aspect = vec2(uSize.x / uSize.y, 1.0);

  // Lens refraction — the cursor bump behaves like a glass lens: samples are pulled
  // toward its center, magnifying the image under the cursor. No color splitting.
  vec2 refracted = vUv;
  float d = distance(vUv * aspect, uMouse * aspect);
  float bump = exp(-d * d * 26.0) * uRipple * uMouseActive;
  vec2 toMouse = (uMouse - vUv) * aspect;
  float toMouseLen = max(length(toMouse), 0.0001);
  refracted += (toMouse / toMouseLen) * bump * 0.06;

  // The click shockwave ring refracts too, so the click feels physical
  float sd = distance(vUv * aspect, uShockCenter * aspect);
  float ringRadius = uShock * 1.4;
  float ring = exp(-pow((sd - ringRadius) * 9.0, 2.0)) * (1.0 - uShock) * step(0.001, uShock);
  vec2 toShock = (uShockCenter - vUv) * aspect;
  float toShockLen = max(length(toShock), 0.0001);
  refracted += (toShock / toShockLen) * ring * 0.035;

  vec2 uv = refracted * uUvScale + uUvOffset;
  vec3 col = texture2D(uMap, uv).rgb;

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
