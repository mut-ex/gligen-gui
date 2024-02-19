function requestGET(endpoint, handler) {
  fetch(endpoint, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      handler(endpoint, data);
    });
}

function requestPOST(endpoint, data, handler) {
  fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((data) => {
      handler(endpoint, data);
    });
}

function getSeed() {
  let arr = new Uint32Array(2);
  window.crypto.getRandomValues(arr);
  return String(BigInt(arr[0]) + (BigInt(arr[1]) << BigInt(32)));
}

function postInputArgs() {
  let tags = new Array();
  State.boxMap.forEach((box, box_id, map) => {
    if (box.prompt) tags.push(box.prompt);
  });
  tags = tags.join(";");
  let positive_prompt = `${State.positive_conditioning.replace(
    /[\s;]+$/g,
    ""
  )};${tags}`;

  requestPOST(
    "/input_args",
    {
      positive_prompt: positive_prompt,
      boxes: Array.from(State.boxMap),
    },
    (endpoint, response) => {
      console.log(response);
    }
  );
}

function buildPrompt() {
  if (State.seed_mode === "random") {
    State.seed = getSeed();
    document.getElementById("seed").value = State.seed;
  }
  let seed = State.seed;
  prompt = {};
  let idx = 1;
  // let
  let modelID = 1;
  prompt[String(idx)] = nodeCheckpointLoaderSimple(State.checkpoint_name);
  if (State.selected_loras.size > 0) {
    State.selected_loras.forEach((value, key) => {
      idx += 1;
      prompt[String(idx)] = nodeLoraLoaderModelOnly(
        value[0],
        value[1],
        String(idx - 1)
      );
      modelID = idx;
    });
  }
  idx += 1;
  prompt[String(idx)] = nodeGLIGENLoader(
    "gligen_sd14_textbox_pruned.safetensors"
  );
  let GLIGENLoaderID = idx;

  idx += 1;
  let bpCLIPTextEncode = idx;

  let tags = new Array();
  State.boxMap.forEach((box, box_id, map) => {
    if (box.prompt) tags.push(box.prompt);
    idx = idx + 1;
    prompt[String(idx)] = nodeGligenTextboxApply(
      box.prompt,
      box.width,
      box.height,
      box.x,
      box.y,
      idx - 1,
      modelID,
      GLIGENLoaderID
    );
  });

  let positiveID = idx;

  tags = tags.join(";");
  let positive_prompt = `${State.positive_conditioning.replace(
    /[\s;]+$/g,
    ""
  )};${tags}`;

  prompt[String(bpCLIPTextEncode)] = nodeCLIPTextEncode(
    positive_prompt,
    modelID
  );

  idx += 1;
  let negativeID = idx;
  prompt[String(negativeID)] = nodeCLIPTextEncode(
    State.negative_conditioning,
    modelID
  );

  idx += 1;
  let latentID = idx;
  let canvas = document.getElementById("canvas_main");
  prompt[String(latentID)] = nodeEmptyLatentImage(
    canvas.width,
    canvas.height,
    1
  );

  idx += 1;
  let ksamplerID = idx;
  prompt[String(ksamplerID)] = nodeKSampler(
    seed,
    State.steps,
    State.cfg,
    State.sampler_name,
    modelID,
    positiveID,
    negativeID,
    latentID
  );

  idx += 1;
  let vaedecodeID = idx;
  prompt[String(vaedecodeID)] = nodeVAEDecode(modelID, ksamplerID);

  idx += 1;
  let saveimageID = idx;
  prompt[String(saveimageID)] = nodeSaveImage("gligen/image", vaedecodeID);
  State.output_image_node = saveimageID;
  return prompt;
}

function getImage(endpoint) {
  fetch(endpoint)
    .then((response) => response.blob())
    .then((blob) => {
      var img = new Image();
      img.onload = function () {
        let canvas = document.getElementById("canvas_image");
        let ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
      };
      img.src = URL.createObjectURL(blob);
    })
    .catch((error) => console.error("Error:", error));
}

