uniform float time;
uniform float windSpeed;
uniform vec3 uMousePosition;
uniform float uInfluenceRadius;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewPosition;
varying float vWindForce;

void main() {
    vUv = uv;
    vec3 pos = position;
    
    // Wind factor: sway increases quadratically from base (y=0) to tip (y=height)
    float heightFactor = pow(uv.y, 2.0); 
    
    // Extract instance position from instanceMatrix for spatial wave variance
    vec3 instancePos = vec3(instanceMatrix[3][0], instanceMatrix[3][1], instanceMatrix[3][2]);
    
    // Multi-layered wind noise
    float windX = sin(instancePos.x * 0.8 + time * windSpeed) * cos(instancePos.z * 0.6 + time * (windSpeed * 0.7));
    float windZ = cos(instancePos.z * 1.2 + time * (windSpeed * 0.9)) * sin(instancePos.x * 0.5 + time * (windSpeed * 0.5));
    
    // Mouse Interaction Displacement Math:
    // Calculate direction and distance from mouse to grass instance on the XZ ground plane
    vec2 diffXZ = instancePos.xz - uMousePosition.xz;
    float distXZ = length(diffXZ);
    
    float mouseDisplacementX = 0.0;
    float mouseDisplacementZ = 0.0;
    float mouseDisplacementY = 0.0;
    
    if (distXZ < uInfluenceRadius) {
        // Safe normalize to avoid divide by zero glitches if cursor sits perfectly on blade root
        vec2 dirXZ = distXZ > 0.001 ? normalize(diffXZ) : vec2(1.0, 0.0);
        
        // Non-linear smoothstep bending decay as distance increases to the boundary edge
        float strength = (1.0 - smoothstep(0.0, uInfluenceRadius, distXZ)) * 0.55;
        
        // Displace tip coordinates outwards (XZ) and push down (Y)
        mouseDisplacementX = dirXZ.x * strength * heightFactor;
        mouseDisplacementZ = dirXZ.y * strength * heightFactor;
        mouseDisplacementY = -strength * 0.22 * heightFactor;
    }
    
    // Displace vertex combining both wind sway and mouse flattening
    pos.x += (windX * 0.22 * heightFactor) + mouseDisplacementX;
    pos.z += (windZ * 0.15 * heightFactor) + mouseDisplacementZ;
    pos.y += (-abs(windX * windZ) * 0.05 * heightFactor) + mouseDisplacementY; // Pull blade down as it bends
    
    vWindForce = (windX + windZ) * 0.5 + (mouseDisplacementX + mouseDisplacementZ) * 0.5;
    
    vec4 worldPosition = instanceMatrix * vec4(pos, 1.0);
    vec4 mvPosition = modelViewMatrix * worldPosition;
    gl_Position = projectionMatrix * mvPosition;
    
    vViewPosition = -mvPosition.xyz;
    vNormal = normalMatrix * (mat3(instanceMatrix) * normal);
}
