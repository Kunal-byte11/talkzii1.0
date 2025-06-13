// Uniforms passed from JavaScript (controlled by GUI)
uniform float u_time;
uniform float u_frequency;
uniform float u_red;   // Red color component (0.0 to 1.0)
uniform float u_green; // Green color component (0.0 to 1.0)
uniform float u_blue;  // Blue color component (0.0 to 1.0)

varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;

// --- Main Fragment Shader Logic ---
void main() {
    // Create a dynamic color based on position and time
    vec3 baseColor = vec3(u_red, u_green, u_blue);
    
    // Add frequency-based pulsing
    float pulse = sin(u_time * 2.0 + u_frequency * 10.0) * 0.5 + 0.5;
    
    // Add position-based variation
    float positionEffect = sin(vPosition.x * 2.0 + u_time) * 
                         cos(vPosition.y * 2.0 + u_time) * 
                         sin(vPosition.z * 2.0 + u_time);
    
    // Combine effects
    vec3 finalColor = baseColor * (0.8 + 0.2 * pulse) * (0.9 + 0.1 * positionEffect);
    
    // Add fresnel effect for edge highlighting
    float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.0);
    finalColor += vec3(1.0) * fresnel * 0.5;
    
    // Output final color with some transparency
    gl_FragColor = vec4(finalColor, 0.9);
} 