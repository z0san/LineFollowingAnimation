#ifdef GL_ES
precision highp float;
#endif

uniform vec2 u_resolution;
// predefined guass function
uniform float u_gauss[124];
uniform sampler2D tex0;
uniform float u_decayFactor;

const float gaussSize = 2.0;

void main() {
	vec2 st = gl_FragCoord.xy/u_resolution.xy;
	vec3 color = vec3(0, 0, 0);

	// for all neighbours
	for (float x = -gaussSize; x <= gaussSize; x++) {
		for (float y = -gaussSize; y <= gaussSize; y++) {
			// clamp the values so we don't check coords off the screen
			float useX = clamp(st.x + (x / u_resolution.x), 0.0, u_resolution.x);
			float useY = clamp(st.y + (y / u_resolution.y), 0.0, u_resolution.y);
			color += u_gauss[int(x + gaussSize + (((gaussSize * 2.0) + 1.0) * (y + gaussSize)))] *
						texture2D(tex0, vec2(useX, useY)).rgb;
			// diffuse faster
			color.rgb *= u_decayFactor;
		}
	}
	gl_FragColor = vec4(color, 1.0);
}