function initWebSocket() {
  const socket = new WebSocket(
    `ws://127.0.0.1:${State.comfy_ui_port || "8188"}/ws?clientId=1122`
  );
  socket.addEventListener("open", (event) => {});
  socket.addEventListener("message", (event) => {
    try {
      let parsed = JSON.parse(event.data);
      if (parsed.type === "progress") {
        let progress = Math.round((100 * parsed.data.value) / parsed.data.max);
        document.getElementById("progress-bar").style.width = `${progress}%`;
      } else if (parsed.type === "status" && !parsed.data.sid) {
        if (parsed.data.status.exec_info.queue_remaining === 0) {
          requestGET("/history", (endpoint, response) => {
            if (State.prompt_id) {
              let pid = response[State.prompt_id];
              let images = pid.outputs[State.output_image_node].images;
              images.forEach((image) => {
                let img_url = `/view?filename=${image.filename}&subfolder=${image.subfolder}&type=${image.type}`;
                getImage(img_url);
              });
            }
          });
        }
      }
    } catch (error) {}
  });
}

function queuePrompt() {
  let pb = document.getElementById("progress-bar");
  pb.style.width = "0%";
  let prompt = buildPrompt();
  initWebSocket();
  requestPOST(
    "/prompt",
    {
      prompt: prompt,
      client_id: "1122",
    },
    (endpoint, response) => {
      if (response.error) {
        addToast(
          "<u>Error!</u>",
          response.error.message,
          (is_error = true),
          (timeout = 0)
        );
        let node_errors = response.node_errors;
        if (node_errors) {
          let node;
          for (var node_id in node_errors) {
            node = node_errors[node_id];
            console.log(node);
            let class_type = node.class_type;
            let errors = node.errors;
            for (var eid in errors) {
              console.log(errors[eid].message);
              console.log(errors[eid].details);
              addToast(
                `<u>Error in ${class_type}</u>`,
                `${errors[eid].message}, ${errors[eid].details}`,
                (is_error = true),
                (timeout = 0)
              );
            }
          }
        }
      }
      if (response.prompt_id) {
        addToast("Success!", "The prompt was queued succesfully.");
        State.prompt_id = response.prompt_id;
        console.log("prompt_id = ", State.prompt_id);
      }
    }
  );
}

// Loads the list of checkpoints and populates the dropdown
function loadCheckpointList() {
  requestGET("/object_info/CheckpointLoaderSimple", (endpoint, data) => {
    let checkpoint_list =
      data.CheckpointLoaderSimple.input.required.ckpt_name[0];
    State.checkpoint_list = checkpoint_list;
    let checkpoint_dropdown = document.getElementById("checkpoint");
    let checkpoint_select = document.createElement("select");
    checkpoint_dropdown.appendChild(checkpoint_select);
    let option;

    option = document.createElement("option");
    //<option disabled selected value> -- select an option -- </option>
    option.disabled = true;
    option.selected = true;
    option.innerHTML = "-- select a checkpoint --";
    checkpoint_select.appendChild(option);
    checkpoint_list.forEach((checkpoint_name) => {
      option = document.createElement("option");
      option.title = checkpoint_name;
      option.value = checkpoint_name;
      option.innerHTML = checkpoint_name;
      checkpoint_select.appendChild(option);
    });
    checkpoint_select.addEventListener("change", (event) => {
      console.log(checkpoint_select.value);
      State.checkpoint_name = checkpoint_select.value;
    });

    if (State.checkpoint_name) {
      if (checkpoint_list.includes(State.checkpoint_name))
        checkpoint_select.value = State.checkpoint_name;
    }
  });
}

// Loads the list of samplers and populates the dropdown
function loadSamplerList() {
  requestGET("/object_info/KSampler", (endpoint, data) => {
    let sampler_list = data.KSampler.input.required.sampler_name[0];
    State.sampler_list = sampler_list;
    let sampler_dropdown = document.getElementById("sampler");
    let sampler_select = document.createElement("select");
    sampler_dropdown.appendChild(sampler_select);
    let option;
    sampler_list.forEach((sampler_name) => {
      option = document.createElement("option");
      option.title = sampler_name;
      option.value = sampler_name;
      option.innerHTML = sampler_name;
      sampler_select.appendChild(option);
    });
    sampler_select.addEventListener("change", (event) => {
      console.log(sampler_select.value);
      State.sampler_name = sampler_select.value;
    });
    if (State.sampler_name) {
      if (sampler_list.includes(State.sampler_name))
        sampler_select.value = State.sampler_name;
    } else {
      State.sampler_name = sampler_list[0];
      sampler_select.value = State.sampler_name;
    }
  });
}

// Loads the list of loras and populates the dropdown
function loadLoraList() {
  requestGET("/object_info/LoraLoaderModelOnly", (endpoint, data) => {
    let lora_list = data.LoraLoaderModelOnly.input.required.lora_name[0];
    State.complete_lora_list = lora_list;
  });
}

