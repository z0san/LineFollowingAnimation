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
	st.y = 1.0 - st.y;

	// for all neighbours
	for (float x = -gaussSize; x <= gaussSize; x++) {
		for (float y = -gaussSize; y <= gaussSize; y++) {
			// clamp the values so we don't check coords off the screen
			float useX = st.x + (x / u_resolution.x);
			float useY = st.y + (y / u_resolution.y);
			// use black outside to allow things to diffuse
			if (useX > 0.0 && useX < u_resolution.x && useY > 0.0 && useY < u_resolution.y) {
				color += u_gauss[int(x + gaussSize + (((gaussSize * 2.0) + 1.0) * (y + gaussSize)))] *
							texture2D(tex0, vec2(useX, useY)).rgb;
				// diffuse faster
				color.r = pow(color.r, u_decayFactor);
				color.g = pow(color.g, u_decayFactor);
				color.b = pow(color.b, u_decayFactor);
			}
		}
	}

	gl_FragColor = vec4(color, 1.0);
}
