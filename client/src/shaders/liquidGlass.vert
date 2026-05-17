uniform float time;
varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;

void main() {
    vUv = uv;
    vPosition = position;
    vNormal = normal;
    
    // Add liquid wave distortion
    vec3 pos = position;
    pos.x += sin(pos.y * 10.0 + time * 2.0) * 0.02;
    pos.y += cos(pos.x * 8.0 + time * 1.5) * 0.02;
    pos.z += sin(pos.x * 6.0 + pos.y * 6.0 + time * 3.0) * 0.01;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