function deleteLora(event) {
  let uuid = extractUUID(event.target.id);
  let x = getMap("selected_loras");
  x.delete(uuid);
  setMap("selected_loras", x);
  event.target.parentNode.parentNode.remove();
}

function extractUUID(fullid) {
  return fullid.split("-")[1];
}

function updateLoraStrength(event) {
  let myUUID = extractUUID(event.target.id);
  if (State.selected_loras.has(myUUID)) {
    let loraName = event.target.previousSibling.firstChild.title;
    State.selected_loras = State.selected_loras.set(myUUID, [
      loraName,
      event.target.value,
    ]);
  }
}

function addLora(event, uuid = null) {
  uuid = uuid || String(Date.now());

  container = document.getElementById("lora-list");

  grid = document.createElement("div");
  grid.classList.add("lora-selector-grid");
  grid.id = `loragrid-${uuid}`;

  select = document.createElement("select");
  select.classList.add("dropdown");
  select.id = `loraselect-${uuid}`;
  grid.appendChild(select);

  lora_strength = document.createElement("input");
  lora_strength.classList.add("lora-strength");
  lora_strength.type = "number";
  lora_strength.step = "0.1";
  lora_strength.min = "-20";
  lora_strength.max = "20";
  try {
    lora_strength.value = State.selected_loras.get(uuid)[1];
  } catch {
    lora_strength.value = "1.0";
  }
  lora_strength.placeholder = "1.0";
  lora_strength.id = `lorastrength-${uuid}`;

  grid.appendChild(lora_strength);

  delete_button = document.createElement("div");
  delete_button.classList.add("icon-button");

  icon = document.createElement("img");
  icon.src = "/static/images/delete.svg";
  icon.id = `loradeleteicon-${uuid}`;
  delete_button.appendChild(icon);

  icon.addEventListener("click", deleteLora);

  grid.appendChild(delete_button);

  container.appendChild(grid);

  document.getElementById("phantom-space").classList.add("vertical-spacer");

  let option;
  State.complete_lora_list.forEach((lora_name) => {
    option = document.createElement("option");
    option.title = lora_name;
    option.value = lora_name;
    option.innerHTML = lora_name;
    select.appendChild(option);
  });

  try {
    select.value = State.selected_loras.get(uuid)[0];
  } catch {}

  lora_strength.addEventListener("input", updateLoraStrength);
  select.addEventListener("change", (event) => {
    let lora_name = event.target.value;
    let lora_strength = event.target.nextSibling.value;
    console.log(lora_name, lora_strength);
    let temp = getMap("selected_loras");
    temp.set(extractUUID(event.target.id), [lora_name, lora_strength]);
    setMap("selected_loras", temp);
    State.selected_loras = temp;
  });
}

// Adds an animation to the element with the given id
const animateCSS = (element_id, animation, prefix = "animate__") =>
  // We create a Promise and return it
  new Promise((resolve, reject) => {
    const animationName = `${prefix}${animation}`;
    const node = document.getElementById(element_id);

    node.classList.add(`${prefix}animated`, animationName, `animate__faster`);

    // When the animation ends, we clean the classes and resolve the Promise
    function handleAnimationEnd(event) {
      event.stopPropagation();
      node.classList.remove(
        `${prefix}animated`,
        animationName,
        `animate__faster`
      );
      resolve("Animation ended");
    }
    node.addEventListener("animationend", handleAnimationEnd, {
      once: true,
    });
  });

