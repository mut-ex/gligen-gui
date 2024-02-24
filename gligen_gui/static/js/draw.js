// Returns the co-ordinates of the mouse
function getMousePos(event) {
  let canvas_temp = document.getElementById("canvas_temp");
  let ctx_temp = canvas_temp.getContext("2d");
  var rect = canvas_temp.getBoundingClientRect();
  var scaleX = canvas_temp.width / rect.width;
  var scaleY = canvas_temp.height / rect.height;
  return {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY,
  };
}

// Handles the mouse movement and clicking events for drawing the rectangles
function handleMouseEvent(event, mouse_event) {
  if (State.boxMap.size >= 30) {
    return;
  }
  let mouse_pos = getMousePos(event);

  mouse_pos.x = Math.floor(mouse_pos.x / 8 + 0.5) * 8;
  mouse_pos.y = Math.floor(mouse_pos.y / 8 + 0.5) * 8;
  switch (mouse_event) {
    case "mousedown":
      console.log(event);

      if (State.mbDown === false) {
        State.mbDown = true;
        State.x = mouse_pos.x;
        State.y = mouse_pos.y;
        State.currColor = iteratorColors.next().value;
        colorSet.delete(State.currColor);
      }
      break;
    case "mouseup":
      if (State.mbDown === true) {
        State.mbDown = false;
        State.width = mouse_pos.x - State.x;
        State.height = mouse_pos.y - State.y;
        if (State.width < 0) {
          State.width = State.x - mouse_pos.x;
          State.x = mouse_pos.x;
        }
        if (State.height < 0) {
          State.height = State.y - mouse_pos.y;
          State.y = mouse_pos.y;
        }
        if (Math.abs(State.width) >= 8 && Math.abs(State.height) >= 8) {
          clearCanvas("canvas_temp");
          let new_box = newBox(State.x, State.y, State.width, State.height);
          addBox(new_box.id, new_box.box);
          drawBox(new_box.box, "canvas_main");
          let new_row = addTableRow(new_box.box, new_box.id);
          new_row.classList.add("enter-animation");
          new_row.addEventListener("animationend", () => {
            new_row.classList.remove("enter-animation");
          });
        } else {
          colorSet.add(State.currColor);
        }
        State.x = null;
        State.y = null;
      }
      break;
    case "mousemove":
      if (State.mbDown === true) {
        State.width = mouse_pos.x - State.x;
        State.height = mouse_pos.y - State.y;

        if (Math.abs(State.width) >= 8 && Math.abs(State.height) >= 8) {
          clearCanvas("canvas_temp");
          drawBox(
            {
              x: State.x,
              y: State.y,
              width: State.width,
              height: State.height,
              prompt: "",
              hide: false,
            },
            "canvas_temp"
          );
        }
      }
      break;
  }
}

// Deletes the given box
function deleteBox(box, box_id) {
  colorSet.add(State.boxMap.get(box_id).color);
  State.boxMap.delete(box_id);
  clearCanvas("canvas_main");
  drawBoxes();
}

// Adds the given box to the box map
function addBox(id, box) {
  State.boxMap.set(id, box);
  // setMap("boxes", State.boxMap);
}
function generateUUID() {
  var d = new Date().getTime();
  var d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now() * 1000)) || 0;
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16;
    if (d > 0) {
      r = (d + r) % 16 | 0;
      d = Math.floor(d / 16);
    } else {
      r = (d2 + r) % 16 | 0;
      d2 = Math.floor(d2 / 16);
    }
    return (c === 'x' ? r : (r & 0x7 | 0x8)).toString(16);
  });
}
// Creates and returns a new box and box id
function newBox(x, y, width, height) {
  // let new_id = crypto.randomUUID();
  let new_id = generateUUID();
  let new_box = {
    x: x,
    y: y,
    width: width,
    height: height,
    color: State.currColor,
    prompt: "",
    hide: false,
  };
  return {
    id: new_id,
    box: new_box,
  };
}

// Draws the a text centered within the given box parameters and on the provided canvas context
// TODO: Modify to accept a box object instead
function drawTextCenter(ctx, text, box_x, box_y, box_width, box_height) {
  let x = box_x;
  let y = box_y;
  const text_metrics = ctx.measureText(text); // TextMetrics object

  x = Math.round(x + (box_width - text_metrics.width) / 2);
  let height = Math.round(
    text_metrics.actualBoundingBoxAscent - text_metrics.actualBoundingBoxDescent
  );
  y = Math.round(box_y + (box_height - height) / 2);
  ctx.fillStyle = "#fefefa";
  ctx.fillRect(x - 4, y - 4, text_metrics.width + 6, height + 6);
  ctx.fillStyle = "#ff1493";
  ctx.fillText(text, x, y + height);
}

// Draws all the boxes
// TODO: Make this reusable
function drawBoxes() {
  State.boxMap.forEach((box, box_id, map) => {
    drawBox(box, "canvas_main");
  });
}

