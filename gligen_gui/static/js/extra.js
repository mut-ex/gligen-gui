var colorSet = new Set([
  "#00ffff",
  "#00bfff",
  "#0000ff",
  "#a020f0",
  "#adff2f",
  "#b03060",
  "#ff0000",
  "#00ff00",
  "#00ff7f",
  "#dc143c",
  "#ff1493",
  "#7b68ee",
  "#ee82ee",
  "#ffdead",
  "#ffb6c1",
  "#1e90ff",
  "#fa8072",
  "#ffff54",
  "#90ee90",
  "#add8e6",
  "#008b8b",
  "#000080",
  "#daa520",
  "#8fbc8f",
  "#800080",
  "#696969",
  "#556b2f",
  "#8b4513",
  "#228b22",
  "#483d8b",
]);

var iteratorColors = colorSet.values();

const State = {
  _boxMap: getMap("boxes") || new Map(),
  set boxMap(val) {
    this._boxMap = val;
    setMap("boxes", this._boxMap);
  },
  get boxMap() {
    setMap("boxes", this._boxMap);
    return this._boxMap;
  },

  set canvas_width(val) {
    localStorage.canvas_width = val;
  },
  get canvas_width() {
    return localStorage.canvas_width || 512;
  },

  set canvas_height(val) {
    localStorage.canvas_height = val;
  },
  get canvas_height() {
    return localStorage.canvas_height || 512;
  },

  set x(val) {
    localStorage.x = JSON.stringify(val);
  },
  get x() {
    return JSON.parse(localStorage.x);
  },

  set y(val) {
    localStorage.y = JSON.stringify(val);
  },
  get y() {
    return JSON.parse(localStorage.y);
  },

  set width(val) {
    localStorage.width = JSON.stringify(val);
  },
  get width() {
    return JSON.parse(localStorage.width);
  },

  set height(val) {
    localStorage.height = JSON.stringify(val);
  },
  get height() {
    return JSON.parse(localStorage.height);
  },

  set mbDown(val) {
    // console.log("set mbDown: ", val);
    localStorage.mbDown = JSON.stringify(val);
  },
  get mbDown() {
    // console.log("get mbDown: ", JSON.parse(localStorage.mbDown));
    return JSON.parse(localStorage.mbDown);
  },

  set currColor(val) {
    localStorage.currColor = val;
  },
  get currColor() {
    return localStorage.currColor;
  },

  set checkpoint_name(val) {
    localStorage.checkpoint_name = val;
  },
  get checkpoint_name() {
    return localStorage.checkpoint_name;
  },

  set sampler_name(val) {
    localStorage.sampler_name = val;
  },
  get sampler_name() {
    return localStorage.sampler_name;
  },

  set cfg(val) {
    localStorage.cfg = val;
  },
  get cfg() {
    return localStorage.cfg;
  },

  set steps(val) {
    localStorage.steps = val;
  },
  get steps() {
    return localStorage.steps;
  },

  set positive_conditioning(val) {
    localStorage.positive_conditioning = val;
  },
  get positive_conditioning() {
    return localStorage.positive_conditioning;
  },

  set negative_conditioning(val) {
    localStorage.negative_conditioning = val;
  },
  get negative_conditioning() {
    return localStorage.negative_conditioning;
  },

  set prompt_id(val) {
    localStorage.prompt_id = val;
  },
  get prompt_id() {
    return localStorage.prompt_id;
  },

  set output_image_node(val) {
    localStorage.output_image_node = val;
  },
  get output_image_node() {
    return localStorage.output_image_node;
  },

  set complete_lora_list(val) {
    localStorage.complete_lora_list = JSON.stringify(val);
  },
  get complete_lora_list() {
    return JSON.parse(localStorage.complete_lora_list);
  },

  set selected_loras(val) {
    setMap("selected_loras", val);
  },
  get selected_loras() {
    return getMap("selected_loras") || new Map();
  },

  set seed(val) {
    localStorage.seed = val;
  },
  get seed() {
    return localStorage.seed;
  },

  set seed_mode(val) {
    localStorage.seed_mode = val;
  },
  get seed_mode() {
    return localStorage.seed_mode;
  },

  set comfy_ui_port(val) {
    localStorage.comfy_ui_port = val;
  },
  get comfy_ui_port() {
    return localStorage.comfy_ui_port;
  },
  set comfy_ui_host(val) {
    localStorage.comfy_ui_host = val;
  },
  get comfy_ui_host() {
    return localStorage.comfy_ui_host;
  },
};

// Retrieves the map with the given name from local storage
function getMap(name) {
  return new Map(JSON.parse(localStorage.getItem(name)));
}

// Writes the given map to local storage by flattening it first
function setMap(name, m) {
  localStorage.setItem(name, JSON.stringify(Array.from(m)));
}

function getHostPort() {
  const currentUrl = new URL(window.location.href);
  console.log(currentUrl.pathname);
  const split = currentUrl.pathname.split("/");
  if (split.length === 2) {
    return Array("127.0.0.1","8188");
  }
  port = "8188";
  host = "127.0.0.1"
  if (split[1] === "port") {
    port = split[2];
  }
  if (split.length === 5 && split[3] === "host") {
    host = split[4];
    
  }
  
  console.log("Split len = ",split.length);
  return  Array(host,port)
  
}