import IAttributeDeclaration from "./IAttributeDeclaration";
import IGomlInterface from "../Interface/IGomlInterface";
import Attribute from "./Attribute";
import GomlNode from "./GomlNode";
import NSDictionary from "../Base/NSDictionary";
import NSIdentity from "../Base/NSIdentity";
import IDObject from "../Base/IDObject";
/**
 * Base class for any components
 */
class Component extends IDObject {
  /**
   * Name of this component
   * @type {NSIdentity}
   */
  public name: NSIdentity;
  /**
   * Attributes managed by this component
   * @type {NSDictionary<Attribute>}
   */
  public attributes: NSDictionary<Attribute>;
  /**
   * Node this component is attached
   * @type {GomlNode}
   */
  public node: GomlNode;
  /**
   * XMLElement of this component
   * @type {Element}
   */
  public element: Element;
  /**
   * Flag that this component is activated or not.
   * @type {boolean}
   */
  private _enable: boolean = true;
  private _handlers: ((component: Component) => void)[] = [];

  public get enable(): boolean {
    return this._enable;
  }
  public set enable(val) {
    if (this._enable === val) {
      return;
    }
    this._enable = val;
    this._handlers.forEach((handler) => {
      handler(this);
    });
  }
  /**
   * The dictionary which is shared in entire tree.
   * @return {NSDictionary<any>} [description]
   */
  public get companion(): NSDictionary<any> {
    return this.node ? this.node.companion : null;
  }
  /**
   * Tree interface for the tree this node is attached.
   * @return {IGomlInterface} [description]
   */
  public get tree(): IGomlInterface {
    return this.node ? this.node.treeInterface : null;
  }

  /**
   * Obtain value of attribute. When the attribute is not existing, this method would return undefined.
   * @param  {string} name [description]
   * @return {any}         [description]
   */
  public getValue(name: string): any {
    const attr = this.attributes.get(name);
    if (attr) {
      return attr.Value;
    } else {
      return undefined;
    }
  }
  /**
   * Set value of attribute
   * @param {string} name  [description]
   * @param {any}    value [description]
   */
  public setValue(name: string, value: any): void {
    const attr = this.attributes.get(name);
    if (attr) {
      attr.Value = value;
    }
  }
  public addEnabledObserver(handler: (component: Component) => void): void {
    this._handlers.push(handler);
  }

  public removeEnabledObserver(handler: (component: Component) => void): void {
    let index = -1;
    for (let i = 0; i < this._handlers.length; i++) {
      if (handler === this._handlers[i]) {
        index = i;
        break;
      }
    }
    if (index < 0) {
      return;
    }
    this._handlers.splice(index, 1);
  }
  /**
   * Add attribute
   * @param {string}                name      [description]
   * @param {IAttributeDeclaration} attribute [description]
   */
  protected __addAtribute(name: string, attribute: IAttributeDeclaration): void {
    if (!attribute) {
      throw new Error("can not add attribute null or undefined.");
    }
    const attr = new Attribute(name, attribute, this);
    this.attributes.set(attr.name, attr); // TODO: NodeのAttributesにも追加するか？
  }
}

export default Component;
