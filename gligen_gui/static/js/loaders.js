function loadSeed() {
  globalState.seedValue = globalState.seedValue || getSeed();
  globalState.seedMode = globalState.seedMode || "random";
  document.getElementById("seed").value = globalState.seedValue;

  function updateSeedModeIcons() {
    if (globalState.seedMode === "random") {
      document.getElementById("reuse-icon").classList.add("icon-white");
      document.getElementById("random-icon").classList.remove("icon-white");
      document.getElementById("seed-mode-toggle").checked = false;
    } else {
      document.getElementById("random-icon").classList.add("icon-white");
      document.getElementById("reuse-icon").classList.remove("icon-white");
      document.getElementById("seed-mode-toggle").checked = true;
    }
    globalState.saveToLocalStorage();
  }

  updateSeedModeIcons();

  document.getElementById("seed-mode-toggle").addEventListener("click", (e) => {
    if (globalState.seedMode === "reuse") {
      globalState.seedMode = "random";
    } else {
      globalState.seedMode = "reuse";
    }
    updateSeedModeIcons();
  });

  globalState.addEventListener("seedValue", (value) => {
    document.getElementById("seed").value = value;
  });

  globalState.addEventListener("seedMode", (value) => {
    document.getElementById("seed").value = globalState.seedValue;
    updateSeedModeIcons();
  });
}

// Loads the list of checkpoints
function loadCheckpointList() {
  requestGET("/object_info/CheckpointLoaderSimple", (endpoint, data) => {
    let checkpointList =
      data.CheckpointLoaderSimple.input.required.ckpt_name[0];
    globalState.checkpointList = checkpointList;
    let checkpointSelect = document.getElementById("checkpoint");
    let select = document.createElement("select");
    checkpointSelect.appendChild(select);

    let option;
    option = document.createElement("option");
    option.disabled = true;
    option.selected = true;
    option.innerHTML = "— select a checkpoint —";
    option.value = "— select a checkpoint —";
    select.appendChild(option);

    checkpointList.forEach((checkpointName) => {
      option = document.createElement("option");
      if (checkpointName === globalState.checkpointName) {
        option.selected = true;
      }
      option.title = checkpointName;
      option.value = checkpointName;
      option.innerHTML = checkpointName;
      select.appendChild(option);
    });

    select.addEventListener("change", (event) => {
      globalState.checkpointName = select.value;
      globalState.saveToLocalStorage();
    });

    globalState.addEventListener("checkpointName", (value) => {
      if (value) {
        if (globalState.checkpointList.includes(value)) select.value = value;
      } else {
        select.value = "— select a checkpoint —";
      }
    });
  });
}

// Loads the list of checkpoints
function loadVAEList() {
  requestGET("/object_info/VAELoader", (endpoint, data) => {
    let vaeList = data.VAELoader.input.required.vae_name[0];
    globalState.vaeList = vaeList;
    let vaeSelect = document.getElementById("vae");
    let select = document.createElement("select");
    vaeSelect.appendChild(select);

    let option;
    option = document.createElement("option");
    option.disabled = true;
    // option.selected = true;
    option.innerHTML = "— select a vae —";
    option.value = "— select a vae —";
    select.appendChild(option);

    option = document.createElement("option");
    option.innerHTML = "Load VAE From Checkpoint";
    option.value = "fromCheckpoint";
    select.appendChild(option);

    vaeList.forEach((vaeName) => {
      option = document.createElement("option");
      if (vaeName === globalState.vaeName) {
        option.selected = true;
      }
      option.title = vaeName;
      option.value = vaeName;
      option.innerHTML = vaeName;
      select.appendChild(option);
    });
    select.addEventListener("change", (event) => {
      globalState.vaeName = select.value;
      globalState.saveToLocalStorage();
    });

    globalState.addEventListener("vaeName", (value) => {
      if (value) {
        if (globalState.vaeList.includes(value)) select.value = value;
      } else {
        select.value = "— select a vae —";
      }
    });
  });
}

