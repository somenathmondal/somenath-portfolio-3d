uniform vec3 baseColor;
uniform vec3 tipColor;
uniform float time;
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewPosition;
varying float vWindForce;

void main() {
    // 1. Color gradient from root (dark green/earth) to tip (fresh emerald/warm gold)
    float mixFactor = vUv.y;
    vec3 grassColor = mix(baseColor, tipColor, mixFactor);
    
    // Add subtle wind shimmer
    grassColor += vec3(0.06, 0.1, 0.04) * vWindForce * mixFactor;
    
    // 2. Translucency / Subsurface simulation for organic glowing grass in sun
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewPosition);
    vec3 lightDir = normalize(vec3(4.0, 7.0, 3.0));
    
    float diffuse = max(dot(normal, lightDir), 0.0);
    
    // Simple translucent backlighting glow (backlight hits translucent blade tips)
    float backlight = max(dot(viewDir, -lightDir), 0.0) * pow(mixFactor, 2.0);
    vec3 finalColor = grassColor * (0.4 + diffuse * 0.6) + vec3(0.85, 0.95, 0.6) * backlight * 0.15;
    
    gl_FragColor = vec4(finalColor, 1.0);
}
