/**
 * Minified by jsDelivr using Terser v5.19.2.
 * Original file: /npm/three@0.164.1/examples/jsm/postprocessing/RenderPass.js
 *
 * Do NOT use SRI with dynamically generated files! More information: https://www.jsdelivr.com/using-sri-with-dynamic-files
 */
import{Color}from"./three.module.min.js";import{Pass}from"./Pass.js";class RenderPass extends Pass{constructor(e,r,l=null,a=null,t=null){super(),this.scene=e,this.camera=r,this.overrideMaterial=l,this.clearColor=a,this.clearAlpha=t,this.clear=!0,this.clearDepth=!1,this.needsSwap=!1,this._oldClearColor=new Color}render(e,r,l){const a=e.autoClear;let t,s;e.autoClear=!1,null!==this.overrideMaterial&&(s=this.scene.overrideMaterial,this.scene.overrideMaterial=this.overrideMaterial),null!==this.clearColor&&(e.getClearColor(this._oldClearColor),e.setClearColor(this.clearColor)),null!==this.clearAlpha&&(t=e.getClearAlpha(),e.setClearAlpha(this.clearAlpha)),1==this.clearDepth&&e.clearDepth(),e.setRenderTarget(this.renderToScreen?null:l),!0===this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),e.render(this.scene,this.camera),null!==this.clearColor&&e.setClearColor(this._oldClearColor),null!==this.clearAlpha&&e.setClearAlpha(t),null!==this.overrideMaterial&&(this.scene.overrideMaterial=s),e.autoClear=a}}export{RenderPass};