// Loads the list of samplers
function loadKSamplerLists() {
  requestGET("/object_info/KSampler", (endpoint, data) => {
    let select, option;
    let samplerList = data.KSampler.input.required.sampler_name[0];
    globalState.samplerList = samplerList;
    let samplerSelect = document.getElementById("sampler");
    select = document.createElement("select");
    select.id = "samplerSelect";
    samplerSelect.appendChild(select);
    option = document.createElement("option");
    option.disabled = true;
    option.selected = true;
    option.innerHTML = "— select a sampler —";
    option.value = "— select a sampler —";
    select.appendChild(option);
    samplerList.forEach((samplerName) => {
      option = document.createElement("option");
      if (samplerName === globalState.samplerName) {
        option.selected = true;
      }
      option.title = samplerName;
      option.value = samplerName;
      option.innerHTML = samplerName;
      select.appendChild(option);
    });

    select.addEventListener("change", (event) => {
      globalState.samplerName = event.target.value;
      globalState.saveToLocalStorage();
    });

    globalState.addEventListener("samplerName", (value) => {
      let samplerSelect = document.getElementById("samplerSelect");
      if (value) {
        if (globalState.samplerList.includes(value))
          samplerSelect.value = value;
      } else {
        samplerSelect.value = "— select a sampler —";
      }
    });

    let schedulerList = data.KSampler.input.required.scheduler[0];
    globalState.schedulerList = schedulerList;
    let schedulerSelect = document.getElementById("scheduler");
    select = document.createElement("select");
    select.id = "schedulerSelect";
    schedulerSelect.appendChild(select);
    option = document.createElement("option");
    option.disabled = true;
    option.selected = true;
    option.innerHTML = "— select a scheduler —";
    option.value = "— select a scheduler —";
    select.appendChild(option);
    schedulerList.forEach((schedulerName) => {
      option = document.createElement("option");
      if (schedulerName === globalState.schedulerName) {
        option.selected = true;
      }
      option.title = schedulerName;
      option.value = schedulerName;
      option.innerHTML = schedulerName;
      select.appendChild(option);
    });
    select.addEventListener("change", (event) => {
      globalState.schedulerName = event.target.value;
      globalState.saveToLocalStorage();
    });

    globalState.addEventListener("schedulerName", (value) => {
      let schedulerSelect = document.getElementById("schedulerSelect");
      if (value) {
        if (globalState.schedulerList.includes(value))
          schedulerSelect.value = value;
      } else {
        schedulerSelect.value = "— select a scheduler —";
      }
    });
  });
}

// Loads the list of loras
function loadLoraList() {
  requestGET("/object_info/LoraLoaderModelOnly", (endpoint, data) => {
    let loraList = data.LoraLoaderModelOnly.input.required.lora_name[0];
    globalState.loraList = loraList;

    if (globalState.loraMap.size === 0) return;
    globalState.loraMap.forEach((lora, uuid) => {
      console.log(lora);
      let loraName = lora.name;
      let loraStrength = lora.strength;
      addLora(null, uuid, lora.name, lora.strength);
    });
  });
}

function deleteLora(event) {
  // console.log(event.target.parentNode)
  let uuid = extractID(event.target.id);
  // let x = loadMap("selected_loras");
  // x.delete(uuid);
  // setMap("selected_loras", x);

  // let target = event.target.parentNode.parentNode;
  let target = document.getElementById(`loragrid-${uuid}`);
  console.log(target);
  target.classList.add("lora-row-leave-animation");
  target.addEventListener("animationend", (e) => {
    target.remove();
    target.classList.remove("lora-row-leave-animation");
    globalState.loraMap.delete(uuid);
  });
}

function extractID(fullid) {
  return fullid.split("-")[1];
}

function updateLoraStrength(event) {
  let myUUID = extractID(event.target.id);
  if (globalState.loraMap.has(myUUID)) {
    let curr = globalState.loraMap.get(myUUID);
    curr[1] = event.target.value;
    // let loraName = event.target.previousSibling.firstChild.title;
    globalState.loraMap.set(myUUID, curr);
  }
}

function addLora(event, uuid, name, strength) {
  uuid = uuid || String(Date.now());

  container = document.getElementById("lora");

  grid = document.createElement("div");
  grid.classList.add("lora-selector-grid");
  // grid.classList.add("lora-selector-grid-leave");

  grid.id = `loragrid-${uuid}`;

  select = document.createElement("select");
  select.classList.add("dropdown");
  select.id = `loraselect-${uuid}`;
  grid.appendChild(select);

  loraStrength = document.createElement("input");
  loraStrength.classList.add("lora-strength");
  loraStrength.type = "number";
  loraStrength.step = "0.1";
  loraStrength.min = "-20";
  loraStrength.max = "20";
  loraStrength.value = strength || "1.0";
  loraStrength.placeholder = "1.0";
  loraStrength.id = `lorastrength-${uuid}`;

  grid.appendChild(loraStrength);

  loraDeleteButton = document.createElement("div");
  loraDeleteButton.classList.add("icon-button");

  icon = document.createElement("img");
  icon.src = "/static/images/delete.svg";
  icon.id = `loradeleteicon-${uuid}`;
  loraDeleteButton.appendChild(icon);

  icon.addEventListener("click", deleteLora);

  grid.appendChild(loraDeleteButton);

  container.appendChild(grid);
  grid.classList.add("lora-row-enter-animation");
  grid.addEventListener("animationend", (e) => {
    grid.classList.remove("lora-row-enter-animation");
  });
  // grid.classList.remove("lora-selector-grid-leave")

  document.getElementById("phantom-space").classList.add("vertical-spacer");

  let option;
  option = document.createElement("option");
  option.disabled = true;
  option.selected = true;
  option.innerHTML = "-- select a lora --";
  option.value = "-- select a lora --";
  select.appendChild(option);

  globalState.loraList.forEach((loraName) => {
    option = document.createElement("option");
    option.title = loraName;
    option.value = loraName;
    option.innerHTML = loraName;
    select.appendChild(option);
  });

  select.value = name || globalState.loraList[0];
  globalState.loraMap.set(uuid, {
    name: select.value,
    strength: loraStrength.value,
  });

  loraStrength.addEventListener("input", updateLoraStrength);
  select.addEventListener("change", (event) => {
    let loraName = event.target.value;
    let loraStrength = event.target.nextSibling.value;
    globalState.loraMap.set(extractID(event.target.id), {
      name: loraName,
      strength: loraStrength,
    });
    globalState.saveToLocalStorage();
  });
}

