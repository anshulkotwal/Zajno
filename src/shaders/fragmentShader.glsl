uniform sampler2D uTexture;
varying vec2 vUv;
uniform vec2 uMouse;
uniform float uHover;

void main(){
    float blocks=20.;
    vec2 blockUv=floor(vUv*blocks)/blocks;
    float dis=length(blockUv-uMouse);
    float effect=smoothstep(.4,0.,dis);
    vec2 distortion=vec2(.08)*effect;
    vec4 color=texture2D(uTexture,vUv+(distortion*uHover));
    float gray=dot(color.rgb,vec3(.299,.587,.114));
    gl_FragColor=mix(vec4(vec3(gray),1.0),color,uHover);
}
