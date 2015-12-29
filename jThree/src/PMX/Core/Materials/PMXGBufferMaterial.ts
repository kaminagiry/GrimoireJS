import BasicMaterial = require("../../../Core/Materials/Base/BasicMaterial");
﻿import Material = require('../../../Core/Materials/Material');
import Program = require("../../../Core/Resources/Program/Program");
import BasicRenderer = require("../../../Core/Renderers/BasicRenderer");
import Geometry = require("../../../Core/Geometries/Geometry");
import SceneObject = require("../../../Core/SceneObject");
import Matrix = require("../../../Math/Matrix");
import GLFeatureType = require("../../../Wrapper/GLFeatureType");
import Scene = require('../../../Core/Scene');
import PMXMaterial = require('./PMXMaterial');
import ResolvedChainInfo = require('../../../Core/Renderers/ResolvedChainInfo');
import PMXGeometry = require('./../PMXGeometry');
import Vector4 = require("../../../Math/Vector4");
import PMXMaterialParamContainer = require("./../PMXMaterialMorphParamContainer");
import IMaterialConfig = require("../../../Core/Materials/IMaterialConfig");
import Vector3 = require("../../../Math/Vector3");
import RenderStageBase = require("../../../Core/Renderers/RenderStages/RenderStageBase");

declare function require(string): string;
/**
 * the materials for PMX.
 */
class PMXGBufferMaterial extends Material
{

  //TODO these variables must be removed.
    protected primaryProgram: Program;

    protected secoundaryProgram: Program;

    protected thirdProgram: Program;

    protected __primaryMaterial:BasicMaterial;

    protected __secoundaryMaterial:BasicMaterial;

    protected __thirdMaterial:BasicMaterial;

    protected associatedMaterial: PMXMaterial;

    /**
     * Count of verticies
     */
    public get VerticiesCount()
    {
        return this.associatedMaterial.VerticiesCount;
    }

    /**
     * Offset of verticies in index buffer
     */
    public get VerticiesOffset()
    {
        return this.associatedMaterial.VerticiesOffset;
    }

    constructor(material: PMXMaterial)
    {
        super();
        this.associatedMaterial = material;
        this.__primaryMaterial = new BasicMaterial(require("../../Materials/PrimaryBuffer.html"));
        this.__secoundaryMaterial = new BasicMaterial(require("../../Materials/SecoundaryBuffer.html"));
        this.__thirdMaterial = new BasicMaterial(require("../../Materials/ThirdBuffer.html"));
        var vs = require('../../Shader/PMXGBufferVertex.glsl');
        var fs = require('../../Shader/PMXPrimaryGBufferFragment.glsl');
        this.primaryProgram = this.loadProgram("jthree.shaders.vertex.pmx.gbuffer", "jthree.shaders.fragment.pmx.gbuffer", "jthree.programs.pmx.gbuffer", vs, fs);
        var fs = require('../../Shader/PMXSecoundaryGBufferFragment.glsl');
        this.secoundaryProgram = this.loadProgram("jthree.shaders.vertex.pmx.gbuffer.s", "jthree.shaders.fragment.gbuffer.s", "jthree.programs.pmx.gbuffer.s", vs, fs);
        fs = require('../../Shader/PMXThirdGBufferFragment.glsl');
        this.thirdProgram = this.loadProgram("jthree.shaders.vertex.pmx.gbuffer.t", "jthree.shaders.fragment.gbuffer.t", "jthree.programs.pmx.gbuffer.t", vs, fs);
        this.setLoaded();
    }

    public configureMaterial(scene: Scene, renderStage: RenderStageBase, object: SceneObject, texs: ResolvedChainInfo,techniqueIndex:number,passIndex:number): void {
        if (!this.primaryProgram||this.associatedMaterial.Diffuse.A<1.0E-3) return;
        var renderer = renderStage.Renderer;
        super.configureMaterial(scene, renderStage, object, texs,techniqueIndex,passIndex);
        const skeleton = this.associatedMaterial.ParentModel.skeleton;
        switch (techniqueIndex) {
            case 0:
                this.__primaryMaterial.materialVariables = {
                  boneMatriciesTexture:skeleton.MatrixTexture,
                  brightness:this.associatedMaterial.Specular.W,
                  boneCount:skeleton.BoneCount
                };
                this.__primaryMaterial.configureMaterial(scene,renderStage,object,texs,1,0);
                break;
            case 1:
                this.__secoundaryMaterial.materialVariables = {
                  boneMatriciesTexture:skeleton.MatrixTexture,
                  boneCount:skeleton.BoneCount,
                  diffuse:PMXMaterialParamContainer.calcMorphedVectorValue(this.associatedMaterial.Diffuse.toVector(), this.associatedMaterial.addMorphParam, this.associatedMaterial.mulMorphParam, (t) => t.diffuse, 4),
                  texture:this.associatedMaterial.Texture,
                  sphere:this.associatedMaterial.Sphere
                };
                this.configureSecoundaryBuffer(scene, renderer, object, texs, techniqueIndex);
                break;
            case 2:
                this.configureThirdBuffer(scene, renderer, object, texs, techniqueIndex);
                break;
        }
//        object.Geometry.bindIndexBuffer(renderer.ContextManager);
    }

