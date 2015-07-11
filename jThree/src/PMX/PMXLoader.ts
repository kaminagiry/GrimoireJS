import PMXHeader = require('./PMXHeader');
import PMXVerticies = require('./PMXVerticies');
import PMXMaterial = require('./PMXMaterial');
import PMXBone = require('./PMXBone');
import PMXMorph = require('./PMXMorph');
import PMXDisplayFrame = require('./PMXDisplayFrame');
import PMXRigidBody = require('./PMXRigidBody');
import PMXJoint = require('./PMXJoint');
class PMX {
	private reader: jDataView;

	private header: PMXHeader;

	private verticies: PMXVerticies;

	private surfaces: number[];

	private textures: string[];

	private materials: PMXMaterial[];

	private bones: PMXBone[];

	private morphs: PMXMorph[];

	private displayFrames: PMXDisplayFrame[];

	private rigidBodies: PMXRigidBody[];

	private joints: PMXJoint[];

	public get Verticies() {
		return this.verticies;
	}

	public get Surfaces() {
		return this.surfaces;
	}

	constructor(data: ArrayBuffer) {
		this.reader = new jDataView(data, 0, data.byteLength, true);
		this.loadHeader();
		this.loadVerticies();
		this.loadSurfaces();
		this.loadTextures();
		this.loadMaterials();
		this.loadBones();
		this.loadMorphs();
		this.loadDisplayFrames();
		this.loadRigidBodies();
		this.loadJoints();
	}

	private readTextBuf(): string {
		var length = this.reader.getInt32();
		var numbers = new Array(length);
		for (var i = 0; i < length; i++) {
			numbers[i] = this.reader.getUint8();
		}
		var result = "";
		result += String.fromCharCode.apply(null, numbers);
		return result;
	}

	private toUTF8(str: string) {
		var utf8 = [];
		for (var i = 0; i < str.length; i++) {
			var charcode = str.charCodeAt(i);
			if (charcode < 0x80) utf8.push(charcode);
			else if (charcode < 0x800) {
				utf8.push(0xc0 | (charcode >> 6),
					0x80 | (charcode & 0x3f));
			}
			else if (charcode < 0xd800 || charcode >= 0xe000) {
				utf8.push(0xe0 | (charcode >> 12),
					0x80 | ((charcode >> 6) & 0x3f),
					0x80 | (charcode & 0x3f));
			}
			// surrogate pair
			else {
				i++;
				// UTF-16 encodes 0x10000-0x10FFFF by
				// subtracting 0x10000 and splitting the
				// 20 bits of 0x0-0xFFFFF into two halves
				charcode = 0x10000 + (((charcode & 0x3ff) << 10)
					| (str.charCodeAt(i) & 0x3ff))
				utf8.push(0xf0 | (charcode >> 18),
					0x80 | ((charcode >> 12) & 0x3f),
					0x80 | ((charcode >> 6) & 0x3f),
					0x80 | (charcode & 0x3f));
			}
		}
		var text = "";
		for (var i = 0; i < utf8.length; i++) {
			text += String.fromCharCode(utf8[i]);
		}
		return text;
	}

	private loadHeader() {
		var r = this.reader;
		this.reader.getUint32();//pass magic
		this.header =
		{
			version: r.getFloat32(),
			headerByteSize: r.getUint8(),
			encoding: r.getUint8(),
			uvAddition: r.getUint8(),
			vertexIndexSize: r.getUint8(),
			textureIndexSize: r.getUint8(),
			materialIndexSize: r.getUint8(),
			boneIndexSize: r.getUint8(),
			morphIndexSize: r.getUint8(),
			rigidBodyIndexSize: r.getUint8(),
			modelName: "",
			modelNameEn: "",
			comment: "",
			commentEn: ""
		};
		this.header.modelName = this.readTextBuf();
		this.header.modelNameEn = this.readTextBuf();
		this.header.comment = this.readTextBuf();
		this.header.commentEn = this.readTextBuf();
	}

