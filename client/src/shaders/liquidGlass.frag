uniform float time;
uniform vec3 color;
uniform float opacity;
varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;

void main() {
    // Create liquid glass effect
    float wave1 = sin(vUv.x * 10.0 + time * 2.0) * 0.5 + 0.5;
    float wave2 = cos(vUv.y * 8.0 + time * 1.5) * 0.5 + 0.5;
    float wave3 = sin(vUv.x * 6.0 + vUv.y * 6.0 + time * 3.0) * 0.5 + 0.5;
    
    float liquid = (wave1 + wave2 + wave3) / 3.0;
    
    // Add fresnel effect for glass-like appearance
    vec3 viewDirection = normalize(cameraPosition - vPosition);
    float fresnel = 1.0 - dot(viewDirection, vNormal);
    fresnel = pow(fresnel, 2.0);
    
    // Combine effects
    vec3 finalColor = color * liquid + vec3(1.0) * fresnel * 0.3;
    float finalOpacity = opacity * (0.7 + liquid * 0.3);
    
    gl_FragColor = vec4(finalColor, finalOpacity);
}
