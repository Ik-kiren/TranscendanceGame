/**
 * Minified by jsDelivr using Terser v5.19.2.
 * Original file: /npm/three@0.164.1/examples/jsm/shaders/LuminosityHighPassShader.js
 *
 * Do NOT use SRI with dynamically generated files! More information: https://www.jsdelivr.com/using-sri-with-dynamic-files
 */
import{Color}from"./three.module.min.js";const LuminosityHighPassShader={name:"LuminosityHighPassShader",shaderID:"luminosityHighPass",uniforms:{tDiffuse:{value:null},luminosityThreshold:{value:1},smoothWidth:{value:1},defaultColor:{value:new Color(0)},defaultOpacity:{value:0}},vertexShader:"\n\n\t\tvarying vec2 vUv;\n\n\t\tvoid main() {\n\n\t\t\tvUv = uv;\n\n\t\t\tgl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n\n\t\t}",fragmentShader:"\n\n\t\tuniform sampler2D tDiffuse;\n\t\tuniform vec3 defaultColor;\n\t\tuniform float defaultOpacity;\n\t\tuniform float luminosityThreshold;\n\t\tuniform float smoothWidth;\n\n\t\tvarying vec2 vUv;\n\n\t\tvoid main() {\n\n\t\t\tvec4 texel = texture2D( tDiffuse, vUv );\n\n\t\t\tvec3 luma = vec3( 0.299, 0.587, 0.114 );\n\n\t\t\tfloat v = dot( texel.xyz, luma );\n\n\t\t\tvec4 outputColor = vec4( defaultColor.rgb, defaultOpacity );\n\n\t\t\tfloat alpha = smoothstep( luminosityThreshold, luminosityThreshold + smoothWidth, v );\n\n\t\t\tgl_FragColor = mix( outputColor, texel, alpha );\n\n\t\t}"};export{LuminosityHighPassShader};
