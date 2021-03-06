import GrimoireInterface from "../Interface/GrimoireInterface";


export default class Utility {
  public static w(message: string): void {
    if (GrimoireInterface.debug) {
      console.warn(message);
    }
  }
  public static isCamelCase(str: string): boolean {
    return /^[A-Z][a-zA-Z0-9]*$/.test(str);
  }
  public static isSnakeCase(str: string): boolean {
    return /^[a-z0-9\-]+$/.test(str);
  }
  public static flat<T>(array: T[][]): T[] {
    let count = 0;
    for (let i = 0; i < array.length; i++) {
      count += array[i].length;
    }
    const ret = new Array<T>(count);
    count = 0;
    for (let i = 0; i < array.length; i++) {
      const ar = array[i];
      for (let j = 0; j < ar.length; j++) {
        ret[count] = ar[j];
        count++;
      }
    }
    return ret;
  }
  public static flatMap<T>(source: T[], map: (a: T) => T[]): T[] {
    const c = new Array<T[]>(source.length);
    for (let i = 0; i < source.length; i++) {
      c[i] = map(source[i]);
    }
    return Utility.flat(c);
  }
  public static sum(array: number[]): number {
    let total = 0;
    for (let i = 0; i < array.length; i++) {
      total += array[i];
    }
    return total;
  }
  public static remove<T>(array: T[], target: T): boolean {
    let index = -1;
    for (let i = 0; i < array.length; i++) {
      if (target === array[i]) {
        index = i;
        break;
      }
    }
    if (index < 0) {
      return false;
    }
    array.splice(index, 1);
    return true;
  }

  /**
   * 重複がなければtrue
   */
  public static checkOverlap<T>(array: T[]): boolean {
    const list = [];
    for (let i = 0; i < array.length; i++) {
      const item = array[i];
      if (list.indexOf(item) !== -1) {
        return false;
      }
      list.push(item);
    }
    return true;
  }
}
