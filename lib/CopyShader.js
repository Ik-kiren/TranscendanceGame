/**
 * Minified by jsDelivr using Terser v5.19.2.
 * Original file: /npm/three@0.164.1/examples/jsm/shaders/CopyShader.js
 *
 * Do NOT use SRI with dynamically generated files! More information: https://www.jsdelivr.com/using-sri-with-dynamic-files
 */
const CopyShader={name:"CopyShader",uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:"\n\n\t\tvarying vec2 vUv;\n\n\t\tvoid main() {\n\n\t\t\tvUv = uv;\n\t\t\tgl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n\n\t\t}",fragmentShader:"\n\n\t\tuniform float opacity;\n\n\t\tuniform sampler2D tDiffuse;\n\n\t\tvarying vec2 vUv;\n\n\t\tvoid main() {\n\n\t\t\tvec4 texel = texture2D( tDiffuse, vUv );\n\t\t\tgl_FragColor = opacity * texel;\n\n\n\t\t}"};export{CopyShader};
