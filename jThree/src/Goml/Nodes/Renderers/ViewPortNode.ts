import JThreeObject=require('Base/JThreeObject');
import GomlTreeNodeBase = require("../../GomlTreeNodeBase");
import Color4 = require("../../../Base/Color/Color4");
import ViewportRenderer = require("../../../Core/Renderers/ViewportRenderer");
import RendererNodeBase = require("./RendererNodeBase");
import Rectangle = require("../../../Math/Rectangle");
import GomlLoader = require("../../GomlLoader");
import JThreeContextProxy = require("../../../Core/JThreeContextProxy");
import JThreeContext = require("../../../Core/JThreeContext");
import Scene = require("../../../Core/Scene");
import SceneObjectNodeBase = require("../SceneObjects/SceneObjectNodeBase");
import CameraNodeBase = require("../SceneObjects/Cameras/CameraNodeBase");
import TextureRenderer = require('../../../Core/Renderers/TextureRenderer');
import FramebufferAttachmentType = require('../../../Wrapper/FramebufferAttachmentType');
class ViewPortNode extends GomlTreeNodeBase {

  private parentRendererNode:RendererNodeBase;

  private targetRenderer:ViewportRenderer;

    constructor(elem: HTMLElement,loader:GomlLoader,parent:GomlTreeNodeBase)
    {
        super(elem,loader,parent);
    }

    afterLoad(){
      var rdr:RendererNodeBase=this.parentRendererNode=<RendererNodeBase>this.parent;
      var defaultRect = rdr.CanvasManager.getDefaultRectangle();
      this.targetRenderer=new ViewportRenderer(rdr.CanvasManager,defaultRect);
      var context:JThreeContext=JThreeContextProxy.getJThreeContext();
      var cameraNode=this.resolveCamera();
      this.targetRenderer.Camera=cameraNode.TargetCamera;
      var scene:Scene=cameraNode.ContainedSceneNode.targetScene;
      //test code begin
      var tex=context.ResourceManager.createTexture("fbo-tex",defaultRect.Width,defaultRect.Height);
      var fbo = context.ResourceManager.createFBO("fbo");
      fbo.getForContext(this.targetRenderer.ContextManager).attachTexture(FramebufferAttachmentType.ColorAttachment0,tex);
      var texRenderer = new TextureRenderer(this.targetRenderer.ContextManager,defaultRect,fbo);
      texRenderer.Camera=cameraNode.TargetCamera;
      scene.addRenderer(texRenderer);
      //test code end
      scene.addRenderer(this.targetRenderer);

      
      this.attributes.defineAttribute({
        "width":{
          value:defaultRect.Width,
          converter:"number",handler:v=>{
            this.width=v.Value;
            this.updateViewportArea();
          }
        },
        "height":{
          value:defaultRect.Height,
          converter:"number",handler:v=>{
            this.height=v.Value;
            this.updateViewportArea();
          }
        },
        "left":{
          value:defaultRect.Left,
          converter:"number",handler:v=>{
            this.left=v.Value;
            this.updateViewportArea();
          }
        },
        "top":{
          value:defaultRect.Top,
          converter:"number",handler:v=>{
            this.top=v.Value;
            this.updateViewportArea();
          }
        }
      });
    }

    private updateViewportArea()
    {
      this.targetRenderer.ViewPortArea=new Rectangle(this.left,this.top,this.width, this.height);
    }

    private resolveCamera():CameraNodeBase
    {
      var camTags=this.loader.nodeRegister.getAliasMap<SceneObjectNodeBase>("jthree.camera");
      if(!camTags.has(this.Cam))//if there was no specified camera
      {
        console.error("can not find camera");
        if(camTags.size==0)
        {
          console.error("There is no scene.");
        }else
        {

        }
        return null;
      }
      var targetCam=<CameraNodeBase>camTags.get(this.Cam);
      if(targetCam.ContainedSceneNode!=null)//if there was specified camera and there is Scene
      {
        return targetCam;
      }else
      {
        console.error("cant retrieve scene!");
      }
    }
    private cam:string;
    private left:number;
    private top:number;
    private width:number;
    private height:number;

    get Cam():string
    {
      this.cam=this.cam||this.element.getAttribute('cam');
      return this.cam;
    }

}

export=ViewPortNode;
