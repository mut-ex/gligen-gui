
Whiteboard.Rectangle = class extends Whiteboard.Shape {
  constructor(x1, y1, x2, y2, color) {
    super();
    this.id = null;
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.color = color;
    this.visible = true;
    this._caption = null;
    this.isDirty = true;
    // this.canvasWidth = 768;
    // this.canvasHeight = 768;
  }

  toJSON() {
    return {
      id: this.id,
      x1: this.x1,
      y1: this.y1,
      x2: this.x2,
      y2: this.y2,
      color: this.color,
      visible: this.visible,
      caption: this.caption,
    };
  }

  set caption(caption) {
    // console.log("set caption: ", caption);
    let old_caption = this.caption;
    this._caption = caption;
    if (old_caption !== caption) {
      this.isDirty = true;
      this.dispatchEvent("shapeChanged", { shape: this,detail:"caption" });
    } // this.dispatchEvent("shapeRequestRedraw", { shape: this });
  }

  get caption() {
    return this._caption;
  }

  get height() {
    return abs(this.y2 - this.y1);
  }

  get width() {
    return abs(this.x2 - this.x1);
  }

  get x() {
    return this.x1;
  }

  get y() {
    return this.y1;
  }

  update(x1, y1, x2, y2) {
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;

    this.snap();
    this.validate();

    if (x1 !== this.x1 || y1 !== this.y1 || x2 !== this.x2 || y2 !== this.y2) {
      this.isDirty = true;
      this.dispatchEvent("shapeChanged", { shape: this, detail: "update" });
    }
  }

  resize(delta, position, bearing) {
    let x1, y1, x2, y2;
    x1 = this.x1;
    y1 = this.y1;
    x2 = this.x2;
    y2 = this.y2;

    switch (bearing) {
      case Whiteboard.Edge.North:
        y1 += delta.y;
        break;
      case Whiteboard.Edge.South:
        y2 += delta.y;
        break;
      case Whiteboard.Edge.East:
        x2 += delta.x;
        break;
      case Whiteboard.Edge.West:
        x1 += delta.x;
        break;

      case Whiteboard.Corner.NorthEast:
        x2 += delta.x;
        y1 += delta.y;
        break;
      case Whiteboard.Corner.SouthWest:
        x1 += delta.x;
        y2 += delta.y;
        break;
      case Whiteboard.Corner.NorthWest:
        x1 += delta.x;
        y1 += delta.y;

        break;
      case Whiteboard.Corner.SouthEast:
        x2 += delta.x;
        y2 += delta.y;
        break;

      default:
        break;
    }

    if (x1 !== this.x1 || y1 !== this.y1 || x2 !== this.x2 || y2 !== this.y2) {
      this.isDirty = true;
      this.dispatchEvent("shapeChanged", { shape: this, detail:"resize" });
    }

    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;

    // this.dispatchEvent("shapeResized", { shape: this });
  }

  move(delta) {
    let x1, y1, x2, y2;
    x1 = this.x1 + delta.deltaX;
    y1 = this.y1 + delta.deltaY;
    x2 = this.x2 + delta.deltaX;
    y2 = this.y2 + delta.deltaY;
    // console.log(this, this.canvasWidth, this.canvasHeight);
    if (
      x1 >= 0 &&
      x2 <= this.canvasWidth &&
      y1 >= 0 &&
      y2 <= this.canvasHeight
    ) {
      this.x1 = x1;
      this.x2 = x2;
      this.y1 = y1;
      this.y2 = y2;
      this.isDirty = true;
      this.dispatchEvent("shapeChanged", { shape: this, detail:"move" });

      // this.dispatchEvent("shapeMoved", { shape: this });
    }
  }

  snap() {
    let x1, y1, x2, y2;
    x1 = this.x1;
    y1 = this.y1;
    x2 = this.x2;
    y2 = this.y2;
    this.x1 = roundTo8(this.x1);
    this.y1 = roundTo8(this.y1);
    this.x2 = roundTo8(this.x2);
    this.y2 = roundTo8(this.y2);
    // this.validate();
    if (x1 !== this.x1 || y1 !== this.y1 || x2 !== this.x2 || y2 !== this.y2) {
      this.isDirty = true;
      this.dispatchEvent("shapeChanged", { shape: this , detail:"snap"});
    }
  }

  setCanvasSize(width, height) {
    this.canvasWidth = width;
    this.canvasHeight = height;
  }

  scale(scaleXY) {
    let x1, y1, x2, y2;
    x1 = this.x1;
    y1 = this.y1;
    x2 = this.x2;
    y2 = this.y2;

    this.x1 = x1 * scaleXY.scaleX;
    this.y1 = y1 * scaleXY.scaleY;
    this.x2 = x2 * scaleXY.scaleX;
    this.y2 = y2 * scaleXY.scaleY;

    this.canvasWidth = this.canvasWidth * scaleXY.scaleX;
    this.canvasHeight = this.canvasHeight * scaleXY.scaleY;

    if (x1 !== this.x1 || y1 !== this.y1 || x2 !== this.x2 || y2 !== this.y2) {
      this.isDirty = true;
      this.dispatchEvent("shapeChanged", { shape: this, detail:"scale" });
    }

    this.snap();
  }


  validate() {
    // Swap the co-ordinates to ensure width and height
    // are not negative
    let x, y;
    if (this.x2 - this.x1 <= 0) {
      x = this.x2;
      this.x2 = this.x1;
      this.x1 = x;
      this.isDirty = true;
      this.dispatchEvent("shapeChanged", { shape: this });
    }
    if (this.y2 - this.y1 <= 0) {
      y = this.y2;
      this.y2 = this.y1;
      this.y1 = y;
      this.isDirty = true;
      this.dispatchEvent("shapeChanged", { shape: this });
    }
    // this.dispatchEvent("shapeResized", { shape: this });
  }

  draw(context, force = false) {
    if (!this.visible) return false;
    if (!force) {
      if (!this.isDirty) {
        return false;
      }
    }

    this.isDirty = false;

    context.strokeStyle = this.color;
    context.strokeRect(this.x1, this.y1, this.x2 - this.x1, this.y2 - this.y1);
    Whiteboard.drawLabel(
      context,
      this.caption || `${this.width}×${this.height}`,
      this.x1,
      this.y1,
      this.x2,
      this.y2,
      this.color
    );
    return true;
  }

  contains(x, y) {
    if (x >= this.x1 && x <= this.x2 && y >= this.y1 && y <= this.y2) {
      return true;
    }
    return false;
  }

  intersects(x, y) {
    if (!this.visible) {
      intersects: false;
    }

    let edge;
    // Check if the point is on the left or right boundary
    if (
      (y >= this.y1 && y <= this.y2) ||
      almostEqual(y, this.y1) ||
      almostEqual(y, this.y2)
    ) {
      if (almostEqual(x, this.x1)) {
        edge = Whiteboard.Edge.West;
      } else if (almostEqual(x, this.x2)) {
        edge = Whiteboard.Edge.East;
      }
    }
    // Check if the point is on the top or bottom boundary

    if (
      (x >= this.x1 && x <= this.x2) ||
      almostEqual(x, this.x1) ||
      almostEqual(x, this.x2)
    ) {
      if (almostEqual(y, this.y1)) {
        edge = Whiteboard.Edge.North;
      } else if (almostEqual(y, this.y2)) {
        edge = Whiteboard.Edge.South;
      }
    }
    if (!edge) return { intersects: false };

    return { intersects: true, edge: edge };
  }

  isCloseToCorner(x, y, closeDistance = 8) {
    if (!this.visible) return { isCloseToCorner: false };

    // Define the corners
    let corners = [
      { x: this.x2, y: this.y1, corner: Whiteboard.Corner.NorthEast }, // top-right corner
      { x: this.x2, y: this.y2, corner: Whiteboard.Corner.SouthEast }, // bottom-right corner
      { x: this.x1, y: this.y2, corner: Whiteboard.Corner.SouthWest }, // bottom-left corner
      { x: this.x1, y: this.y1, corner: Whiteboard.Corner.NorthWest }, // top-left corner
    ];

    // Initialize the closest corner and the minimum distance
    let closest = corners[0];
    let minDistance = Math.hypot(x - closest.x, y - closest.y);

    // Check each corner
    for (let i = 1; i < corners.length; i++) {
      let corner = corners[i];
      let distance = Math.hypot(x - corner.x, y - corner.y);
      if (distance < minDistance) {
        closest = corner;
        minDistance = distance;
      }
    }
    if (minDistance <= closeDistance) {
      return { isCloseToCorner: true, corner: closest.corner };
    }
    return { isCloseToCorner: false };
    // Return the closest corner
  }
};
