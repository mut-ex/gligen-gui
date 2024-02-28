var Whiteboard = {};

const ERROR_MARGIN = 4;
round = Math.round;
abs = Math.abs;
const MB_LEFT = 1;
const MB_MIDDLE = 4;
const MB_RIGHT = 2;
min = Math.min;
max = Math.max;

Whiteboard.drawLabel = (ctx, text, x1, y1, x2, y2, color) => {
  const text_metrics = ctx.measureText(text); // TextMetrics object
  let text_width = text_metrics.width;
  let text_height = round(
    text_metrics.actualBoundingBoxAscent - text_metrics.actualBoundingBoxDescent
  );
  // console.log(x1, y, width, height);
  let temp;
  if (y2 - y1 < 0) {
    temp = y2;
    y2 = y1;
    y1 = temp;
  }

  if (x2 - x1 < 0) {
    temp = x2;
    x2 = x1;
    x1 = temp;
  }

  x1 = round(x1 + (x2 - x1 - text_width) / 2);
  y1 = round(y1 + (y2 - y1 - text_height) / 2);

  ctx.fillStyle = color;
  let vpad = 6;
  let hpad = 4;

  let bgX = x1 - hpad;
  let bgY = y1 - vpad;
  let bgWidth = text_width + hpad * 2;
  let bgHeight = text_height + vpad * 2;
  if (bgWidth >= x2 - x1 || bgHeight >= y2 - y1) return;
  ctx.fillRect(bgX, bgY, bgWidth, bgHeight);
  ctx.fillStyle = getForegroundColor(color);
  ctx.fillText(text, x1, y1 + text_height);
};

Whiteboard.Colors = class {
  constructor() {
    this.colors = new Set([
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
    this.iterator = this.colors.values();
  }
  getColor() {
    return this.iterator.next().value;
  }
  putColor(color) {
    this.colors.add(color);
  }
};

Whiteboard.Edge = {
  North: "north",
  South: "south",
  East: "east",
  West: "west",
  None: "none",
};

Whiteboard.Corner = {
  NorthEast: "northeast",
  SouthEast: "southeast",
  SouthWest: "southwest",
  NorthWest: "northwest",
};

Whiteboard.Tool = class {
  static Action = {
    None: "none",
    Draw: "draw",
    Move: "move",
    Resize: "resize",
    CanResize: "canresize",
  };

  constructor(canvas) {
    this.action = Whiteboard.Tool.Action.Draw;
    this._target = null;
    this.canvas = canvas;
    this.is_resizing = false;
    this.edge = null;
    this.corner = null;
    this.subscribers = {};
  }

  set target(value) {
    let old_target = this._target;
    if (value === this._target) return;
    this._target = value;
    if (this._target === null) {
      old_target.dispatchEvent("shapeDeselected", { shape: old_target });
    } else {
      this.target.dispatchEvent("shapeSelected", { shape: value });
    }
  }

  get target() {
    return this._target;
  }

  addEventListener(topic, callback) {
    if (!this.subscribers[topic]) {
      this.subscribers[topic] = [];
    }
    this.subscribers[topic].push(callback);
    return () => this.removeEventListener(topic, callback); // Return a removeEventListener function
  }

  removeEventListener(topic, callback) {
    if (!this.subscribers[topic]) return;
    this.subscribers[topic] = this.subscribers[topic].filter(
      (subscriber) => subscriber !== callback
    );
  }

  dispatchEvent(topic, data) {
    if (!this.subscribers[topic]) return;
    this.subscribers[topic].forEach((callback) => callback(data));
  }

  setNone() {
    this.action = Whiteboard.Tool.Action.None;
    this.canvas.style.cursor = "auto";
    if (this.target) {
      this.target.validate();
    }
    this.target = null;
    this.edge = null;
    this.corner = null;
  }

  setDraw(target) {
    this.action = Whiteboard.Tool.Action.Draw;
    this.canvas.style.cursor = "crosshair";
    this.target = target;
    this.edge = null;
    this.corner = null;
  }

  setMove(target) {
    this.action = Whiteboard.Tool.Action.Move;
    this.canvas.style.cursor = "move";
    this.target = target;
    this.edge = null;
    this.corner = null;
  }

  setResize(target, bearing) {
    this.action = Whiteboard.Tool.Action.Resize;
    this.canvas.style.cursor = "auto";
    this.edge = null;
    this.bearing = null;
    switch (bearing) {
      case Whiteboard.Edge.North:
        this.canvas.style.cursor = "ns-resize";
        this.edge = bearing;
        break;

      case Whiteboard.Edge.South:
        this.canvas.style.cursor = "ns-resize";
        this.edge = bearing;
        break;

      case Whiteboard.Edge.East:
        this.canvas.style.cursor = "ew-resize";
        this.edge = bearing;
        break;

      case Whiteboard.Edge.West:
        this.canvas.style.cursor = "ew-resize";
        this.edge = bearing;
        break;

      case Whiteboard.Corner.NorthEast:
        this.canvas.style.cursor = "nesw-resize";
        this.corner = bearing;
        break;

      case Whiteboard.Corner.SouthWest:
        this.canvas.style.cursor = "nesw-resize";
        this.corner = bearing;
        break;

      case Whiteboard.Corner.NorthWest:
        this.canvas.style.cursor = "nwse-resize";
        this.corner = bearing;
        break;

      case Whiteboard.Corner.SouthEast:
        this.canvas.style.cursor = "nwse-resize";
        this.corner = bearing;
        break;
    }
    this.target = target;
  }

  setCanResize(target, bearing) {
    this.setResize(target, bearing);
    this.action = Whiteboard.Tool.Action.CanResize;
  }
};
