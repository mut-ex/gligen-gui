function createContextMenu() {
  let contextMenu = document.createElement("div");
  contextMenu.classList.add("context-menu");
  let heading = document.createElement("div");
  heading.innerHTML = "Set background fit mode to...";
  heading.classList.add("context-menu-heading");
  contextMenu.appendChild(heading);

  let button = document.createElement("div");
  button.innerHTML = "center";
  button.classList.add("context-menu-button");
  button.addEventListener("click", () => {
    AppSurface.setFitMode(Whiteboard.FitMode.center);
    contextMenu.style.display = "none";
  });
  contextMenu.appendChild(button);

  button = document.createElement("div");
  button.innerHTML = "stretch";
  button.classList.add("context-menu-button");
  button.addEventListener("click", () => {
    AppSurface.setFitMode(Whiteboard.FitMode.stretch);
    contextMenu.style.display = "none";
  });
  contextMenu.appendChild(button);

  button = document.createElement("div");
  button.innerHTML = "fit";
  button.classList.add("context-menu-button");
  button.addEventListener("click", () => {
    AppSurface.setFitMode(Whiteboard.FitMode.fit);
    contextMenu.style.display = "none";
  });
  contextMenu.appendChild(button);

  document.body.appendChild(contextMenu);

  function placeContextMenu() {
    let target = document.getElementById("backgroundImageFitMode");
    // contextMenu.style.display = "flex";
    let rect = target.getBoundingClientRect();
    let x = rect.left;
    let y = rect.top;
    contextMenu.style.left = x + 2 + "px";
    contextMenu.style.top = y + 2 + "px";
  }
  // contextMenu.style.display = flex;
  placeContextMenu();
  document
    .getElementById("backgroundImageFitMode")
    .addEventListener("click", function (e) {
      // e.preventDefault();
      placeContextMenu();
      contextMenu.classList.add("context-menu-grow");
    });

  contextMenu.addEventListener("mouseleave", function (e) {
    // contextMenu.style.display = "none";
    contextMenu.classList.remove("context-menu-grow");
  });
}

class ToolTip {
  constructor(targetID, content) {
    this.target = document.getElementById(targetID);

    this.timeoutID = null;
    this.ContextMenu = document.createElement("div");
    this.ContextMenu.classList.add("context-menu");

    let boundingRect = this.target.getBoundingClientRect();
    let x = boundingRect.left;
    let y = boundingRect.top;
    this.ContextMenu.style.left = x + 2 + "px";
    this.ContextMenu.style.top = y + 2 + "px";

    if (content.listItems) {
      let ul = document.createElement("ul");
      let li;
      for (let item of content.listItems) {
        li = document.createElement("li");
        li.innerHTML = item;
        ul.appendChild(li);
      }
      // ul.classList.add("context-menu-ul");
      this.ContextMenu.appendChild(ul);
    }

    document.body.appendChild(this.ContextMenu);
    this.target.addEventListener("mouseenter", this.onMouseEnter.bind(this));
    this.ContextMenu.addEventListener(
      "mouseleave",
      this.onMouseLeave.bind(this)
    );

    this.target.addEventListener("mouseleave", this.cancelTimer.bind(this));
  }

  onMouseEnter(e) {
    if (this.timeoutID) return;
    this.timeoutID = setTimeout(showToolTip.bind(this), 500);

    function showToolTip() {
      let rect = this.target.getBoundingClientRect();
      let x = rect.left;
      let y = rect.top;
      this.ContextMenu.style.display = "flex";
      this.ContextMenu.style.left = x + 2 + "px";
      this.ContextMenu.style.top = y + 2 + "px";
      this.ContextMenu.classList.add("context-menu-grow");
    }
  }

  onMouseLeave(e) {
    this.ContextMenu.classList.remove("context-menu-grow");
    this.cancelTimer();
  }

  cancelTimer() {
    clearTimeout(this.timeoutID);
    this.timeoutID = null;
  }
}

function createToolTip() {}

function getSeed() {
  let arr = new Uint32Array(2);
  window.crypto.getRandomValues(arr);
  return String(BigInt(arr[0]) + (BigInt(arr[1]) << BigInt(32)));
}