	private readBoneIndex() {
		return this.readIndexExceptVertex(this.header.boneIndexSize);
	}

	private readTextureIndex() {
		return this.readIndexExceptVertex(this.header.textureIndexSize);
	}

	private readMorphIndex() {
		return this.readIndexExceptVertex(this.header.morphIndexSize);
	}

	private readMaterialIndex() {
		return this.readIndexExceptVertex(this.header.materialIndexSize);
	}

	private readRigidBodyIndex() {
		return this.readIndexExceptVertex(this.header.rigidBodyIndexSize);
	}
	private readVertexIndex() {
		switch (this.header.vertexIndexSize) {
			case 1:
				return this.reader.getUint8();
				break;
			case 2:
				return this.reader.getUint16();
				break;
			case 4:
				return this.reader.getInt32();
				break;
		}
	}

	private readIndexExceptVertex(byte: number) {
		switch (byte) {
			case 1:
				return this.reader.getInt8();
				break;
			case 2:
				return this.reader.getInt16();
				break;
			case 4:
				return this.reader.getInt32();
				break;
		}
	}

	private loadVerticies() {
		var r = this.reader;
		var count = r.getInt32();
		var uvCount = this.header.uvAddition;
		//allocate arrays
		var additionalUvs = new Array(uvCount);
		for (var i = 0; i < uvCount; i++) {
			additionalUvs[i] = new Array(count * 4);
		}
		var result: PMXVerticies = {
			positions: new Array(count * 3),
			normals: new Array(count * 3),
			uvs: new Array(count * 2),
			additionalUV: additionalUvs,
			edgeScaling: new Array(count),
			verticies: new Array(count)
		};
		for (var i = 0; i < count; i++) {
			result.positions[3 * i + 0] = r.getFloat32();
			result.positions[3 * i + 1] = r.getFloat32();
			result.positions[3 * i + 2] = r.getFloat32();
			result.normals[3 * i + 0] = r.getFloat32();
			result.normals[3 * i + 1] = r.getFloat32();
			result.normals[3 * i + 2] = r.getFloat32();
			result.uvs[2 * i + 0] = r.getFloat32();
			result.uvs[2 * i + 1] = r.getFloat32();
			for (var j = 0; j < uvCount; j++) {
				result.additionalUV[j][4 * i + 0] = r.getFloat32();
				result.additionalUV[j][4 * i + 1] = r.getFloat32();
				result.additionalUV[j][4 * i + 2] = r.getFloat32();
				result.additionalUV[j][4 * i + 3] = r.getFloat32();
			}
			result.verticies[i] = { weightTransform: r.getUint8() }
			switch (result.verticies[i].weightTransform) {
				case 0://BDEF
					result.verticies[i].bdef1 = { boneIndex: this.readBoneIndex() }
					break;
				case 1://BDEF2
					result.verticies[i].bdef2 =
					{
						boneIndex1: this.readBoneIndex(),
						boneIndex2: this.readBoneIndex(),
						boneWeight: r.getFloat32()
					}
					break;
				case 2://BDEF4
					result.verticies[i].bdef4 = {
						boneIndex1: this.readBoneIndex(),
						boneIndex2: this.readBoneIndex(),
						boneIndex3: this.readBoneIndex(),
						boneIndex4: this.readBoneIndex(),
						boneWeight1: r.getFloat32(),
						boneWeight2: r.getFloat32(),
						boneWeight3: r.getFloat32(),
						boneWeight4: r.getFloat32(),
					}
					break;
				case 3://SDEF
					result.verticies[i].sdef =
					{
						boneIndex1: this.readBoneIndex(),
						boneIndex2: this.readBoneIndex(),
						boneWeight: r.getFloat32(),
						boneParams: [
							r.getFloat32(),
							r.getFloat32(),
							r.getFloat32(),
							r.getFloat32(),
							r.getFloat32(),
							r.getFloat32(),
							r.getFloat32(),
							r.getFloat32(),
							r.getFloat32(),
						]
					}
					break;
			}
			result.edgeScaling[i] = r.getFloat32()
		}
		this.verticies = result;
	}