// Draws a box object on the canvas with the given canvas_id
function drawBox(box, canvas_id) {
  console.log(box);
  if (box.hide === true) {
    return;
  }
  let canvas = document.getElementById(canvas_id);
  let ctx = canvas.getContext("2d");
  ctx.strokeStyle = box.color || State.currColor;
  ctx.strokeRect(box.x, box.y, box.width, box.height);
  console.log(box.prompt, box.prompt.length);
  if (box.prompt.length === 0) {
    drawTextCenter(
      ctx,
      `${Math.abs(box.width)}×${Math.abs(box.height)}`,
      box.x,
      box.y,
      box.width,
      box.height
    );
  } else {
    drawTextCenter(
      ctx,
      box.prompt.toUpperCase(),
      box.x,
      box.y,
      box.width,
      box.height
    );
  }
}

// Clears the canvas with the given canvas_id
function clearCanvas(canvas_id) {
  let canvas = document.getElementById(canvas_id);
  let ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, State.canvas_width, State.canvas_height);
}

// Adds a new row to the Grounding Boxes table for the given box
function addTableRow(box, box_id, map) {
  let table = document.getElementById("grounding-boxes");

  let row_id = `row-${box_id}`;
  let new_row = document.createElement("div");
  new_row.classList.add("grounding-boxes-grid");
  new_row.id = row_id;

  let col_prompt_input = document.createElement("div");
  col_prompt_input.classList.add("col-prompt-input");

  let prompt_input = document.createElement("input");
  prompt_input.id = "input-" + box_id;
  prompt_input.setAttribute("type", "text");
  prompt_input.value = box.prompt;
  prompt_input.placeholder = `${box.width} × ${box.height}`;
  col_prompt_input.appendChild(prompt_input);
  new_row.appendChild(col_prompt_input);

  // Add event handler to update the text on the canvas to reflect
  // the entered prompt
  prompt_input.addEventListener("input", (event) => {
    box.prompt = event.target.value;
    clearCanvas("canvas_main");
    drawBoxes();
    // setMap("boxes", State.boxMap);
    State.boxMap = State.boxMap;
  });

  // Create a column for the box's x and y co-ordinates
  let col_xy = document.createElement("div");
  col_xy.classList.add("col-numbers");
  col_xy.innerHTML = `${box.x}, ${box.y}`;
  new_row.appendChild(col_xy);

  // Create a column for the box's width and height
  let col_dims = document.createElement("div");
  col_dims.classList.add("col-numbers");
  col_dims.innerHTML = `${box.width}<span style="opacity:0.5;">&nbsp;×&nbsp;</span>${box.height}`;
  new_row.appendChild(col_dims);

  // Create a column for the delete box button
  let col_delete = document.createElement("div");
  col_delete.classList.add("icon-button");
  let delete_button_image = document.createElement("img");
  delete_button_image.src = "/static/images/delete.svg";
  col_delete.appendChild(delete_button_image);
  new_row.appendChild(col_delete);

  // Add event handler for the delete button
  delete_button_image.addEventListener("click", (event) => {
    deleteRow(box_id);
    deleteBox(box, box_id);
  });
  delete_button_image.title = "Delete this grounding box";

  // Create a column for the toggle visibility button
  let col_eye = document.createElement("div");
  col_eye.classList.add("icon-button");
  let eye_button_image = document.createElement("img");
  eye_button_image.id = `eye-button-${box_id}`;
  if (box.hide === false) {
    eye_button_image.src = "/static/images/eye-on.svg";
    eye_button_image.title = "Hide this grounding box";
  } else if (box.hide === true) {
    eye_button_image.src = "/static/images/eye-off.svg";
    eye_button_image.style.opacity = "0.5";
    eye_button_image.title = "Show this grounding box";
  }
  col_eye.appendChild(eye_button_image);

  new_row.appendChild(col_eye);

  table.append(new_row);
  // Add event handler for the toggle visibility button
  eye_button_image.addEventListener("click", (event) => {
    if (box.hide === false) {
      box.hide = true;
      eye_button_image.src = "/static/images/eye-off.svg";
      eye_button_image.style.opacity = "0.5";
      eye_button_image.title = "Show this grounding box";
    } else {
      box.hide = false;
      eye_button_image.src = "/static/images/eye-on.svg";
      eye_button_image.style.opacity = "1";
      eye_button_image.title = "Hide this grounding box";
    }
    clearCanvas("canvas_main");
    drawBoxes();
    // setMap("boxes", State.boxMap);
  });

  animateCSS(row_id, "fadeIn");
  prompt_input.focus();
  return new_row;
}

// Deles the row from the Grounding Boxes table for the box with the given box_id
function deleteRow(box_id) {
  let row_id = `row-${box_id}`;
  let row = document.getElementById(row_id);
  row.classList.add("leave-animation");
  row.addEventListener("animationend", () => {
    row.remove();
  });
}
