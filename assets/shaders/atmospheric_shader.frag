precision highp float;
varying vec2 v_texCoord;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
}

void main() {
    vec2 uv = v_texCoord;
    vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
    
    // Premium Midnight Navy Base
    vec3 color = vec3(0.0196, 0.0353, 0.0706); // #050912
    
    // Soft Atmospheric Glows (Upper and Edges)
    // Warm Champagne/Gold Ambient
    float upperGlow = smoothstep(1.0, 0.0, uv.y + 0.2);
    color += vec3(0.831, 0.686, 0.416) * (upperGlow * 0.06); 
    
    // Subtle Cyan Edge Glow
    float sideGlow = smoothstep(0.5, 0.0, abs(uv.x - 0.5));
    color += vec3(0.133, 0.827, 0.933) * (sideGlow * 0.03);

    // Floating Crystalline Particles & Stars
    for(float i = 0.0; i < 35.0; i++) {
        float h = hash(vec2(i, 789.12));
        float speed = 0.04 + h * 0.08;
        
        // Move particles slowly around outer areas
        vec2 pos = vec2(
            fract(h * 123.45 + u_time * speed * 0.05) * 2.4 - 1.2,
            fract(h * 456.78 + u_time * speed * 0.03) * 2.4 - 1.2
        );
        
        // Keep center mostly clean
        float centerDist = length(pos);
        float mask = smoothstep(0.2, 0.6, centerDist);
        
        float size = 0.0015 + h * 0.004;
        float dist = length(p - pos);
        
        // Soft shimmer
        float alpha = smoothstep(size + 0.01, size, dist) * (0.2 + 0.8 * sin(u_time * 0.4 + h * 6.28));
        
        vec3 pCol = vec3(1.0); // Star
        if(h < 0.25) pCol = vec3(0.133, 0.827, 0.933); // Cyan Crystal
        else if(h < 0.5) pCol = vec3(0.831, 0.686, 0.416); // Champagne Crystal
        else if(h < 0.75) pCol = vec3(0.95, 0.85, 0.65); // Warm Star
        
        color += pCol * alpha * 0.35 * mask;
    }
    
    gl_FragColor = vec4(color, 1.0);
}
