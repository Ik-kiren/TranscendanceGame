/**
 * Minified by jsDelivr using Terser v5.19.2.
 * Original file: /npm/three@0.164.1/examples/jsm/postprocessing/Pass.js
 *
 * Do NOT use SRI with dynamically generated files! More information: https://www.jsdelivr.com/using-sri-with-dynamic-files
 */
import{BufferGeometry,Float32BufferAttribute,OrthographicCamera,Mesh}from"./three.module.min.js";class Pass{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error("THREE.Pass: .render() must be implemented in derived pass.")}dispose(){}}const _camera=new OrthographicCamera(-1,1,1,-1,0,1);class FullscreenTriangleGeometry extends BufferGeometry{constructor(){super(),this.setAttribute("position",new Float32BufferAttribute([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new Float32BufferAttribute([0,2,0,0,2,0],2))}}const _geometry=new FullscreenTriangleGeometry;class FullScreenQuad{constructor(e){this._mesh=new Mesh(_geometry,e)}dispose(){this._mesh.geometry.dispose()}render(e){e.render(this._mesh,_camera)}get material(){return this._mesh.material}set material(e){this._mesh.material=e}}export{Pass,FullScreenQuad};
