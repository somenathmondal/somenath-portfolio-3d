uniform float uTime;
uniform vec2 uMouse;        // pointer position in plane UV space
uniform float uMouseActive; // damped 0..1, 1 while pointer is over the plane
uniform float uRipple;      // effect toggle
uniform float uBend;        // signed, scroll-velocity driven (already damped in JS)
uniform float uShock;       // shockwave progress 0..1, 0 = idle
uniform vec2 uShockCenter;  // click position in UV space
uniform vec2 uSize;         // plane dimensions, for aspect-correct distances

varying vec2 vUv;
varying float vDistort;

void main() {
  vUv = uv;
  vec3 pos = position;
  float distort = 0.0;

  vec2 aspect = vec2(uSize.x / uSize.y, 1.0);

  // Ripple — a liquid dent that follows the cursor, with a faint travelling wave around it
  float d = distance(uv * aspect, uMouse * aspect);
  float bump = exp(-d * d * 26.0) * uRipple * uMouseActive;
  pos.z -= bump * 0.22;
  float wave = sin(d * 34.0 - uTime * 6.0) * 0.018 * smoothstep(0.55, 0.0, d) * uRipple * uMouseActive;
  pos.z += wave;
  distort += bump + abs(wave) * 6.0;

  // Bend — vertical bow proportional to scroll velocity (top/bottom lag behind the middle)
  float centeredY = uv.y - 0.5;
  pos.z += uBend * (centeredY * centeredY - 0.0833) * 4.0;
  distort += abs(uBend) * 0.5;

  // Shockwave — an expanding ring from the click point that fades as it travels
  float sd = distance(uv * aspect, uShockCenter * aspect);
  float ringRadius = uShock * 1.4;
  float ring = exp(-pow((sd - ringRadius) * 9.0, 2.0)) * (1.0 - uShock) * step(0.001, uShock);
  pos.z += ring * 0.14;
  distort += ring * 1.5;

  vDistort = distort;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
