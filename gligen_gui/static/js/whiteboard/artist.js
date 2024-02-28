



// mouse_id = document.getElementById("mouse-id");
// tool_id = document.getElementById("tool-id");

// window.addEventListener("load", () => {
//   let canvas = document.getElementById("top-canvas");
//   let topSurface = new Surface(canvas, 512, 512);
//   //   State.tempCanvas = "top-canvas";
//   //   State.finalCanvas = "canvas-final";

//   //   State.canvasWidth = 512;
//   //   State.canvasHeight = 512;

//   topSurface.context.strokeStyle = "#0000ff";
//   topSurface.context.lineWidth = 3;
//   //   let r1 = new Rectangle(32, 32, 36, 36);
//   let r2 = new Rectangle(128, 128, 256, 256, "#0000ff");

//   //   topSurface.add(r1);
//   topSurface.add(r2);

//   //   topSurface.drawShape();
//   topSurface.refresh();
//   topSurface.addEventListener(
//     "shapeAdded",
//     (e) => {
//       console.log("new rectangle created", topSurface.shapes);
//     },
//     false
//   );

//   topSurface.addEventListener(
//     "shapeRemoved",
//     (e) => {
//       console.log(" rectangle removed", topSurface.shapes);
//     },
//     false
//   );

//   //   State.finalContext.strokeStyle = "#ff0000";
//   //   State.finalContext.lineWidth = 1;

//   //   [State.tempCanvas, State.finalCanvas].forEach((canvas) => {
//   //   topSurface.canvas.addEventListener("mousedown", handleMouseDown);
//   //   topSurface.canvas.addEventListener("mouseup", handleMouseUp);
//   //   topSurface.canvas.addEventListener("mousemove", handleMouseMove);
//   //   });
// });