function postInputArgs() {
  // return
  let tags = new Array();
  globalState.boxMap.forEach((box, box_id, map) => {
    if (box.caption) tags.push(box.caption);
  });
  tags = tags.join(";");
  let positivePrompt = globalState.positivePrompt || "";
  let positive_prompt = `${positivePrompt.replace(/[\s;]+$/g, "")};${tags}`;
  // console.log("TAGS: ", tags);
  requestPOST(
    "/input_args",
    {
      positive_prompt: positive_prompt,
      boxes: Array.from(globalState.boxMap),
    },
    (endpoint, response) => {
      // console.log(response);
    }
  );
}

function getImage(endpoint) {
  fetch(endpoint)
    .then((response) => response.blob())
    .then((blob) => {
      var img = new Image();
      img.onload = function () {
        // let canvas = document.getElementById("canvas_image");
        // let ctx = canvas.getContext("2d");
        // ctx.drawImage(img, 0, 0);
        AppSurface.backgroundImage = img;
      };
      img.src = URL.createObjectURL(blob);
    })
    .catch((error) => console.error("Error:", error));
}

function handleBackgroundImageInput(e) {
  var reader = new FileReader();
  reader.onload = function (event) {
    var img = new Image();
    img.onload = function () {
      // canvas.width = img.width;
      // canvas.height = img.height;
      // ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      AppSurface.backgroundImage = img;
      // AppSurface.backgroundImageSrc = img.src;
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(e.target.files[0]);
}

function handleImage(e) {
  var canvas = document.getElementById("image-canvas");
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

function downloadBackgroundImage() {
  if (AppSurface.backgroundImage) {
    const image = AppSurface.backgroundImage.src;
    console.log(image);
    const link = document.createElement("a");
    link.href = image;
    link.download = `${Date.now()}.png`;
    link.click();
  } else {
    addToast(
      "<u>Oops</u>",
      "There is no image to download!",
      (is_error = true),
      (timeout = 3000)
    );
  }
}

function setCanvasSize(width, height) {
  globalState.canvasWidth = width;
  globalState.canvasHeight = height;
  AppSurface.resize(width, height);
  document.getElementById("width").value = AppSurface.width;
  document.getElementById("height").value = AppSurface.height;
  globalState.saveToLocalStorage();
}

var AppSurface;
/**
 * WINDOW LOAD ****************************************************************
 * **/
window.addEventListener("load", () => {
  globalState.loadFromLocalStorage();

  let mainCanvas = document.getElementById("main-canvas");
  AppSurface = new Whiteboard.Surface(mainCanvas);
  console.log(globalState.canvasWidth, globalState.canvasHeight);
  AppSurface.resize(
    globalState.canvasWidth || 512,
    globalState.canvasHeight || 512
  );
  // setCanvasSize(globalState.canvasWidth, globalState.canvasHeight)
  const port = getPort();
  globalState.comfyPort = port;
  console.log("ComfyUI port = ", globalState.comfyPort);

  loadSeed();

  // loadCheckpointList();
  loadCheckpointList();
  loadVAEList();
  loadKSamplerLists();
  loadLoraList();

  let tt = new ToolTip("canvasInfo", {
    heading: null,
    listItems: [
      "Left click and drag anywhere on canvas to draw boxes",
      "Left click and drag box edges to resize",
      "Right click and drag to move boxes",
    ],
  });
  // requestGET("/object_info/CheckpointLoaderSimple", loadCheckpointList);
  // requestGET("/object_info/VAELoader", loadVAEList);

  // requestGET("/object_info/KSampler", loadKSamplerLists);

  // requestGET("/object_info/LoraLoaderModelOnly", loadLoraList);
  document.getElementById("add-lora").addEventListener("click", addLora);

  document
    .getElementById("backgroundImageInput")
    .addEventListener("change", handleBackgroundImageInput);

  // State.boxMap = State.boxMap || new Map();
  // if (State.boxMap.size > 0) {
  //   State.boxMap.forEach((box, box_id, map) => {
  //     drawBox(box, "canvas_main");
  //     addTableRow(box, box_id, map);
  //   });
  // }
  // loadCanvasSize();

  function setSurfaceSizeInputs(width, height) {
    document.getElementById("width").value = width;
    document.getElementById("height").value = height;
  }

  // function handleSurfaceResize(e) {
  //   setSurfaceSizeInputs(e.width, e.height)
  // }

  // AppSurface.addEventListener("surfaceResized", handleSurfaceResize)
  setSurfaceSizeInputs(AppSurface.width, AppSurface.height);

  document
    .getElementById("buttonSetCanvasSize")
    .addEventListener("click", (e) => {
      let width = Number(document.getElementById("width").value);
      let height = Number(document.getElementById("height").value);

      if (width === 0) width = AppSurface.width;
      if (height === 0) height = AppSurface.height;

      setCanvasSize(width, height);
    });

  document.getElementById("selectCanvasSize").value = "";
  document
    .getElementById("selectCanvasSize")
    .addEventListener("change", (e) => {
      if (e.target.value.length === 0) {
        return;
      }
      let newSize = e.target.value.split(",");
      setCanvasSize(newSize[0], newSize[1]);
    });

  AppSurface.addEventListener("shapeAdded", (event) => {
    if (!event.shape.id) {
      let id = Date.now();
      event.shape.id = id;
      globalState.boxMap.set(id, event.shape);
    }
    addTableRow(event.shape, event.shape.id);
    event.shape.addEventListener("shapeDeselected", (e) => {
      globalState.saveToLocalStorage();
    });
  });
  AppSurface.loadFromMap(globalState.boxMap);

  let stepsInput = document.getElementById("steps");
  globalState.stepsValue = globalState.stepsValue || 25;
  stepsInput.value = globalState.stepsValue;
  stepsInput.addEventListener("input", (event) => {
    let steps = event.target.value;
    console.log(parseFloat(steps));
    if (parseFloat(steps)) {
      globalState.stepsValue = steps;
      globalState.saveToLocalStorage();
    }
  });

  stepsInput.addEventListener("blur", (event) => {
    let steps = event.target.value;
    steps = parseFloat(steps);
    if (steps) {
      if (steps > 10000) {
        steps = 10000;
      } else if (steps < 0) {
        steps = 1;
      }
      globalState.stepsValue = steps;
      event.target.value = steps;
    } else {
      event.target.value = globalState.stepsValue;
    }
  });

  let cfgInput = document.getElementById("cfg");
  globalState.cfgValue = globalState.cfgValue || 8.0;
  cfgInput.value = globalState.cfgValue;
  cfgInput.addEventListener("input", (event) => {
    let cfg = event.target.value;
    console.log(parseFloat(cfg));
    if (parseFloat(cfg)) {
      globalState.cfgValue = cfg;
      globalState.saveToLocalStorage();
    }
  });

  cfgInput.addEventListener("blur", (event) => {
    let cfg = event.target.value;
    cfg = parseFloat(cfg);
    if (cfg) {
      if (cfg > 100) {
        cfg = 100;
      } else if (cfg < 0) {
        cfg = 0;
      }
      globalState.cfgValue = cfg;
      event.target.value = cfg;
    } else {
      event.target.value = globalState.cfgValue;
    }
  });

  let positiveConditioning = document.getElementById("positive-conditioning");
  globalState.positivePrompt =
    globalState.positivePrompt ||
    "(4k, best quality, masterpiece:1.2), ultra high res, ultra detailed";
  positiveConditioning.value = globalState.positivePrompt;
  globalState.positivePrompt;
  positiveConditioning.addEventListener("input", (event) => {
    globalState.positivePrompt = event.target.value;
  });
  globalState.addEventListener("positivePrompt", (value) => {
    positiveConditioning.value = value;
  });

  let negativeConditioning = document.getElementById("negative-conditioning");
  globalState.negativePrompt =
    globalState.negativePrompt || "watermark, text, blurry";
  negativeConditioning.value = globalState.negativePrompt;
  negativeConditioning.addEventListener("input", (event) => {
    globalState.negativePrompt = event.target.value;
  });
  globalState.addEventListener("negativePrompt", (value) => {
    negativeConditioning.value = value;
  });

  document.getElementById("show-all").addEventListener("click", (event) => {
    let buttonEye;
    AppSurface.shapes.forEach((box, _box, map) => {
      box.visible = true;
      buttonEye = document.getElementById(`eyebutton-${box.id}`);
      buttonEye.src = "/static/images/eye-on.svg";
      buttonEye.style.opacity = "1";
    });
    AppSurface.refresh();
    globalState.saveToLocalStorage();
  });

  document.getElementById("hide-all").addEventListener("click", (event) => {
    let buttonEye;
    AppSurface.shapes.forEach((box, _box, map) => {
      box.visible = false;
      // console.log(box, box_id)
      buttonEye = document.getElementById(`eyebutton-${box.id}`);
      buttonEye.src = "/static/images/eye-off.svg";
      buttonEye.style.opacity = "0.5";
    });
    AppSurface.refresh();
    // clearCanvas("canvas_main");
    globalState.saveToLocalStorage();
  });

  document.getElementById("delete-all").addEventListener("click", (event) => {
    AppSurface.clear();
    globalState.boxMap.clear();
    globalState.saveToLocalStorage();
  });

  createContextMenu();
  // AppSurface.loadFromLocalStorage();
  // console.log( Array.from(AppSurface.shapes))
  // export2txt({ globalState: globalState, shapes: Array.from(AppSurface.shapes) });
  // let canvas_temp = document.getElementById("canvas_temp");
  // canvas_temp.addEventListener("mousedown", (event) =>
  //   handleMouseEvent(event, "mousedown")
  // );
  // canvas_temp.addEventListener("mouseup", (event) =>
  //   handleMouseEvent(event, "mouseup")
  // );
  // canvas_temp.addEventListener("mousemove", (event) =>
  //   handleMouseEvent(event, "mousemove")
  // );
  // createCopyImageContextMenu();
  // State.mbDown = false;
  // flatten();
});

var saveToFileID = document.getElementById("saveToFile");
saveToFileID.addEventListener("click", saveToFile);

function saveToFile() {
  globalState.saveToFile(`${makeSavefileName()}.json`);
}

var loadFromFileID = document.getElementById("loadFromFile");
loadFromFileID.addEventListener("change", loadFromFile);
function loadFromFile(event) {
  const file = event.target.files[0];

  if (file) {
    const reader = new FileReader();

    // Read the file as text
    reader.readAsText(file);

    // When the file is loaded, parse the JSON content
    reader.onload = function (event) {
      try {
        // const jsonContent = JSON.parse(event.target.result);
        let ret = globalState.loadFromString(event.target.result);
        if (ret) {
          AppSurface.loadFromMap(globalState.boxMap);
          addToast("load complete", "Session loaded from file");
        } else {
          addToast(
            "<u>session load error</u>",
            "Please make sure you are selecting a valid session file",
            (is_error = true),
            (timeout = 0)
          );
        }
      } catch (error) {
        console.error("Error parsing JSON:", error);
        addToast(
          "<u>session load error</u>",
          "Please make sure you are selecting a valid session file",
          (is_error = true),
          (timeout = 0)
        );
      }
    };
  }
}

document.getElementById("clearAll").addEventListener("click", (e) => {
  let nodes = document.querySelectorAll("body > *");
  for (let n of nodes) {
    if (n.id === "modal-container") continue;
    console.log(n.id);
    n.classList.add("veil");
  }
  document.getElementById("modal-container").style.display = "flex";
});

document.getElementById("clearNo").addEventListener("click", (e) => {
  let nodes = document.querySelectorAll("body > *");
  for (let n of nodes) {
    if (n.id === "modal-container") continue;
    console.log(n.id);
    n.classList.remove("veil");
  }
  document.getElementById("modal-container").style.display = "none";
});

document.getElementById("clearYes").addEventListener("click", (e) => {
  localStorage.clear();
  location.reload();
  // let nodes = document.querySelectorAll("body > *")
  // for(let n of nodes){
  //   if (n.id ==="modal-container") continue;
  //   console.log(n.id)
  //   n.classList.remove("veil")
  // }
  // document.getElementById("modal-container").style.display = "none"
});
