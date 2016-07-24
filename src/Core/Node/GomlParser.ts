import Attribute from "./Attribute";
import GomlNode from "./GomlNode";
import NamespacedIdentity from "../Base/NamespacedIdentity";
import GrimoireInterface from "../GrimoireInterface";

/**
 * Parser of Goml to Node utilities.
 * This class do not store any nodes and goml properties.
 */
class GomlParser {
  /**
   * Parse Goml to Node
   * @param {HTMLElement} soruce [description]
   */
  public static parse(source: Element, inheritedRequiredConponents?: NamespacedIdentity[]): GomlNode {
    const newNode = GomlParser._createNode(source, inheritedRequiredConponents);
    if (!newNode) {
      // when specified node could not be found
      console.warn(`"${source.tagName}" was not parsed.`);
      return null;
    }

    const children = source.childNodes;
    if (children && children.length !== 0) {
      for (let i = 0; i < children.length; i++) {
        if (children[i].nodeType !== 1) {
          continue;
        }
        const e = <Element>children[i];

        // check <node.components>
        const componentsTagName = newNode.nodeName.name.toUpperCase() + ".COMPONENTS";
        if (e.tagName.toUpperCase() === componentsTagName) {
          GomlParser._parseComponents(newNode, e);
          continue;
        }

        // parse child node.
        // let rcForChild = newNode.Recipe.RequiredComponentsForChildren;
        let rcForChild = null;
        if (!!inheritedRequiredConponents && inheritedRequiredConponents !== null) {
          rcForChild = rcForChild.concat(inheritedRequiredConponents);

          // remove　overLap
          rcForChild = rcForChild.filter((x, i, self) => self.indexOf(x) === i);
        }
        const newChildNode = GomlParser.parse(e, rcForChild);
        if (newChildNode) {
          newNode.addChild(newChildNode, null, false);
        }
      }
    }
    return newNode;
  }

  /**
   * GomlNodeの生成、初期化を行います。
   * @param  {HTMLElement}      elem         [description]
   * @param  {GomlConfigurator} configurator [description]
   * @return {GomlTreeNodeBase}              [description]
   */
  private static _createNode(elem: Element, inheritedRequiredConponents?: NamespacedIdentity[]): GomlNode {
    // console.log("createNode" + elem);
    const tagName = elem.localName;
    const recipe = GrimoireInterface.nodeDeclarations.get(elem);
    if (!recipe) {
      throw new Error(`Tag "${tagName}" is not found.`);
    }
    const defaultValues = recipe.defaultAttributes;
    const newNode = recipe.createNode(elem, inheritedRequiredConponents);

    // AtributeをDOMから設定、できなければノードのデフォルト値で設定、それもできなければATTRのデフォルト値
    newNode.forEachAttr((attr, key) => {
      this._parseAttribute(attr, elem, defaultValues.get(attr.name));
    });

    elem.setAttribute("x-j3-id", newNode.id); // TODO:rename!!
    return newNode;
  }


  private static _parseComponents(node: GomlNode, componentsTag: Element): void {
    let components = componentsTag.childNodes;
    if (!components) {
      return;
    }
    for (let i = 0; i < components.length; i++) {
      if (components[i].nodeType !== 1) {
        continue;
      }
      const tag = <Element>components[i];
      const component = GrimoireInterface.componentDeclarations.get(tag);
      if (!component) {
        throw new Error(`Component ${tag.tagName} is not found.`);
      }

      // コンポーネントの属性がタグの属性としてあればそれを、なければデフォルトを、それもなければ必須属性はエラー
      component.attributeDeclarations.forEach((attr) => {
        this._parseAttribute(attr.generateAttributeInstance(), tag);
      });

      node.components.set(component.name, component.generateInstance());
    }
  }

  private static _parseAttribute(attr: Attribute, tag: Element, defaultValue?: any): void {
    let attrName = attr.name;

    const domAttrDict: { [key: string]: string } = {};
    const domAttr = tag.attributes;
    for (let i = 0; i < domAttr.length; i++) {
      const name = domAttr[i].name.toUpperCase();
      domAttrDict[name] = domAttr[i].value;
    }

    let tagAttrValue = domAttrDict[attrName.name];
    if (!!tagAttrValue) {
      attr.Value = tagAttrValue;
    } else if (defaultValue !== undefined) {
      attr.Value = defaultValue;
    }
  }
}

export default GomlParser;