// Adds a new row to the Grounding Boxes table for the given box
function addTableRow(box, box_id, map) {
  let table = document.getElementById("grounding-boxes");

  let row_id = `row-${box_id}`;
  let newRow = document.createElement("div");
  newRow.classList.add("grounding-boxes-grid");
  newRow.id = row_id;

  let col_prompt_input = document.createElement("div");
  col_prompt_input.classList.add("col-prompt-input");

  let promptInput = document.createElement("input");
  promptInput.id = `promptInput-${box_id}`;
  promptInput.setAttribute("type", "text");
  promptInput.value = box.caption;
  // promptInput.classList.add("input--tagged");

  promptInput.style.borderRight = `4px solid ${box.color}`;

  promptInput.style.borderLeft = `4px solid ${box.color}`;
  col_prompt_input.appendChild(promptInput);
  newRow.appendChild(col_prompt_input);

  // Add event handler to update the text on the canvas to reflect
  // the entered prompt
  promptInput.addEventListener("input", (event) => {
    box.caption = event.target.value;
    globalState.saveToLocalStorage();
  });

  // Create a column for the box's x and y co-ordinates
  let col_xy = document.createElement("div");
  col_xy.classList.add("col-numbers");
  box.addEventListener("shapeChanged", updatePosition);
  function updatePosition(event) {
    let box = event.shape;
    col_xy.innerHTML = `${box.x}<span style="opacity:0.5;">,</span>${box.y}`;
  }
  updatePosition({ shape: box });
  newRow.appendChild(col_xy);

  // Create a column for the box's width and height
  let col_dims = document.createElement("div");
  col_dims.classList.add("col-numbers");

  function updateDimensions(event) {
    let box = event.shape;
    col_dims.innerHTML = `${box.width}<span style="opacity:0.5;">×</span>${box.height}`;
    // promptInput.placeholder = `${box.width} × ${box.height}`;
  }
  box.addEventListener("shapeChanged", updateDimensions);
  updateDimensions({ shape: box });
  newRow.appendChild(col_dims);

  // Create a column for the delete box button
  let col_delete = document.createElement("div");
  col_delete.classList.add("icon-button");
  let delete_button_image = document.createElement("img");
  delete_button_image.src = "/static/images/delete.svg";
  col_delete.appendChild(delete_button_image);
  newRow.appendChild(col_delete);

  // Add event handler for the delete button
  col_delete.addEventListener("click", (event) => {
    AppSurface.remove(box);
  });

  box.addEventListener("shapeRemoved", (e) => {
    console.log("shape removed");
    deleteRow(box_id);
    globalState.boxMap.delete(box_id);
    globalState.saveToLocalStorage();
  });
  delete_button_image.title = "Delete this grounding box";

  // Create a column for the toggle visibility button
  let col_eye = document.createElement("div");
  col_eye.classList.add("icon-button");
  let eye_button_image = document.createElement("img");
  eye_button_image.id = `eyebutton-${box_id}`;

  function updateEyeIcon(event) {
    let box = event.shape;
    if (box.visible === true) {
      eye_button_image.src = "/static/images/eye-on.svg";
      eye_button_image.style.opacity = "1";
      eye_button_image.title = "Hide this grounding box";
    } else if (box.visible === false) {
      eye_button_image.src = "/static/images/eye-off.svg";
      eye_button_image.style.opacity = "0.5";
      eye_button_image.title = "Show this grounding box";
    }
    globalState.saveToLocalStorage();
  }
  // box.addEventListener("")
  updateEyeIcon({ shape: box });
  col_eye.appendChild(eye_button_image);

  newRow.appendChild(col_eye);

  table.append(newRow);

  // Add event handler for the toggle visibility button
  col_eye.addEventListener("click", (event) => {
    box.toggleVisibility();
    updateEyeIcon({ shape: box });
  });

  box.addEventListener("shapeSelected", (data) => {
    if (!data.shape.visible) return;
    promptInput.focus();
  });

  animateCSS(row_id, "fadeIn");
  promptInput.focus();
  box.addEventListener("shapeChanged", (e) => {
    // console.log(e.shape.id, e.detail)
    // globalState.saveToLocalStorage()
  });

  return newRow;
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