	private loadSurfaces() {
		var r = this.reader;
		var count = r.getInt32();
		this.surfaces = new Array(count);
		for (var i = 0; i < count; i++) {
			this.surfaces[i] = this.readVertexIndex();
			}
	}
	//		var r = this.reader;
		// var count = r.getInt32();
		// var indexCount = Math.floor(count / 65535) + 1;
		// this.surfaces = new Array(indexCount);
		// for (var targetIndex = 0; targetIndex < indexCount; targetIndex++) {
		// 	var indexMax=Math.min(65535,count-targetIndex*65535);
		// 	this.surfaces[targetIndex] = new Array(indexMax);
		// 	for (var i = 0; i < indexMax; i++) {
		// 		this.surfaces[targetIndex][i] = this.readVertexIndex();
		// 	}
		// }

	private loadTextures() {
		var r = this.reader;
		var count = r.getInt32();
		this.textures = new Array(count);
		for (var i = 0; i < count; i++) {
			this.textures[i] = this.readTextBuf();
		}
	}

	private loadMaterials() {
		var r = this.reader;
		var count = r.getInt32();
		this.materials = new Array(count);
		var cache = 0;
		for (var i = 0; i < count; i++) {
			this.materials[i] = {
				materialName: this.readTextBuf(),
				materialNameEn: this.readTextBuf(),
				diffuse: [r.getFloat32(), r.getFloat32(), r.getFloat32(), r.getFloat32()],
				specular: [r.getFloat32(), r.getFloat32(), r.getFloat32(), r.getFloat32()],
				ambient: [r.getFloat32(), r.getFloat32(), r.getFloat32()],
				drawFlag: r.getUint8(),
				edgeColor: [r.getFloat32(), r.getFloat32(), r.getFloat32(), r.getFloat32()],
				edgeSize: r.getFloat32(),
				textureIndex: this.readTextureIndex(),
				sphereTextureIndex: this.readTextureIndex(),
				sphereMode: r.getUint8(),
				sharedToonFlag: cache = r.getUint8(),
				targetToonIndex: cache == 0 ? this.readTextureIndex() : r.getUint8(),
				memo: this.readTextBuf(),
				vertexCount: r.getInt32(),
			};
		}
	}

