Whiteboard.Mouse = class {
  constructor(canvas) {
    this.canvas = canvas;
    this.isButtonDown = false;
    this.isButtonDownPrev = false;
    this.lastButtonDown = null;
    this.lastButtonDownX = null;
    this.lastButtonDownY = null;
    this.x = null;
    this.y = null;
    this.position = { x: this.x, y: this.y };
    this.movementX = null;
    this.movementY = null;

    let canvasElement = document.getElementsByTagName("canvas")[0];
    let canvasContainer = canvasElement.parentNode;
    canvasContainer.style.width = `768px`;
    canvasContainer.style.height = `768px`;
  }

  update(event) {
    this.event = event;
    this.getPosition(event);

    if (event.buttons == 0) {
      this.isButtonDown = false;
    } else {
      if (!this.isButtonDown) {
        this.isButtonDown = true;
        this.lastButtonDown = event.buttons;
        this.lastButtonDownX = this.position.x;
        this.lastButtonDownY = this.position.y;
      }
    }
  }

  getPosition(event) {
    // this.update(event)
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    let x = (event.clientX - rect.left) * scaleX;
    let y = (event.clientY - rect.top) * scaleY;
    //   x = Math.floor(x / 8 + 0.5) * 8;
    //   y = Math.floor(y / 8 + 0.5) * 8;
    x = round(x);
    y = round(y);

    // mouse_id.innerHTML = `${x}, ${y}`;
    this.x = x;
    this.y = y;
    this.position = { x: x, y: y };

    this.movementX = round(event.movementX * scaleX);
    this.movementY = round(event.movementY * scaleY);
    this.delta = { x: this.movementX, y: this.movementY };
  }
};

var countMainCanvas = 0;
var countOffscreenCanvas = 0;

Whiteboard.FitMode = {
  center: "center",
  stretch: "stretch",
  fit: "fit",
};

