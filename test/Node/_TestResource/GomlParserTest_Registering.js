const GrimoireInterface = require("../../../lib-es5/Interface/GrimoireInterface").default;
const sinon = require("sinon");

// Components

export function testComponent1() {
  const spy = sinon.spy();
  GrimoireInterface.registerComponent("TestComponent1", {
    attributes: {
      testAttr1: {
        converter: "Str",
        default: null
      },
      hoge: {
        converter: "Str",
        default: "DEFAULT"
      }
    },
    $onTest: function (arg) {
      spy("onTest", arg);
    },
    $mount: function (arg) {
      spy("mount", arg);
    },
    $unmount: function (arg) {
      spy("unmount", arg);
    },
    $awake: function (arg) {
      spy("awake", arg);
    }
  });
  return spy;
}

export function testComponent2() {
  const spy = sinon.spy();
  GrimoireInterface.registerComponent("TestComponent2", {
    attributes: {
      testAttr2: {
        converter: "Str",
        default: "tc2default"
      }
    },
    $onTest: function (arg) {
      spy("onTest", arg);
    },
    $mount: function (arg) {
      spy("mount", arg);
    },
    $unmount: function (arg) {
      spy("unmount", arg);
    },
    $awake: function (arg) {
      spy("awake", arg);
    }
  });
  return spy;
}

export function testComponent3() {
  const spy = sinon.spy();
  GrimoireInterface.registerComponent("TestComponent3", {
    attributes: {
      testAttr3: {
        converter: "Str",
        default: "tc2default"
      },
      hogehoge: {
        converter: "Str",
        default: "hoge"
      },
      hoge: {
        converter: "Str",
        default: "hoge"
      }
    },
    $onTest: function (arg) {
      spy("onTest", arg);
    },
    $mount: function (arg) {
      spy("mount", arg);
    },
    $unmount: function (arg) {
      spy("unmount", arg);
    },
    $awake: function (arg) {
      spy("awake", arg);
    }
  });
  return spy;
}

export function testComponentBase() {
  const spy = sinon.spy();
  GrimoireInterface.registerComponent("TestComponentBase", {
    attributes: {
      inheritAttr: {
        converter: "Str",
        default: "base"
      }
    },
    $onTest: function (arg) {
      spy("onTest", arg);
    },
    $mount: function (arg) {
      spy("mount", arg);
    },
    $unmount: function (arg) {
      spy("unmount", arg);
    },
    $awake: function (arg) {
      spy("awake", arg);
    }
  });
  return spy;
}

export function testComponentOptional() {
  const spy = sinon.spy();
  GrimoireInterface.registerComponent("TestComponentOptional", {
    attributes: {
      value: {
        converter: "Str",
        default: "optional"
      }
    },
    $onTest: function (arg) {
      spy("onTest", arg);
    },
    $mount: function (arg) {
      spy("mount", arg);
    },
    $unmount: function (arg) {
      spy("unmount", arg);
    },
    $awake: function (arg) {
      spy("awake", arg);
    }
  });
  return spy;
}

export function conflictComponent1() {
  const spy = sinon.spy();
  const ns = GrimoireInterface.ns("http://testNamespace/test1");
  GrimoireInterface.registerComponent(ns("ConflictComponent"), {
    attributes: {
      value: {
        converter: "Str",
        default: "aaa"
      }
    },
    $onTest: function () {
      spy(this.attributes.get("value").Value);
    }
  });
  return spy;
}

export function conflictComponent2() {
  const spy = sinon.spy();
  const ns = GrimoireInterface.ns("http://testNamespace/test2");
  GrimoireInterface.registerComponent(ns("ConflictComponent"), {
    attributes: {
      value: {
        converter: "Str",
        default: "bbb"
      }
    },
    $onTest: function () {
      spy(this.attributes.get("value").Value);
    }
  });
  return spy;
}



// Nodes
export function goml() {
  GrimoireInterface.registerNode("goml");
}

export function testNode1() {
  GrimoireInterface.registerNode("test-node1", ["TestComponent1"]);
}

export function testNode2() {
  GrimoireInterface.registerNode("test-node2", ["TestComponent2"], null, "test-node-base");
}

export function testNode3() {
  GrimoireInterface.registerNode("test-node3", ["TestComponent3"], { hoge: "AAA" });
}

export function testNodeBase() {
  GrimoireInterface.registerNode("test-node-base", ["TestComponentBase"]);
}

export function conflictNode1() {
  const ns = GrimoireInterface.ns("http://testNamespace/test1");
  GrimoireInterface.registerNode(ns("conflict-node"), ["TestComponent2"], {
    attr1: "nodeA"
  }, null, null);
}

export function conflictNode2() {
  const ns = GrimoireInterface.ns("http://testNamespace/test2");
  GrimoireInterface.registerNode(ns("conflict-node"), ["TestComponent2"], {
    attr1: "nodeB"
  }, null, null);
}


// Converters
export function stringConverter() {
  const spy = sinon.spy();
  GrimoireInterface.registerConverter("Str", (arg) => {
    spy(arg);
    if (typeof arg === "string" || !arg) {
      return arg;
    }
    throw new Error("Not Implemented:" + arg);
  });
  return spy;
}