	private loadBones() {
		var r = this.reader;
		var count = r.getUint32();
		this.bones = new Array(count);
		var boneFlagCache = 0;
		var ikLinkCountCache = 0;
		var ikLimitedCache = 0;
		for (var i = 0; i < count; i++) {
			this.bones[i] = {
				boneName: this.readTextBuf(),
				boneNameEn: this.readTextBuf(),
				position: [r.getFloat32(), r.getFloat32(), r.getFloat32()],
				parentBoneIndex: this.readBoneIndex(),
				transformLayer: r.getInt32(),
				boneFlag: boneFlagCache = r.getUint16(),
				positionOffset: (boneFlagCache & 0x0001) == 0 ? [r.getFloat32(), r.getFloat32(), r.getFloat32()] : undefined,
				connectingBoneIndex: (boneFlagCache & 0x0001) > 0 ? this.readBoneIndex() : undefined,
				providingBoneIndex: (boneFlagCache & 0x0100) > 0 || (boneFlagCache & 0x0200) > 0 ? this.readBoneIndex() : undefined,
				providingRate: (boneFlagCache & 0x0100) > 0 || (boneFlagCache & 0x0200) > 0 ? r.getFloat32() : undefined,
				fixedAxis: (boneFlagCache & 0x0400) > 0 ? [r.getFloat32(), r.getFloat32(), r.getFloat32()] : undefined,
				localAxisX: (boneFlagCache & 0x0800) > 0 ? [r.getFloat32(), r.getFloat32(), r.getFloat32()] : undefined,
				localAxisZ: (boneFlagCache & 0x0800) > 0 ? [r.getFloat32(), r.getFloat32(), r.getFloat32()] : undefined,
				externalParentTransformKey: (boneFlagCache & 0x2000) > 0 ? r.getInt32() : undefined,
				ikTargetBoneIndex: (boneFlagCache & 0x0020) > 0 ? this.readBoneIndex() : undefined,
				ikLoopCount: (boneFlagCache & 0x0020) > 0 ? r.getInt32() : undefined,
				ikLimitedRotation: (boneFlagCache & 0x0020) > 0 ? r.getFloat32() : undefined,
				ikLinkCount: (boneFlagCache & 0x0020) > 0 ? ikLinkCountCache = r.getInt32() : ikLinkCountCache = undefined,
				ikLinks: (boneFlagCache & 0x0020) > 0 ? new Array(ikLinkCountCache) : undefined
			};
			if (ikLinkCountCache)
				for (var j = 0; j < ikLinkCountCache; j++) {
					this.bones[i].ikLinks[j] = {
						ikLinkBoneIndex: this.readBoneIndex(),
						isLimitedRotation: ikLimitedCache = r.getUint8(),
						limitedRotation: ikLimitedCache > 0 ? [r.getFloat32(), r.getFloat32(), r.getFloat32(), r.getFloat32(), r.getFloat32(), r.getFloat32()] : undefined
					}
				}
		}
	}
	private loadMorphs() {
		var r = this.reader;
		var count = r.getInt32();
		this.morphs = new Array(count);
		var morphCountCache = 0;
		for (var i = 0; i < count; i++) {
			this.morphs[i] = {
				morphName: this.readTextBuf(),
				morphNameEn: this.readTextBuf(),
				editPanel: r.getUint8(),
				morphKind: r.getUint8(),
				morphOffsetCount: morphCountCache = r.getInt32()
			};
			switch (this.morphs[i].morphKind) {
				case 0:
					//group morph
					this.morphs[i].groupMorph = new Array(morphCountCache);
					for (var j = 0; j < morphCountCache; j++) {
						this.morphs[i].groupMorph[j] = {
							morphIndex: this.readMorphIndex(),
							morphRate: r.getFloat32()
						};
					}
					break;
				case 1:
					this.morphs[i].vertexMorph = new Array(morphCountCache);
					for (var j = 0; j < morphCountCache; j++) {
						this.morphs[i].vertexMorph[j] =
						{
							vertexIndex: this.readVertexIndex(),
							vertexOffset: [r.getFloat32(), r.getFloat32(), r.getFloat32()]
						}
					}
					break;
				case 2:
					this.morphs[i].boneMorph = new Array(morphCountCache);
					for (var j = 0; j < morphCountCache; j++) {
						this.morphs[i].boneMorph[j]
						= {
							boneIndex: this.readBoneIndex(),
							translationOffset: [r.getFloat32(), r.getFloat32(), r.getFloat32()],
							rotationOffset: [r.getFloat32(), r.getFloat32(), r.getFloat32(), r.getFloat32()]
						};
					}
					break;
				case 3:
				case 4:
				case 5:
				case 6:
				case 7:
					this.morphs[i].uvMorph = new Array(morphCountCache);
					for (var j = 0; j < morphCountCache; j++) {
						this.morphs[i].uvMorph[j]
						= {
							vertexIndex: this.readVertexIndex(),
							uvOffset: [r.getFloat32(), r.getFloat32(), r.getFloat32(), r.getFloat32()]
						};
					}
					break;
				case 8:
					this.morphs[i].materialMorph = new Array(morphCountCache);
					for (var j = 0; j < morphCountCache; j++) {
						this.morphs[i].materialMorph[j]
						= {
							materialIndex: this.readMaterialIndex(),
							operationType: r.getUint8(),
							diffuse: [r.getFloat32(), r.getFloat32(), r.getFloat32(), r.getFloat32()],
							specular: [r.getFloat32(), r.getFloat32(), r.getFloat32(), r.getFloat32()],
							ambient: [r.getFloat32(), r.getFloat32(), r.getFloat32()],
							edgeColor: [r.getFloat32(), r.getFloat32(), r.getFloat32(), r.getFloat32()],
							edgeSize: r.getFloat32(),
							textureCoefficient: [r.getFloat32(), r.getFloat32(), r.getFloat32(), r.getFloat32()],
							sphereTextureCoefficient: [r.getFloat32(), r.getFloat32(), r.getFloat32(), r.getFloat32()],
							toonTextureCoefficient: [r.getFloat32(), r.getFloat32(), r.getFloat32(), r.getFloat32()]
						};
					}
					break;
			}
		}
	}

