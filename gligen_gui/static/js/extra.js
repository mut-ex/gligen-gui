class _GlobalState {
  subscribers = {};

  constructor() {
    this.stringProps = [
      "cfgValue",
      "checkpointName",
      "comfyPort",
      "negativePrompt",
      "positivePrompt",
      "samplerName",
      "schedulerName",
      "seedMode",
      "seedValue",
      "stepsValue",
      "vaeName",
      "outputImageNode",
      "promptID",
      "canvasWidth",
      "canvasHeight"
    ];

    this.arrayProps = [
      "checkpointList",
      "loraList",
      "samplerList",
      "schedulerList",
      "vaeList",
    ];

    this.mapProps = ["loraMap", "boxMap"];

    this.allowedProps = [
      "addEventListener",
      "arrayProps",
      "dispatchEvent",
      "dump",
      "loadFromLocalStorage",
      "loadFromString",
      "mapProps",
      "removeEventListener",
      "saveToFile",
      "saveToLocalStorage",
      "stringify",
      "stringProps",
      "subscribers",
    ];
    this.loraMap = new Map();
    this.boxMap = new Map();
    this.vaeName = "fromCheckpoint";
    console.log("GlobalState instantiated");
  }

  dump() {
    console.log("stringProps: ");
    for (let i in this.stringProps) {
      console.log(`  ${this.stringProps[i]} => `, this[this.stringProps[i]]);
    }
    console.log("arrayProps: ");
    for (let i in this.arrayProps) {
      console.log(`  ${this.arrayProps[i]} = `, this[this.arrayProps[i]]);
    }
    console.log("mapProps: ");
    for (let i in this.mapProps) {
      console.log(`  ${this.mapProps[i]} = `, this[this.mapProps[i]]);
    }
  }

  stringify() {
    for (let shape of AppSurface.shapes) {
      this.boxMap.set(shape.id, shape);
    }

    let gathered = { stringProps: {}, arrayProps: {}, mapProps: {} };
    for (let i in this.stringProps) {
      let value = this[this.stringProps[i]];
      if (value) gathered.stringProps[this.stringProps[i]] = value;

      // gathered.stringProps.push({ [this.stringProps[i]]: value });
    }
    for (let i in this.arrayProps) {
      let value = this[this.arrayProps[i]];
      if (value) gathered.arrayProps[this.arrayProps[i]] = value;

      // gathered.stringProps.push({ [this.stringProps[i]]: value });
    }

    for (let i in this.mapProps) {
      let value = this[this.mapProps[i]];
      if (value) {
        gathered.mapProps[this.mapProps[i]] = Array.from(value);
      }
    }
    return JSON.stringify(gathered);
  }

  saveToLocalStorage() {
    localStorage.setItem("globalState", this.stringify());
  }

  loadFromLocalStorage() {
    let data = localStorage.getItem("globalState");
    if (data) {
      this.loadFromString(data);
    }
  }

  saveToFile(filename) {
    if (!filename) {
      filename = `${Date.now()}.json`;
    }
    const a = document.createElement("a");
    a.href = URL.createObjectURL(
      new Blob([this.stringify()], { type: "application/json" })
    );
    a.setAttribute("download", filename);
    document.body.appendChild(a);
    a.click();
    return true;
  }

  loadFromString(stringified) {
    let parsed = JSON.parse(stringified);
    if (!parsed.stringProps || !parsed.arrayProps || !parsed.mapProps) {
      return false;
    }
    console.log(parsed);
    for (let o in parsed.stringProps) {
      if (!this.stringProps.includes(o)) {
        return false;
      }
      this[o] = parsed.stringProps[o];
    }
    for (let o in parsed.arrayProps) {
      if (!this.arrayProps.includes(o)) {
        return false;
      }
      this[o] = parsed.arrayProps[o];
    }

    for (let o in parsed.mapProps) {
      if (!this.mapProps.includes(o)) {
        return false;
      }
      this[o] = new Map(parsed.mapProps[o]);
    }
    return true;
  }

  addEventListener(topic, callback) {
    if (
      this.stringProps.includes(topic) ||
      this.arrayProps.includes(topic) ||
      this.mapProps.includes(topic)
    ) {
      if (!this.subscribers[topic]) {
        this.subscribers[topic] = [];
      }
      this.subscribers[topic].push(callback);
      // console.log("Added event listener for: ", topic, callback);
      return () => removeEventListener(topic, callback); // Return a removeEventListener function
    } else {
      throw new Error("Adding event listener to unregistered property!");
    }
  }

  removeEventListener(topic, callback) {
    if (!this.subscribers[topic]) return;
    this.subscribers[topic] = this.subscribers[topic].filter(
      (subscriber) => subscriber !== callback
    );
  }

  dispatchEvent(topic, data) {
    if (!this.subscribers[topic]) return;
    // console.log("Dispatching event for: ", topic, data);
    this.subscribers[topic].forEach((callback) => callback(data));
  }
}

var handler = {
  get(target, key) {
    // console.log("Get: ", key, "Value: ", target[key]);
    if (target.stringProps.includes(key)) {
      return this.getStringProperty(target, key);
    } else if (target.arrayProps.includes(key)) {
      return this.getArrayProperty(target, key);
    } else if (target.mapProps.includes(key)) {
      return this.getMapProperty(target, key);
    } else if (target.allowedProps.includes(key)) {
      return Reflect.get(...arguments);
    }
    // return this[key]
    // console.log("key is: ",key);
    throw new Error("Getting unregistered property!");
    // return target[key];
  },

  getStringProperty(target, key) {
    // console.log("It's a string property");
    return target[key];
  },

  getArrayProperty(target, key) {
    // console.log("It's an array property");
    return target[key];
  },

  getMapProperty(target, key) {
    // console.log("It's a map property");
    return target[key];
  },

  set(target, key, value) {
    // console.log("Set: ", key);
    // console.log("Set: >", key, "< Value: >", value, "<");
    if (target.stringProps.includes(key)) {
      return this.setStringProperty(target, key, value);
    } else if (target.arrayProps.includes(key)) {
      return this.setArrayProperty(target, key, value);
    } else if (target.mapProps.includes(key)) {
      return this.setMapProperty(target, key, value);
    } else {
      throw new Error("Setting unregistered property!");
      // target[key] = value;
    }
  },

  setStringProperty(target, key, value) {
    // console.log("It's a string property");
    target[key] = value;
    target.dispatchEvent(key, value);
    return true;
  },

  setArrayProperty(target, key, value) {
    // console.log("It's an array property");
    target[key] = value;
    target.dispatchEvent(key, value);
    return true;
  },

  setMapProperty(target, key, value) {
    // console.log("It's a map property");
    target[key] = value;
    target.dispatchEvent(key, value);
    return true;
  },
};

var globalState = new Proxy(new _GlobalState(), handler);

function getPort() {
  const currentUrl = new URL(window.location.href);
  const split = currentUrl.pathname.split("/");
  if (split.length === 2) {
    return "8188";
  }
  if (split[1] === "port") {
    return split[2];
  }
  console.log(currentUrl.pathname);
}

async function getFile() {
  // Open file picker and destructure the result the first handle
  const [fileHandle] = await window.showOpenFilePicker();
  const file = await fileHandle.getFile();
  console.log(file);
  return file;
}