function handleImage(e) {
  var canvas = document.getElementById("canvas_image");
  var ctx = canvas.getContext("2d");
  var reader = new FileReader();
  reader.onload = function (event) {
    var img = new Image();
    img.onload = function () {
      // canvas.width = img.width;
      // canvas.height = img.height;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(e.target.files[0]);
}

function updateSeedButton() {
  let reuseSeed = document.getElementById("reuse-seed");
  let randomSeed = document.getElementById("random-seed");
  if (State.seed_mode === "reuse") {
    reuseSeed.classList.add("icon-button--selected");
    randomSeed.classList.remove("icon-button--selected");
    reuseSeed.getElementsByTagName("img")[0].src =
      "/static/images/recycle-active.svg";
    randomSeed.getElementsByTagName("img")[0].src = "/static/images/dice.svg";
  } else {
    State.seed_mode = "random";
    randomSeed.classList.add("icon-button--selected");
    reuseSeed.classList.remove("icon-button--selected");
    randomSeed.getElementsByTagName("img")[0].src =
      "/static/images/dice-active.svg";
    reuseSeed.getElementsByTagName("img")[0].src = "/static/images/recycle.svg";
  }
}

function createCopyImageContextMenu() {
  var contextMenu = document.createElement("div");
  const buttonContainer = document.createElement("div");
  buttonContainer.classList.add("context-menu");
  const copyImageOnly = document.createElement("button");
  copyImageOnly.innerHTML = "Copy Image";
  copyImageOnly.id = "copyImageOnly";
  const copyComposite = document.createElement("button");
  copyComposite.innerHTML = "Copy Composite";
  copyComposite.id = "copyComposite";
  buttonContainer.appendChild(copyImageOnly);
  buttonContainer.appendChild(copyComposite);
  contextMenu.appendChild(buttonContainer);
  contextMenu.style.display = "none";
  contextMenu.style.position = "absolute";
  contextMenu.style.zIndex = "4";
  document.body.appendChild(contextMenu);

  document
    .getElementById("canvas_temp")
    .addEventListener("contextmenu", function (e) {
      e.preventDefault();
      contextMenu.style.display = "block";
      contextMenu.style.left = e.pageX + "px";
      contextMenu.style.top = e.pageY + "px";
    });

  // Hide the context menu when clicking anywhere else
  document.addEventListener("click", function (e) {
    contextMenu.style.display = "none";
  });

  // Copy the canvas content when clicking the "Copy" button
  document
    .getElementById("copyImageOnly")
    .addEventListener("click", function () {
      const canvas_image = document.getElementById("canvas_image");
      canvas_image.toBlob((blob) =>
        navigator.clipboard.write([
          new window.ClipboardItem({
            "image/png": blob,
          }),
        ])
      );
    });

  document
    .getElementById("copyComposite")
    .addEventListener("click", function () {
      composeImage().toBlob((blob) =>
        navigator.clipboard.write([
          new window.ClipboardItem({
            "image/png": blob,
          }),
        ])
      );
    });
}

function composeImage() {
  const canvas_image = document.getElementById("canvas_image");
  const canvas_main = document.getElementById("canvas_main");
  const canvas_final = document.createElement("canvas");
  const ctx_final = canvas_final.getContext("2d");
  canvas_final.width = State.canvas_width;
  canvas_final.height = State.canvas_height;
  ctx_final.drawImage(canvas_image, 0, 0);
  ctx_final.drawImage(canvas_main, 0, 0);
  return canvas_final;
}

function downloadImage() {
  const image = composeImage().toDataURL("image/png");
  const link = document.createElement("a");
  link.href = image;
  link.download = `${Date.now()}.png`;
  link.click();
}

function updateCanvasSize() {
  console.log("Updating canvas size...");
  let widthInput = document.getElementById("width");
  let heightInput = document.getElementById("height");

  if (!widthInput.value || !heightInput.value) {
    addToast(
      "<u>Error!</u>",
      "Please enter a valid image size",
      (is_error = true),
      (timeout = 3000)
    );
    return;
  }

  let new_width, new_height;
  new_width = widthInput.value;
  new_height = heightInput.value;

  setCanvasSize(new_width, new_height);
  console.log(new_width, new_height);
}

// Sets the canvas size
function setCanvasSize(width, height) {
  let aspect_ratio = width / height;
  let sf_x = width / State.canvas_width;
  let sf_y = height / State.canvas_height;
  console.log("aspect ratio=", aspect_ratio);

  // if (aspect_ratio > 1){
  //   width = 512
  //   height = 512  * (1/aspect_ratio);
  // } else {
  //   width = 512

  // }
  State.canvas_width = width;
  State.canvas_height = height;
  // document.getElementById(
  //   'canvas-column'
  // ).style.minWidth = `calc(1.5rem + ${val}px + 6px`
  let column_canvas = document.getElementsByClassName("column-canvas")[0];
  column_canvas.style.maxWidth = `${width}px`;
  column_canvas.style.minWidth = `${width}px`;
  column_canvas.style.width = `${width}px`;

  let canvas_container = document.getElementsByClassName("canvas-container")[0];
  canvas_container.style.height = `${height}px`;
  canvas_container.style.width = `${width}px`;

  ["canvas_image", "canvas_main", "canvas_temp"].forEach((canvas_name) => {
    let c = document.getElementById(canvas_name);
    let ctx = c.getContext("2d");
    c.width = width;
    c.height = height;
    ctx.font = `bold ${22 * (Math.max(width, height) / 512)}px courier`;
    ctx.lineWidth = 4 * (Math.max(width, height) / 512);
  });

  if (State.boxMap.size > 0) {
    let table = document.getElementById("grounding-boxes");
    table.innerHTML = "";
    clearCanvas("canvas_main");

    State.boxMap.forEach((box, box_id, map) => {
      box.x = box.x * sf_x;
      box.width = box.width * sf_x;
      box.width = Math.floor(box.width / 8 + 0.5) * 8;

      box.y = box.y * sf_y;
      box.height = box.height * sf_y;
      box.height = Math.floor(box.height / 8 + 0.5) * 8;

      addTableRow(box, box_id, map);
      drawBox(box, "canvas_main");
    });
  }

  let widthInput = document.getElementById("width");
  let heightInput = document.getElementById("height");

  widthInput.value = State.canvas_width;
  heightInput.value = State.canvas_height;
}

function loadCanvasSize() {
  let width = State.canvas_width;
  let height = State.canvas_height;

  let widthInput = document.getElementById("width");
  let heightInput = document.getElementById("height");

  widthInput.value = width;
  heightInput.value = height;

  setCanvasSize(width, height);
}

window.addEventListener("load", () => {
  const port = getPort();
  console.log("ComfyUI port = ", port);
  State.comfy_ui_port = port;

  if (!State.seed) {
    State.seed = getSeed();
  }
  if (!State.seed_mode) {
    State.seed_mode = "random";
  }
  console.log("Seed Mode: ", State.seed_mode);
  document.getElementById("reuse-seed").addEventListener("click", () => {
    State.seed_mode = "reuse";
    updateSeedButton();
  });
  document.getElementById("random-seed").addEventListener("click", () => {
    State.seed_mode = "random";
    updateSeedButton();
    State.seed = getSeed();
    document.getElementById("seed").value = State.seed;
  });

  updateSeedButton();
  document.getElementById("seed").value = State.seed;

  document.getElementById("seed").addEventListener("input", (event) => {
    State.seed = event.target.value;
    console.log("Seed edited");
  });

  loadCheckpointList();
  loadSamplerList();
  loadLoraList();
  State.selected_loras.forEach((value, key) => {
    addLora(null, key);
  });

  document.getElementById("fileInput").addEventListener("change", handleImage);

  State.boxMap = State.boxMap || new Map();
  if (State.boxMap.size > 0) {
    State.boxMap.forEach((box, box_id, map) => {
      drawBox(box, "canvas_main");
      addTableRow(box, box_id, map);
    });
  }
  loadCanvasSize();

  let steps_input = document.getElementById("steps");
  State.steps = State.steps || 30;
  steps_input.value = State.steps;
  steps_input.addEventListener("input", (event) => {
    State.steps = event.target.value;
  });

  let cfg_input = document.getElementById("cfg");
  State.cfg = State.cfg || "8.0";
  cfg_input.value = State.cfg;
  cfg_input.addEventListener("input", (event) => {
    State.cfg = event.target.value;
  });

  let positive_conditioning = document.getElementById("positive-conditioning");
  State.positive_conditioning =
    State.positive_conditioning ||
    "(4k, best quality, masterpiece:1.2), ultra high res, ultra detailed";
  positive_conditioning.value = State.positive_conditioning;
  State.positive_conditioning;
  positive_conditioning.addEventListener("input", (event) => {
    State.positive_conditioning = event.target.value;
  });

  let negative_conditioning = document.getElementById("negative-conditioning");
  State.negative_conditioning =
    State.negative_conditioning || "watermark, text, blurry";
  negative_conditioning.value = State.negative_conditioning;
  negative_conditioning.addEventListener("input", (event) => {
    State.negative_conditioning = event.target.value;
  });

  document.getElementById("add-lora").addEventListener("click", addLora);

  document.getElementById("toggle-all").addEventListener("click", (event) => {
    toggleBoxes(document.getElementById("toggle-all"));
  });

  document.getElementById("delete-all").addEventListener("click", (event) => {
    State.boxMap.forEach((box, box_id, map) => {
      colorSet.add(State.boxMap.get(box_id).color);
      deleteRow(box_id);
      State.boxMap.delete(box_id);
    });
    clearCanvas("canvas_main");
    drawBoxes();
  });

  let canvas_temp = document.getElementById("canvas_temp");
  canvas_temp.addEventListener("mousedown", (event) =>
    handleMouseEvent(event, "mousedown")
  );
  canvas_temp.addEventListener("mouseup", (event) =>
    handleMouseEvent(event, "mouseup")
  );
  canvas_temp.addEventListener("mousemove", (event) =>
    handleMouseEvent(event, "mousemove")
  );
  createCopyImageContextMenu();
  State.mbDown = false;
});