    // private configurePrimaryBuffer(scene: Scene, renderer: BasicRenderer, object: SceneObject, texs: ResolvedChainInfo, pass?: number) {
    //     var geometry = <PMXGeometry>object.Geometry;
    //     var programWrapper = this.primaryProgram.getForContext(renderer.ContextManager);
    //     var v = Matrix.multiply(renderer.Camera.projectionMatrix, renderer.Camera.viewMatrix);
    //     programWrapper.register({
    //         attributes: {
    //             position: geometry.PositionBuffer,
    //             normal: geometry.NormalBuffer,
    //             boneWeights: geometry.boneWeightBuffer,
    //             boneIndicies: geometry.boneIndexBuffer,
    //             uv:geometry.UVBuffer
    //         },
    //         uniforms: {
    //             boneMatricies: { type: "texture", value: this.associatedMaterial.ParentModel.skeleton.MatrixTexture, register: 0 },
    //             matVP: { type: "matrix", value: v },
    //             matV: { type: "matrix", value:renderer.Camera.viewMatrix },
    //             specularCoefficient: { type: "float", value: this.associatedMaterial.Specular.W },
    //             boneCount: { type: "float", value: this.associatedMaterial.ParentModel.skeleton.BoneCount }
    //         }
    //     });
    // }

    private configureSecoundaryBuffer(cene: Scene, renderer: BasicRenderer, object: SceneObject, texs: ResolvedChainInfo, pass?: number) {
        var geometry = <PMXGeometry>object.Geometry;
        var programWrapper = this.secoundaryProgram.getForContext(renderer.ContextManager);
        var v = Matrix.multiply(renderer.Camera.projectionMatrix, renderer.Camera.viewMatrix);
        programWrapper.register({
            attributes: {
                position: geometry.PositionBuffer,
                normal: geometry.NormalBuffer,
                boneWeights: geometry.boneWeightBuffer,
                boneIndicies: geometry.boneIndexBuffer,
                uv:geometry.UVBuffer
            },
            uniforms: {
                boneMatricies: { type: "texture", value: this.associatedMaterial.ParentModel.skeleton.MatrixTexture, register: 0 },
                matVP: { type: "matrix", value: v },
                matV: { type: "matrix", value:renderer.Camera.viewMatrix },
                specularCoefficient: { type: "float", value: this.associatedMaterial.Specular.W },
                boneCount: { type: "float", value: this.associatedMaterial.ParentModel.skeleton.BoneCount },
                diffuse: {
                    type: "vector",
                    value: PMXMaterialParamContainer.calcMorphedVectorValue(this.associatedMaterial.Diffuse.toVector(), this.associatedMaterial.addMorphParam, this.associatedMaterial.mulMorphParam, (t) => t.diffuse, 4)
                },
                texture: {
                    type: "texture",
                    value: this.associatedMaterial.Texture,
                    register: 1
                },
                sphere: {
                    type: "texture",
                    value: this.associatedMaterial.Sphere,
                    register: 2
                },
                textureUsed: {
                    type: "integer",
                    value: this.associatedMaterial.Texture == null || this.associatedMaterial.Texture.ImageSource == null ? 0 : 1
                },
                sphereMode: {
                    type: "integer",
                    value: this.associatedMaterial.Sphere == null || this.associatedMaterial.Sphere.ImageSource == null ? 0 : this.associatedMaterial.SphereMode
                },
                addTextureCoefficient: { type: "vector", value: new Vector4(this.associatedMaterial.addMorphParam.textureCoeff) },
                mulTextureCoefficient: { type: "vector", value: new Vector4(this.associatedMaterial.mulMorphParam.textureCoeff) },
                addSphereCoefficient: { type: "vector", value: new Vector4(this.associatedMaterial.addMorphParam.sphereCoeff) },
                mulSphereCoefficient: { type: "vector", value: new Vector4(this.associatedMaterial.mulMorphParam.sphereCoeff) }
            }
        });
    }


    private configureThirdBuffer(cene: Scene, renderer: BasicRenderer, object: SceneObject, texs: ResolvedChainInfo, pass?: number) {
        var geometry = <PMXGeometry>object.Geometry;
        var programWrapper = this.thirdProgram.getForContext(renderer.ContextManager);
        var v = Matrix.multiply(renderer.Camera.projectionMatrix, renderer.Camera.viewMatrix);
        programWrapper.register({
            attributes: {
                position: geometry.PositionBuffer,
                normal: geometry.NormalBuffer,
                boneWeights: geometry.boneWeightBuffer,
                boneIndicies: geometry.boneIndexBuffer,
                uv: geometry.UVBuffer
            },
            uniforms: {
                boneMatricies: { type: "texture", value: this.associatedMaterial.ParentModel.skeleton.MatrixTexture, register: 0 },
                matVP: { type: "matrix", value: v },
                matV: { type: "matrix", value: renderer.Camera.viewMatrix},
                boneCount: { type: "float", value: this.associatedMaterial.ParentModel.skeleton.BoneCount },
                specular: {
                    type: "vector",
                    value:PMXMaterialParamContainer.calcMorphedVectorValue(this.associatedMaterial.Specular, this.associatedMaterial.addMorphParam, this.associatedMaterial.mulMorphParam, (t) => t.specular, 3)
                }
            }
        });
    }

    public get Priorty(): number
    {
        return 100;
    }

    public getDrawGeometryLength(geo: Geometry): number
    {
        return this.associatedMaterial.Diffuse.A > 0 ? this.VerticiesCount : 0;
    }

    public getDrawGeometryOffset(geo: Geometry): number
    {
        return this.VerticiesOffset * 4;
    }

    public get MaterialGroup(): string
    {
        return "jthree.materials.gbuffer";
    }

    public getMaterialConfig(pass:number,technique:number):IMaterialConfig
    {
      if(technique == 0)
      {
        return {
          blend:false,
          cull:"ccw"
        }
      }
      if(technique == 1)
      {
        return {
          cull:"ccw",
          blend:true
        }
      }else
      {
        return {
          cull:"ccw",
          blend:false
        }
      }
    }
}

export =PMXGBufferMaterial;