Whiteboard.Surface = class {
  constructor(canvas) {
    this.subscribers = {};
    this.currentShape = Whiteboard.Rectangle;
    this.palette = new Whiteboard.Colors();

    this.setCanvas(canvas);
    this.#attachEventListeners();
    this.#resizeFont(1);
    this.#resizeLineWidth(1);

    this._backgroundImage = null;
    this._hideBackgroundImage = false;
    this.fitMode = Whiteboard.FitMode.center;
    this.name = "WhiteboardAppSurface";
  }

  get width() {
    return this.canvas.width;
  }

  get height() {
    return this.canvas.height;
  }

  set width(value) {
    this.canvas.width = value;
    // document.getElementById("width").value = value;
  }

  set height(value) {
    this.canvas.height = value;
    // document.getElementById("height").value = value;
  }

  hideBackgroundImage() {
    this._hideBackgroundImage = true;
  }

  showBackgroundImage() {
    this._hideBackgroundImage = false;
  }

  set backgroundImage(value) {
    this._backgroundImage = value;
    this.refresh();
  }

  get backgroundImage() {
    return this._backgroundImage;
  }

  #attachEventListeners() {
    this.canvas.addEventListener("mousedown", this.handleMouseDown.bind(this));
    this.canvas.addEventListener("mouseup", this.handleMouseUp.bind(this));
    this.canvas.addEventListener("mousemove", this.handleMouseMove.bind(this));
    this.canvas.addEventListener("contextmenu", (e) => {
      e.preventDefault();
    });
    this.canvas.addEventListener("mouseout", this.handleMouseOut.bind(this));
  }

  #resizeFont(sf) {
    let newFontSize = round(16 * sf);
    this.context.font = `bold small-caps ${newFontSize}px Inter`;
    // return `bold ${fontsize || this.fontSize}px courier`;
  }

  #resizeLineWidth(sf) {
    this.context.lineWidth = 2 * sf;
  }

  setCanvas(canvas) {
    this.canvas = canvas;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.context = this.canvas.getContext("2d");
    this.mouse = new Whiteboard.Mouse(this.canvas);
    this.shapes = new Set();
    this.tool = new Whiteboard.Tool(this.canvas);
  }

  resize(width, height) {
    console.log("in resize")
    width = roundTo8(width);
    height = roundTo8(height);

    let currWidth = this.width;
    let currHeight = this.height;
    let scaleX = width / currWidth;
    let scaleY = height / currHeight;

    this.width = width;
    this.height = height;

    let containerW, containerH;
    containerW = width;
    containerH = height;

    if (width >= 768) {
      containerW = 768;
      containerH = containerW * (height / width);
    }

    let canvasElement = document.getElementsByTagName("canvas")[0];
    canvasElement.style.width = `${containerW}px`;
    canvasElement.style.height = `${containerH}px`;
    this.#resizeFont(width / 512);
    this.#resizeLineWidth(width / 512);

    this.dispatchEvent("surfaceResized", {
      scaleX: scaleX,
      scaleY: scaleY,
      width: this.width,
      height: this.height,
    });
    this.refresh();
  }

  clear() {
    if (this.shapes.size > 0) {
      this.shapes.forEach((shape) => {
        this.remove(shape);
      });
      this.shapes.clear();
      this.refresh();
    }
  }

  saveToLocalStorage() {
    let shapes = [];
    this.shapes.forEach((shape) => {
      shapes.push(shape.toJSON());
    });
    localStorage.setItem(this.name, JSON.stringify(shapes));
  }

  loadRectangle(shape) {
    let rectangle = new Whiteboard.Rectangle(
      shape.x1,
      shape.y1,
      shape.x2,
      shape.y2,
      shape.color
    );
    rectangle.id = shape.id;
    rectangle.visible = shape.visible;
    rectangle.caption = shape.caption;
    return rectangle
  }

  loadFromLocalStorage() {
    let shapes = JSON.parse(localStorage.getItem(this.name));
    if (!shapes) return;
    this.clear();
    // if (this.shapes.size > 0 ){
    //   this.shapes.forEach((shape)=> {
    //     this.remove(shape)
    //   })
    // }
    // this.shapes.clear();
    shapes.forEach((shape) => {
      this.add(this.loadRectangle(shape));
    });
    this.refresh();
  }

  loadFromMap(map) {
    if (!map) return false;
    if (map.size === 0) return false;
    this.clear()
    map.forEach(element => {
      this.add(this.loadRectangle(element));
    });
    this.refresh();
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

  add(shape) {
    if (!this.shapes.has(shape)) {
      // shape.canvasWidth = this.mainCanvas.width;
      // shape.canvasHeight = this.mainCanvas.height;
      shape.setCanvasSize(this.canvas.width, this.canvas.height);
      this.addEventListener("surfaceResized", shape.scale.bind(shape));
      shape.addEventListener("shapeChanged", this.refresh.bind(this));
      this.shapes.add(shape);
      this.dispatchEvent("shapeAdded", { shape: shape });
    }
  }

  remove(shape) {
    this.palette.putColor(shape.color);
    this.shapes.delete(shape);
    shape.dispatchEvent("shapeRemoved", { shape: shape });
    this.refresh();
  }

  // refreshBackCanvas(force = false) {
  //   let ret;
  //   if (this.tool.target !== this.prevTarget) {
  //     // this.prevTarget = this.tool.target
  //     // console.log("Target changed!: ", this.prevTarget, this.tool.target);
  //     this.clearBackCanvas();
  //     force = true;
  //   }

  //   this.shapes.forEach((shape) => {
  //     if (this.tool.target !== shape) {
  //       // console.log("Rendering off screen canvas");
  //       ret = shape.draw(this.canvas, force);
  //       if (ret) countOffscreenCanvas++;
  //     }
  //   });
  //   this.prevTarget = this.tool.target;
  // }

  setFitMode(fitMode) {
    this.fitMode = fitMode;
    this.refresh();
  }

  drawBackgroundImage() {
    let image = this._backgroundImage;
    if (!image) return;

    if (this._hideBackgroundImage) return;

    let bW = image.width;
    let bH = image.height;
    let cW = this.width;
    let cH = this.height;

    if (bW === cW && bH === cH) {
      console.log("Perfect fit!");
      this.context.drawImage(image, 0, 0);

      return;
    }

    console.log(this.fitMode);
    let fit = this.fitMode;
    // console.log("Centered!");
    let dX = (bW - cW) / 2;
    let dY = (bH - cH) / 2;
    let cX = -dX;
    let cY = -dY;
    // console.log(dX);

    //  if (fit === Whiteboard.FitMode.fitVertical) {
    //     this.context.drawImage(image, cX, 0, image.width, cH);
    //     console.log("Fit Vertical");
    //   }
    //    if (fit === Whiteboard.FitMode.fitHorizontal) {
    //     console.log("Fit Horizontal");
    //     this.context.drawImage(image, 0, cY, cW, image.height);
    //   }
    if (fit === Whiteboard.FitMode.center) {
      this.context.drawImage(image, cX, cY);
    } else if (fit === Whiteboard.FitMode.stretch) {
      this.context.drawImage(image, 0, 0, cW, cH);
    } else if (fit === Whiteboard.FitMode.fit) {
      let ar = bW / bH;
      let arCanvas = cW / cH;
      if (ar < 1) {
        if (ar < arCanvas) {
          let dH = cH;
          let dW = dH * ar;
          dX = (cW - dW) / 2;
          this.context.drawImage(image, dX, 0, dW, dH);
        } else {
          let dW = cW;
          let dH = dW * (1 / ar);
          dY = (cH - dH) / 2;
          this.context.drawImage(image, 0, dY, dW, dH);
        }
      } else {
        if (ar > arCanvas) {
          let dW = cW;
          let dH = dW * (1 / ar);
          dY = (cH - dH) / 2;
          this.context.drawImage(image, 0, dY, dW, dH);
        } else {
          let dH = cH;
          let dW = dH * ar;
          dX = (cW - dW) / 2;
          this.context.drawImage(image, dX, 0, dW, dH);
        }
      }
    }
  }

  refresh() {
    this.erase();
    this.drawBackgroundImage();
    this.shapes.forEach((shape) => {
      shape.draw(this.context, true);
    });
  }

  erase() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  findEdge(x, y) {
    let resEdge;
    let resCorner;
    for (
      var it = this.shapes.values(), shape = null;
      (shape = it.next().value);

    ) {
      resEdge = shape.intersects(x, y);
      if (resEdge.intersects) {
        return [shape, resEdge.edge];
      }
      continue;
    }
    return [false];
  }

  findCorner(x, y) {
    let resCorner;
    for (
      var it = this.shapes.values(), shape = null;
      (shape = it.next().value);

    ) {
      resCorner = shape.isCloseToCorner(x, y);
      if (resCorner.isCloseToCorner) {
        return [shape, resCorner.corner];
      }
      continue;
    }
    return [false];
  }

  handleMouseOut(event) {
    this.mouse.update(event);
    if (this.tool.target) {
      this.tool.target.snap();
    }
    this.tool.setNone();
    this.refresh();
  }

  handleMouseDown(event) {
    event.preventDefault();
    if (this.mouse.isButtonDown) return;

    this.mouse.update(event);
    this.tool.setNone();
    switch (this.mouse.lastButtonDown) {
      // Right mouse button
      case MB_RIGHT:
        // If the right mouse button was pressed, see if the
        // cursor is above a shape. If so, switch to Move tool.
        for (
          var it = this.shapes.values(), shape = null;
          (shape = it.next().value);

        ) {
          if (!shape.contains(this.mouse.x, this.mouse.y)) {
            continue;
          } else {
            this.tool.setMove(shape);
            return;
          }
        }
        break;
      // Left mouse button
      case MB_LEFT:
        // If the left mouse button is pressed,
        // check if the cursor is over the edge of a shape
        // let ret = this.findEdgeOrCorner(this.mouse.x, this.mouse.y);
        let resCorner = this.findCorner(this.mouse.x, this.mouse.y);
        if (resCorner[0]) {
          this.tool.setResize(resCorner[0], resCorner[1]);
          return;
        }

        let resEdge = this.findEdge(this.mouse.x, this.mouse.y);
        if (resEdge[0]) {
          this.tool.setResize(resEdge[0], resEdge[1]);
          return;
        }

        let color = this.palette.getColor();
        shape = new this.currentShape(
          this.mouse.x,
          this.mouse.y,
          this.mouse.x,
          this.mouse.y,
          color
        );
        // this.add(shape);
        this.tool.setDraw(shape);
        break;
      default:
        break;
    }
  }

  handleMouseMove(event) {
    event.preventDefault();
    this.mouse.update(event);
    if (!this.mouse.isButtonDown) {
      // this.refresh();

      //   if (this.tool.edge || this.tool.corner) {
      //     return;
      //   }
      let ret;
      ret = this.findCorner(this.mouse.x, this.mouse.y);
      if (ret[0]) {
        this.tool.setCanResize(ret[0], ret[1]);
        return;
      }

      ret = this.findEdge(this.mouse.x, this.mouse.y);
      if (ret[0]) {
        this.tool.setCanResize(ret[0], ret[1]);
        return;
      }
      this.tool.setNone();
      return;
    }

    let targetShape = this.tool.target;

    if (this.mouse.isButtonDown) {
      switch (this.mouse.lastButtonDown) {
        case MB_RIGHT:
          // If the move tool is active...move the shape
          if (this.tool.action === Whiteboard.Tool.Action.Move) {
            targetShape.move({
              deltaX: this.mouse.movementX,
              deltaY: this.mouse.movementY,
            });
            // this.refresh();
          }
          break;

        case MB_LEFT:
          switch (this.tool.action) {
            // If the resize tool is active...resize the shape
            case Whiteboard.Tool.Action.Resize:
              let ret;
              // console.log(this.tool.corner, this.tool.edge);
              if (this.tool.edge) {
                ret = this.findEdge(this.mouse.x, this.mouse.y);
                if (ret[0] && ret[1] === this.tool.target) {
                  this.tool.setResize(ret[0], ret[1]);
                }
              } else {
                ret = this.findCorner(this.mouse.x, this.mouse.y);
                if (ret[0] && ret[1] === this.tool.target) {
                  this.tool.setResize(ret[0], ret[1]);
                }
              }
              targetShape.resize(
                this.mouse.delta,
                this.mouse.position,
                this.tool.edge || this.tool.corner
              );

              // this.refresh();
              break;

            // If the draw tool is active...update the shape
            case Whiteboard.Tool.Action.Draw:
              targetShape.update(
                this.mouse.lastButtonDownX,
                this.mouse.lastButtonDownY,
                this.mouse.x,
                this.mouse.y
              );
              if (targetShape.width >= 8 && targetShape.height >= 8) {
                this.add(targetShape);
              }

              // this.refresh();
              break;

            default:
              break;
          }

          break;
        default:
          break;
      }
      // this.pruneShape()
      this.refresh();
    }
  }

  handleMouseUp(event) {
    event.preventDefault();
    event.stopImmediatePropagation();
    if (!this.mouse.isButtonDown) return;

    this.mouse.update(event);

    if (this.tool.target) {
      let shapeTarget = this.tool.target;
      if (shapeTarget) {
        shapeTarget.snap();
        if (shapeTarget.width < 8 || shapeTarget.height < 8) {
          this.remove(shapeTarget);
        }
      }
    }
    // this.tool.setDraw();
    this.refresh();
    //   let mouse_pos = getMousePos(event, this.canvas);
    //   State.x_start = mouse_pos.x;
    //   State.y_start = mouse_pos.y;
  }
};