	private loadDisplayFrames() {
		var r = this.reader;
		var count = r.getInt32();
		this.displayFrames = new Array(count);
		var countCache = 0;
		var targetCache = 0;
		for (var i = 0; i < count; i++) {
			this.displayFrames[i] =
			{
				frameName: this.readTextBuf(),
				frameNameEn: this.readTextBuf(),
				specialFrameFlag: r.getUint8(),
				elementCount: countCache = r.getInt32(),
				targetElementTypes: new Array(countCache),
				targetIndex: new Array(countCache)
			};
			for (var j = 0; j < countCache; j++) {
				this.displayFrames[i].targetElementTypes[j] = targetCache = r.getUint8();
				this.displayFrames[i].targetIndex[j] = targetCache > 0 ? this.readMorphIndex() : this.readBoneIndex();
			}
		}
	}

	private loadRigidBodies() {
		var r = this.reader;
		var count = r.getInt32();
		this.rigidBodies = new Array(count);
		for (var i = 0; i < count; i++) {
			this.rigidBodies[i] = {
				rigidBodyName: this.readTextBuf(),
				rigidBodyNameEn: this.readTextBuf(),
				boneIndex: this.readBoneIndex(),
				group: r.getUint8(),
				unCollisionGroupFlag: r.getUint16(),
				shape: r.getUint8(),
				size: [r.getFloat32(), r.getFloat32(), r.getFloat32()],
				position: [r.getFloat32(), r.getFloat32(), r.getFloat32()],
				rotation: [r.getFloat32(), r.getFloat32(), r.getFloat32()],
				mass: r.getFloat32(),
				translationFraction: r.getFloat32(),
				rotationFraction: r.getFloat32(),
				boundness: r.getFloat32(),
				fraction: r.getFloat32(),
				calcType: r.getUint8(),
			};
		}
	}

	private loadJoints() {
		var r = this.reader;
		var count = r.getInt32();
		this.joints = new Array(count);
		var typeCache = 0;
		for (var i = 0; i < count; i++) {
			this.joints[i] = {
				jointName: this.readTextBuf(),
				jointNameEn: this.readTextBuf(),
				jointType: typeCache = r.getUint8(),
				spring: typeCache == 0 ?
					{
						targetRigidBody1: this.readRigidBodyIndex(),
						targetRigidBody2: this.readRigidBodyIndex(),
						position: [r.getFloat32(), r.getFloat32(), r.getFloat32()],
						rotation: [r.getFloat32(), r.getFloat32(), r.getFloat32()],
						translationLimit: [r.getFloat32(), r.getFloat32(), r.getFloat32(), r.getFloat32(), r.getFloat32(), r.getFloat32()],
						rotationLimit: [r.getFloat32(), r.getFloat32(), r.getFloat32(), r.getFloat32(), r.getFloat32(), r.getFloat32()],
						springCoefficientLimit: [r.getFloat32(), r.getFloat32(), r.getFloat32(), r.getFloat32(), r.getFloat32(), r.getFloat32()]
					} : undefined
			};
		}
	}
}

export = PMX;