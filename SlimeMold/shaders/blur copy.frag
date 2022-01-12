#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float[750 * 750 * 4] pixels;

void main() {
	vec2 st = gl_FragCoord.xy/u_resolution.xy;

	gl_FragColor = vec4(st.x, st.y, 1.0, 1.0);
}