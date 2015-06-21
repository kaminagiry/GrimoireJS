import CanvasManager = require("../../../Core/CanvasManager");
import GomlTreeNodeBase = require("../../GomlTreeNodeBase");
import JThreeContext = require("../../../Core/JThreeContext");
import JThreeContextProxy = require("../../../Core/JThreeContextProxy");
import Scene = require("../../../Core/Scene");
import $ = require("jquery"); 
import GomlLoader = require("../../GomlLoader");
import Color4 = require("../../../Base/Color/Color4");
class RendererNode extends GomlTreeNodeBase
{

    canvasManager:CanvasManager;

    targetCanvas:HTMLCanvasElement;

    constructor(elem:HTMLElement,loader:GomlLoader,parent:GomlTreeNodeBase) {
        super(elem,loader,parent);
        var selected=document.querySelector(this.Frame);
        this.targetCanvas=document.createElement("canvas");
        if(selected)selected.appendChild(this.targetCanvas);
        else
          document.getElementsByTagName("body").item(0).appendChild(this.targetCanvas);
        this.targetCanvas.classList.add("x-j3-c-" + this.ID);
        this.canvasManager = CanvasManager.fromCanvasElement(this.targetCanvas);
        this.canvasManager.ClearColor=this.ClearColor;
        this.targetCanvas.width=this.Width;
        this.targetCanvas.height=this.Height;
        var context=JThreeContextProxy.getJThreeContext();
        context.addCanvasManager(this.canvasManager);
        var defaultWidth=this.targetCanvas.parentElement.clientWidth;
        var defaultHeight=this.targetCanvas.parentElement.clientWidth;
        this.attributes.defineAttribute({
          "width":{
            value:defaultWidth,converter:"number",handler:(v)=>{this.targetCanvas.width=v.Value;}
          },
          "height":{
            value:defaultHeight,converter:"number",handler:(v)=>{this.targetCanvas.height=v.Value;}
          },
          "clearColor":{
            value:'#0FF',converter:"color4",handler:(v)=>{this.canvasManager.ClearColor=v.Value;}
                     },
          "fullscreen":
          {
              value:false,converter:"boolean",handler:(v)=>{
                  this.canvasManager.FullScreen=v.Value;
              }
          }
        });
        this.attributes.applyDefaultValue();
    }

        private clearColor:Color4;
        get ClearColor():Color4
        {
          this.clearColor=this.clearColor||Color4.parseColor(this.element.getAttribute('clearColor')||'#0FF');
          return this.clearColor;
        }

        private width:number;
        get Width():number{
          this.width=this.width||parseInt(this.element.getAttribute('width'))||300;
          return this.width;
        }

        private height:number;
        get Height():number{
          this.height=this.height||parseInt(this.element.getAttribute('height'))||300;
          return this.height;
        }

    get Frame(): string {
        return this.element.getAttribute("frame")||"body";
    }

}

export=RendererNode;
