function nodeCheckpointLoaderSimple(name) {
  return {
    inputs: {
      ckpt_name: name,
    },
    class_type: 'CheckpointLoaderSimple',
    _meta: {
      title: 'Load Checkpoint',
    },
  };
}

function nodeKSampler(
  seed,
  steps,
  cfg,
  sampler_name,
  model_in,
  positive,
  negative,
  latent_image
) {
  return {
    inputs: {
      seed: seed,
      steps: steps,
      cfg: cfg,
      sampler_name: sampler_name,
      scheduler: 'normal',
      denoise: 1,
      model: [String(model_in), 0],
      positive: [String(positive), 0],
      negative: [String(negative), 0],
      latent_image: [String(latent_image), 0],
    },
    class_type: 'KSampler',
    _meta: {
      title: 'KSampler',
    },
  };
}

function nodeModelSamplingDiscrete(
  sampling,
  model_in
) {
  return {
    inputs: {
      sampling: sampling,
      zsnr:false,
      model: [String(model_in), 0]
    },
    class_type: 'ModelSamplingDiscrete',
    _meta: {
      title: 'ModelSamplingDiscrete',
    },
  };
}

function nodeEmptyLatentImage(width, height, batch_size) {
  return {
    inputs: {
      width: width,
      height: height,
      batch_size: batch_size,
    },
    class_type: 'EmptyLatentImage',
    _meta: {
      title: 'Empty Latent Image',
    },
  };
}

function nodeCLIPTextEncode(prompt, model_in) {
  return {
    inputs: {
      text: prompt,
      clip: [String(1), 1],
    },
    class_type: 'CLIPTextEncode',
    _meta: {
      title: 'CLIP Text Encode (Prompt)',
    },
  };
}

function nodeVAEDecode(model_in, samples_in) {
  return {
    inputs: {
      samples: [String(samples_in), 0],
      vae: [String(1), 2],
    },
    class_type: 'VAEDecode',
    _meta: {
      title: 'VAE Decode',
    },
  };
}

function nodeSaveImage(filename_prefix, images_in) {
  return {
    inputs: {
      filename_prefix: filename_prefix,
      images: [String(images_in), 0],
    },
    class_type: 'SaveImage',
    _meta: {
      title: 'Save Image',
    },
  };
}

function nodeGLIGENLoader(gligen_name) {
  return {
    inputs: {
      gligen_name: gligen_name,
    },
    class_type: 'GLIGENLoader',
    _meta: {
      title: 'GLIGENLoader',
    },
  };
}



function nodeGligenTextboxApply(
  prompt,
  width,
  height,
  x,
  y,
  conditioning_in,
  model_in,
  gligentextboxmodel_in
) {
  return {
    inputs: {
      text: prompt,
      width: width,
      height: height,
      x: x,
      y: y,
      conditioning_to: [String(conditioning_in), 0],
      clip: [String(1), 1],
      gligen_textbox_model: [String(gligentextboxmodel_in), 0],
    },
    class_type: 'GLIGENTextBoxApply',
    _meta: {
      title: 'GLIGENTextBoxApply',
    },
  };
}

function nodeLoraLoaderModelOnly(name, strength, model_in) {
  // return {
  //   inputs: {
  //     lora_name: name,
  //     strength_model: strength,
  //     model: [String(model_in), 0],
  //   },
  //   class_type: 'LoraLoaderModelOnly',
  //   _meta: {
  //     title: 'LoraLoaderModelOnly',
  //   },
  // };

  return {
    inputs: {
      lora_name: name,
      strength_model: strength,
      strength_clip: strength,
      model: ['1', 0],
      clip: [String(model_in), 1],
    },
    class_type: 'LoraLoader',
    _meta: {
      title: 'Load LoRA',
    },
  };
}

var fig = {
  x: null,
  y: null,
  width: null,
  height: null,
  mbDown: false,
  currColor: null,
  boxMap: null,
};

var colorSet = new Set([
  '#00ffff',
  '#00bfff',
  '#0000ff',
  '#a020f0',
  '#adff2f',
  '#b03060',
  '#ff0000',
  '#00ff00',
  '#00ff7f',
  '#dc143c',
  '#ff1493',
  '#7b68ee',
  '#ee82ee',
  '#ffdead',
  '#ffb6c1',
  '#1e90ff',
  '#fa8072',
  '#ffff54',
  '#90ee90',
  '#add8e6',
  '#008b8b',
  '#000080',
  '#daa520',
  '#8fbc8f',
  '#800080',
  '#696969',
  '#556b2f',
  '#8b4513',
  '#228b22',
  '#483d8b',
]);

var iteratorColors = colorSet.values();

const State = {
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
    setMap('selected_loras', val);
  },
  get selected_loras() {
    return getMap('selected_loras') || new Map();
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
};

// State.selected_loras = new Map();

function getSeed() {
  let arr = new Uint32Array(2);
  window.crypto.getRandomValues(arr);
  return String(BigInt(arr[0]) + (BigInt(arr[1]) << BigInt(32)));
}

function postInputArgs() {
  let tags = new Array();
  fig.boxMap.forEach((box, box_id, map) => {
    if (box.prompt) tags.push(box.prompt);
  });
  tags = tags.join(';');
  let positive_prompt = `${State.positive_conditioning.replace(
    /[\s;]+$/g,
    ''
  )};${tags}`;

  requestPOST(
    '/input_args',
    {
      positive_prompt: positive_prompt,
      boxes: Array.from(fig.boxMap),
    },
    (endpoint, response) => {
      console.log(response);
    }
  );
}

function buildPrompt() {
  if (State.seed_mode === 'random') {
    State.seed = getSeed();
    document.getElementById('seed').value = State.seed;
  }
  let seed = State.seed;
  prompt = {};
  let idx = 1;
  // let
  let modelID = 1;
  prompt[String(idx)] = nodeCheckpointLoaderSimple(State.checkpoint_name);
  console.log(State.selected_loras.size);
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
  if (State.sampler_name == "lcm") {
    idx += 1;
    prompt[String(idx)] = nodeModelSamplingDiscrete(
      "lcm",
      String(idx - 1)
    );
    modelID = idx;
  }
  idx += 1;
  prompt[String(idx)] = nodeGLIGENLoader(
    'gligen_sd14_textbox_pruned.safetensors'
  );
  let GLIGENLoaderID = idx;

  idx += 1;
  let bpCLIPTextEncode = idx;

  let tags = new Array();
  fig.boxMap.forEach((box, box_id, map) => {
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

  tags = tags.join(';');
  let positive_prompt = `${State.positive_conditioning.replace(
    /[\s;]+$/g,
    ''
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
  prompt[String(latentID)] = nodeEmptyLatentImage(512, 512, 1);

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
  prompt[String(saveimageID)] = nodeSaveImage('gligen/image', vaedecodeID);
  State.output_image_node = saveimageID;
  return prompt;
}

function requestGET(endpoint, handler) {
  fetch(endpoint, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((response) => response.json())
    .then((data) => {
      // console.log('get data response:', data)
      // handleGetResponse(endpoint, data);
      handler(endpoint, data);
    });
}

function requestPOST(endpoint, data, handler) {
  fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((data) => {
      // console.log('get data response:', data)
      // handleGetResponse(endpoint, data);
      handler(endpoint, data);
    });
}

function getImage(endpoint) {
  fetch(endpoint)
    .then((response) => response.blob())
    .then((blob) => {
      var img = new Image();
      img.onload = function () {
        let canvas = document.getElementById('canvas_image');
        let ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
      };
      img.src = URL.createObjectURL(blob);
    })
    .catch((error) => console.error('Error:', error));
}

function initWebSocket() {
  const socket = new WebSocket('ws://127.0.0.1:8188/ws?clientId=1122');

  socket.addEventListener('open', (event) => {});
  var flag = false;
  socket.addEventListener('message', (event) => {
    try {
      let parsed = JSON.parse(event.data);
      if (parsed.type === 'progress') {
        let progress = Math.round((100 * parsed.data.value) / parsed.data.max);
        document.getElementById('progress-bar').style.width = `${progress}%`;
      } else if (parsed.type === 'status' && !parsed.data.sid) {
        if (parsed.data.status.exec_info.queue_remaining === 0) {
          requestGET('/history', (endpoint, response) => {
            if (State.prompt_id) {
              let pid = response[State.prompt_id];
              let images = pid.outputs[State.output_image_node].images;
              //console.log("Images", images);
              images.forEach((image) => {
                let img_url = `/view?filename=${image.filename}&subfolder=${image.subfolder}&type=${image.type}`;
                //console.log(img_url);
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
  let pb = document.getElementById('progress-bar');
  // pb.classList.remove('progress-bar-animate');
  pb.style.width = '0%';
  // pb.classList.add('progress-bar-animate');

  let prompt = buildPrompt();
  // let prompt = dummy
  initWebSocket();
  requestPOST(
    '/prompt',
    { prompt: prompt, client_id: '1122' },
    (endpoint, response) => {
      if (response.error) {
        addToast(
          '<u>Error!</u>',
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
        addToast('Success!', 'The prompt was queued succesfully.');
        State.prompt_id = response.prompt_id;
        console.log('prompt_id = ', State.prompt_id);
      }
    }
  );
}

function getFilename(filepath) {
  // console.log(filepath.split('\\'));
  return filepath.split('\\').pop();
}

// Loads the list of checkpoints and populates the dropdown
function loadCheckpointList() {
  requestGET('/object_info/CheckpointLoaderSimple', (endpoint, data) => {
    let checkpoint_list =
      data.CheckpointLoaderSimple.input.required.ckpt_name[0];
    State.checkpoint_list = checkpoint_list;
    let checkpoint_dropdown = document.getElementById('checkpoint');
    let checkpoint_select = document.createElement('select');
    checkpoint_dropdown.appendChild(checkpoint_select);
    let option;

    option = document.createElement('option');
    //<option disabled selected value> -- select an option -- </option>
    option.disabled = true;
    option.selected = true;
    option.innerHTML = '-- select a checkpoint --';
    checkpoint_select.appendChild(option);
    checkpoint_list.forEach((checkpoint_name) => {
      option = document.createElement('option');
      option.title = checkpoint_name;
      option.value = checkpoint_name;
      option.innerHTML = checkpoint_name;
      checkpoint_select.appendChild(option);
    });
    checkpoint_select.addEventListener('change', (event) => {
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
  requestGET('/object_info/KSampler', (endpoint, data) => {
    let sampler_list = data.KSampler.input.required.sampler_name[0];
    State.sampler_list = sampler_list;
    let sampler_dropdown = document.getElementById('sampler');
    let sampler_select = document.createElement('select');
    sampler_dropdown.appendChild(sampler_select);
    let option;
    sampler_list.forEach((sampler_name) => {
      option = document.createElement('option');
      option.title = sampler_name;
      option.value = sampler_name;
      option.innerHTML = sampler_name;
      sampler_select.appendChild(option);
    });
    sampler_select.addEventListener('change', (event) => {
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

function loadLoraList() {
  requestGET('/object_info/LoraLoaderModelOnly', (endpoint, data) => {
    // console.log(data);
    let lora_list = data.LoraLoaderModelOnly.input.required.lora_name[0];
    // console.log(lora_list);
    State.complete_lora_list = lora_list;
  });
}

function deleteLora(event) {
  let uuid = extractUUID(event.target.id);
  let x = getMap('selected_loras');
  x.delete(uuid);
  setMap('selected_loras', x);
  //  console.log("now", x)
  //  State.selected_loras = State.selected_loras;
  event.target.parentNode.parentNode.remove();
}

function extractUUID(fullid) {
  return fullid.split('-')[1];
}

function showLoraDropdown(event) {
  event.target.nextSibling.style.display = 'inline-block';
  // event.stopPropagation();
}

function hideLoraDropdown(event) {
  let el = event.target;
  // el.classList.add('animate__animated', 'animate__fadeOut');

  // el.addEventListener('animationend', () => {
  //   el.classList.remove('animate__animated', 'animate__fadeOut');
  // });
  event.target.style.display = 'none';

  // event.stopPropagation();
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

function keepOpen(event) {
  event.target.parentNode.style.display = 'inline-block';
  event.stopImmediatePropagation();
}

function selectLora(event) {
  event.stopPropagation();
  let ddTarget = event.target.parentNode.previousSibling;
  let loraName = event.target.title;
  let loraStrengthInput = event.target.parentNode.parentNode.nextSibling;
  ddTarget.innerHTML = getFilename(loraName);
  ddTarget.title = loraName;
  State.selected_loras = State.selected_loras.set(
    extractUUID(loraStrengthInput.id),
    [loraName, loraStrengthInput.value]
  );
  let ddContent = ddTarget.nextSibling;
  ddContent.style.display = 'none';
  console.log(State.selected_loras);
  // State.selected_loras = State.selected_loras
  // setMap('selected_loras', State.selected_loras)
}

function addLora(event, uuid = null) {
  uuid = uuid || String(Date.now());

  container = document.getElementById('lora-list');

  grid = document.createElement('div');
  grid.classList.add('lora-selector-grid');
  grid.id = `loragrid-${uuid}`;

  select = document.createElement('select');
  select.classList.add('dropdown');
  select.id = `loraselect-${uuid}`;
  // console.log('lookup', State.selected_loras.get(uuid));

  grid.appendChild(select);

  lora_strength = document.createElement('input');
  lora_strength.classList.add('lora-strength');
  lora_strength.type = 'number';
  lora_strength.step = '0.1';
  lora_strength.min = '-20';
  lora_strength.max = '20';
  try {
    lora_strength.value = State.selected_loras.get(uuid)[1];
  } catch {
    lora_strength.value = '1.0';
  }
  lora_strength.placeholder = '1.0';
  lora_strength.id = `lorastrength-${uuid}`;

  grid.appendChild(lora_strength);

  delete_button = document.createElement('div');
  delete_button.classList.add('icon-button');

  icon = document.createElement('img');
  icon.src = '/static/delete.svg';
  icon.id = `loradeleteicon-${uuid}`;
  delete_button.appendChild(icon);

  icon.addEventListener('click', deleteLora);

  grid.appendChild(delete_button);

  container.appendChild(grid);

  document.getElementById('phantom-space').classList.add('vertical-spacer');

  // console.log(State.complete_lora_list);
  let option;
  State.complete_lora_list.forEach((lora_name) => {
    option = document.createElement('option');
    option.title = lora_name;
    option.value = lora_name;
    option.innerHTML = lora_name;
    select.appendChild(option);
    // dropdown_option.addEventListener('mouseleave', (event) => {
    //   dd_content.style.display = 'none';
    // });
  });

  try {
    select.value = State.selected_loras.get(uuid)[0];
  } catch {}

  lora_strength.addEventListener('input', updateLoraStrength);
  let lora_strength_val = parseFloat(lora_strength.value);
  let lora_name = select.value;
  console.log(lora_name, lora_strength_val); 
  let temp = getMap('selected_loras');
  temp.set(extractUUID(select.id), [lora_name, lora_strength_val]);
  setMap('selected_loras', temp);
  State.selected_loras = temp;
  console.log(State.selected_loras.size);
  select.addEventListener('change', (event) => {
    let lora_name = event.target.value;
    let lora_strength = event.target.nextSibling.value;
    console.log(lora_name, lora_strength);
    let temp = getMap('selected_loras');
    temp.set(extractUUID(event.target.id), [lora_name, lora_strength]);
    setMap('selected_loras', temp);
    State.selected_loras = temp;
    console.log(State.selected_loras.size);
  });
}

// Sets the canvas size
function setCanvasSize(val) {
  // document.getElementById(
  //   'canvas-column'
  // ).style.minWidth = `calc(1.5rem + ${val}px + 6px`
  ['canvas_image', 'canvas_main', 'canvas_temp'].forEach((canvas_name) => {
    let c = document.getElementById(canvas_name);
    let ctx = c.getContext('2d');
    c.width = val;
    c.height = val;
    ctx.font = `bold ${22 * (val / 512)}px courier`;
    ctx.lineWidth = 4 * (val / 512);
  });
  let sf = val / val;

  // rectangles.forEach((rectangle, id, map) => {
  //   if (val !== state.canvas_size) {
  //     rectangle.x = rectangle.x * sf
  //     rectangle.y = rectangle.y * sf
  //     rectangle.width = rectangle.width * sf
  //     rectangle.height = rectangle.height * sf
  //   }
  //   let row = document.getElementById(`row-${id}`)
  //   row.childNodes[2].innerHTML = rectangle.x
  //   row.childNodes[3].innerHTML = rectangle.y
  //   row.childNodes[4].innerHTML = `${rectangle.width} × ${rectangle.height}`
  // })
  // state.canvas_size = val
  // saveRectangles()
  // saveState()
  // clearMainCanvas()
  // drawAllRectangles()
}

// Retrieves the map with the given name from local storage
function getMap(name) {
  return new Map(JSON.parse(localStorage.getItem(name)));
}

// Writes the given man to local storage by flattening it first
function setMap(name, m) {
  localStorage.setItem(name, JSON.stringify(Array.from(m)));
}

// Adds an animation to the element with the given id
const animateCSS = (element_id, animation, prefix = 'animate__') =>
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
      resolve('Animation ended');
    }
    node.addEventListener('animationend', handleAnimationEnd, { once: true });
  });

// Adds an animation to all the elements that have the given class name
const animateCSSBatch = (class_name, animation, prefix = 'animate__') =>
  // We create a Promise and return it
  new Promise((resolve, reject) => {
    const animationSpeed = `animate__faster`;
    const animationName = `${prefix}${animation}`;
    const nodes = document.getElementsByClassName(class_name);
    Array.from(nodes).forEach((node) => {
      node.classList.add(`${prefix}animated`, animationName, animationSpeed);

      // When the animation ends, we clean the classes and resolve the Promise
      function handleAnimationEnd(event) {
        event.stopPropagation();
        node.classList.remove(
          `${prefix}animated`,
          animationName,
          animationSpeed
        );
        resolve('Animation ended');
      }
      node.addEventListener('animationend', handleAnimationEnd, { once: true });
    });
  });

// Adds the given box to the table of grounding boxes
function addTableRow(box, box_id, map) {
  let table = document.getElementById('grounding-boxes');

  let row_id = `row-${box_id}`;
  let new_row = document.createElement('div');
  new_row.classList.add('grounding-boxes-grid');
  new_row.id = row_id;

  let col_prompt_input = document.createElement('div');
  col_prompt_input.classList.add('col-prompt-input');

  let prompt_input = document.createElement('input');
  prompt_input.id = 'input-' + box_id;
  prompt_input.setAttribute('type', 'text');
  prompt_input.value = box.prompt;
  prompt_input.placeholder = `${box.width} × ${box.height}`;
  col_prompt_input.appendChild(prompt_input);
  new_row.appendChild(col_prompt_input);

  // Add event handler to update the text on the canvas to reflect
  // the entered prompt
  prompt_input.addEventListener('input', (event) => {
    box.prompt = event.target.value;
    clearCanvas('canvas_main');
    drawBoxes();
    setMap('boxes', fig.boxMap);
  });

  // Create a column for the box's x and y co-ordinates
  let col_xy = document.createElement('div');
  col_xy.classList.add('col-numbers');
  col_xy.innerHTML = `${box.x}, ${box.y}`;
  new_row.appendChild(col_xy);

  // Create a column for the box's width and height
  let col_dims = document.createElement('div');
  col_dims.classList.add('col-numbers');
  col_dims.innerHTML = `${box.width}<span style="opacity:0.5;">&nbsp;×&nbsp;</span>${box.height}`;
  new_row.appendChild(col_dims);

  // Create a column for the delete box button
  let col_delete = document.createElement('div');
  col_delete.classList.add('icon-button');
  let delete_button_image = document.createElement('img');
  delete_button_image.src = '/static/delete.svg';
  col_delete.appendChild(delete_button_image);
  new_row.appendChild(col_delete);

  // Add event handler for the delete button
  delete_button_image.addEventListener('click', (event) => {
    deleteRow(box_id);
    deleteBox(box, box_id);
  });
  delete_button_image.title = 'Delete this grounding box';

  // Create a column for the toggle visibility button
  let col_eye = document.createElement('div');
  col_eye.classList.add('icon-button');
  let eye_button_image = document.createElement('img');
  eye_button_image.id = `eye-button-${box_id}`;
  if (box.hide === false) {
    eye_button_image.src = '/static/eye-on.svg';
    eye_button_image.title = 'Hide this grounding box';
  } else if (box.hide === true) {
    eye_button_image.src = '/static/eye-off.svg';
    eye_button_image.style.opacity = '0.5';
    eye_button_image.title = 'Show this grounding box';
  }
  col_eye.appendChild(eye_button_image);

  new_row.appendChild(col_eye);

  table.append(new_row);
  // Add event handler for the toggle visibility button
  eye_button_image.addEventListener('click', (event) => {
    if (box.hide === false) {
      box.hide = true;
      eye_button_image.src = '/static/eye-off.svg';
      eye_button_image.style.opacity = '0.5';
      eye_button_image.title = 'Show this grounding box';
    } else {
      box.hide = false;
      eye_button_image.src = '/static/eye-on.svg';
      eye_button_image.style.opacity = '1';
      eye_button_image.title = 'Hide this grounding box';
    }
    clearCanvas('canvas_main');
    drawBoxes();
    setMap('boxes', fig.boxMap);
  });

  animateCSS(row_id, 'fadeIn');
  // new_row.classList.add('enter-animation');
  prompt_input.focus();
  return new_row;
}

function deleteRow(box_id) {
  let row_id = `row-${box_id}`;
  let row = document.getElementById(row_id);
  row.classList.add('leave-animation');
  row.addEventListener('animationend', () => {
    row.remove();
  });
}

// Deletes the given box
function deleteBox(box, box_id) {
  colorSet.add(fig.boxMap.get(box_id).color);
  fig.boxMap.delete(box_id);
  clearCanvas('canvas_main');
  drawBoxes();
  setMap('boxes', fig.boxMap);
}

// Adds the given box to the box map
function addBox(id, box) {
  fig.boxMap.set(id, box);
  setMap('boxes', fig.boxMap);
}

// Creates and returns a new box and box id
function newBox(x, y, width, height) {
  let new_id = crypto.randomUUID();
  let new_box = {
    x: x,
    y: y,
    width: width,
    height: height,
    color: fig.currColor,
    prompt: '',
    hide: false,
  };
  return { id: new_id, box: new_box };
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
  ctx.fillStyle = '#fefefa';
  ctx.fillRect(x - 4, y - 4, text_metrics.width + 6, height + 6);
  ctx.fillStyle = '#ff1493';
  ctx.fillText(text, x, y + height);
}

// Draws all the boxes
// TODO: Make this reusable
function drawBoxes() {
  fig.boxMap.forEach((box, box_id, map) => {
    drawBox(box, 'canvas_main');
  });
}

// Draws a box object on the canvas with the given canvas_id
function drawBox(box, canvas_id) {
  if (box.hide === true) {
    return;
  }
  let canvas = document.getElementById(canvas_id);
  let ctx = canvas.getContext('2d');
  ctx.strokeStyle = box.color || fig.currColor;
  ctx.strokeRect(box.x, box.y, box.width, box.height);
  if (!box.prompt) {
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
  let ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 512, 512);
}

// Handles the mouse movement and clicking events for drawing the rectangles
function handleMouseEvent(event, mouse_event) {
  if (fig.boxMap.size >= 30) {
    return;
  }
  let mouse_pos = getMousePos(event);

  mouse_pos.x = Math.floor(mouse_pos.x / 8 + 0.5) * 8;
  mouse_pos.y = Math.floor(mouse_pos.y / 8 + 0.5) * 8;
  switch (mouse_event) {
    case 'mousedown':
      console.log(event);

      if (fig.mbDown === false) {
        fig.mbDown = true;
        fig.x = mouse_pos.x;
        fig.y = mouse_pos.y;
        fig.currColor = iteratorColors.next().value;
        colorSet.delete(fig.currColor);
      }
      break;
    case 'mouseup':
      if (fig.mbDown === true) {
        fig.mbDown = false;
        fig.width = mouse_pos.x - fig.x;
        fig.height = mouse_pos.y - fig.y;
        if (fig.width < 0) {
          fig.width = fig.x - mouse_pos.x;
          fig.x = mouse_pos.x;
        }
        if (fig.height < 0) {
          fig.height = fig.y - mouse_pos.y;
          fig.y = mouse_pos.y;
        }
        if (Math.abs(fig.width) >= 8 && Math.abs(fig.height) >= 8) {
          clearCanvas('canvas_temp');
          let new_box = newBox(fig.x, fig.y, fig.width, fig.height);
          addBox(new_box.id, new_box.box);
          drawBox(new_box.box, 'canvas_main');
          let new_row = addTableRow(new_box.box, new_box.id);
          new_row.classList.add('enter-animation');
          new_row.addEventListener('animationend', () => {
            new_row.classList.remove('enter-animation');
          });
        } else {
          colorSet.add(fig.currColor);
        }
        fig.x = null;
        fig.y = null;
      }
      break;
    case 'mousemove':
      // let el = document.getElementById('mouse-pos-id');
      // el.innerHTML = `(${String(mouse_pos.x)},${String(mouse_pos.y)})`;
      if (fig.mbDown === true) {
        fig.width = mouse_pos.x - fig.x;
        fig.height = mouse_pos.y - fig.y;

        // if (fig.width < 0) {
        //   fig.width = fig.x - mouse_pos.x;
        //   fig.x = mouse_pos.x;
        // }
        // if (fig.height < 0) {
        //   fig.height = fig.y - mouse_pos.y;
        //   fig.y = mouse_pos.y;
        // }
        if (Math.abs(fig.width) >= 8 && Math.abs(fig.height) >= 8) {
          clearCanvas('canvas_temp');
          drawBox(
            {
              x: fig.x,
              y: fig.y,
              width: fig.width,
              height: fig.height,
            },
            'canvas_temp'
          );
        }
        // drawTemporaryRectangle(x, y, width, height);
      }
      break;
  }
}

// Returns the co-ordinates of the mouse
function getMousePos(event) {
  let canvas_temp = document.getElementById('canvas_temp');
  let ctx_temp = canvas_temp.getContext('2d');
  var rect = canvas_temp.getBoundingClientRect();
  var scaleX = canvas_temp.width / rect.width;
  var scaleY = canvas_temp.height / rect.height;
  return {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY,
  };
}

var toast_id = 0;
function addToast(header, body, is_error = false, timeout = 5000) {
  toast_container = document.getElementById('toast-container');

  let new_toast = document.createElement('div');
  new_toast.id = `toast-${toast_id}`;
  new_toast.classList.add('toast');
  if (is_error) {
    new_toast.classList.add('toast--error');
  }

  let toast_header_row = document.createElement('div');
  toast_header_row.classList.add('toast-header-row');

  let toast_header = document.createElement('div');
  toast_header.classList.add('toast-header');
  toast_header.innerHTML = header;

  let toast_close_button = document.createElement('button');
  toast_close_button.classList.add('toast-close-button');
  toast_close_button.innerHTML = '🗙';
  toast_close_button.addEventListener('click', (event) => {
    // new_toast.classList.add('toast-leave-animation');
    new_toast.style.marginBottom = `-${new_toast.offsetHeight + 12}px`;
    new_toast.style.opacity = `0`;
    new_toast.style.transform = `translateX(512px)`;

    new_toast.addEventListener('transitionend', () => {
      new_toast.remove();
    });
  });

  let toast_body = document.createElement('p');
  toast_body.innerHTML = body;

  toast_header_row.appendChild(toast_header);
  toast_header_row.appendChild(toast_close_button);
  new_toast.append(toast_header_row);
  new_toast.append(toast_body);

  toast_container.prepend(new_toast);
  animateCSS(new_toast.id, 'slideInRight');
  toast_id += 1;
  if (timeout > 0) {
    setTimeout(() => toast_close_button.click(), timeout);
  }
}
var idx = 0;
function testToast() {
  addToast(`toast #${idx}`, 'The prompt<br>sdfsdf<br> was queued succesfully!');
  idx += 1;
}

function handleImage(e) {
  var canvas = document.getElementById('canvas_image');
  var ctx = canvas.getContext('2d');
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
  let reuseSeed = document.getElementById('reuse-seed');
  let randomSeed = document.getElementById('random-seed');
  if (State.seed_mode === 'reuse') {
    reuseSeed.classList.add('icon-button--selected');
    randomSeed.classList.remove('icon-button--selected');
    reuseSeed.getElementsByTagName('img')[0].src = '/static/recycle-active.svg';
    randomSeed.getElementsByTagName('img')[0].src = '/static/dice.svg';
  } else {
    State.seed_mode = 'random';
    randomSeed.classList.add('icon-button--selected');
    reuseSeed.classList.remove('icon-button--selected');
    randomSeed.getElementsByTagName('img')[0].src = '/static/dice-active.svg';
    reuseSeed.getElementsByTagName('img')[0].src = '/static/recycle.svg';
  }
}

function downloadImage() {
  const canvas_image = document.getElementById('canvas_image');
  const canvas_main = document.getElementById('canvas_main');
  const canvas_final = document.createElement('canvas');
  const ctx_image = canvas_image.getContext('2d');
  const ctx_main = canvas_main.getContext('2d');
  const ctx_final = canvas_final.getContext('2d');
  canvas_final.width = 512;
  canvas_final.height = 512;
  ctx_final.drawImage(canvas_image, 0, 0);
  ctx_final.drawImage(canvas_main, 0, 0);
  const image = canvas_final.toDataURL('image/png');
  const link = document.createElement('a');
  link.href = image;
  link.download = `${Date.now()}.png`;
  link.click();
}

window.addEventListener('load', () => {
  // getCheckpointList();

  if (!State.seed) {
    State.seed = getSeed();
  }
  if (!State.seed_mode) {
    State.seed_mode = 'random';
  }
  console.log('Seed Mode: ', State.seed_mode);
  document.getElementById('reuse-seed').addEventListener('click', () => {
    State.seed_mode = 'reuse';
    updateSeedButton();
  });
  document.getElementById('random-seed').addEventListener('click', () => {
    State.seed_mode = 'random';
    updateSeedButton();
    State.seed = getSeed();
    document.getElementById('seed').value = State.seed;
  });

  updateSeedButton();
  document.getElementById('seed').value = State.seed;

  document.getElementById('seed').addEventListener('input', (event) => {
    State.seed = event.target.value;
    console.log('Seed edited');
  });

  loadCheckpointList();
  loadSamplerList();
  loadLoraList();
  State.selected_loras.forEach((value, key) => {
    // console.log(key, value);
    addLora(null, key);
  });

  // console.log(fig.boxMap);
  setCanvasSize(512);

  document.getElementById('fileInput').addEventListener('change', handleImage);

  fig.boxMap = getMap('boxes') || new Map();
  if (fig.boxMap.size > 0) {
    fig.boxMap.forEach((box, box_id, map) => {
      drawBox(box, 'canvas_main');
      addTableRow(box, box_id, map);
    });
  }

  let steps_input = document.getElementById('steps');
  State.steps = State.steps || 30;
  steps_input.value = State.steps;
  steps_input.addEventListener('input', (event) => {
    State.steps = event.target.value;
  });

  let cfg_input = document.getElementById('cfg');
  State.cfg = State.cfg || '8.0';
  cfg_input.value = State.cfg;
  cfg_input.addEventListener('input', (event) => {
    State.cfg = event.target.value;
  });

  let positive_conditioning = document.getElementById('positive-conditioning');
  State.positive_conditioning =
    State.positive_conditioning ||
    '(4k, best quality, masterpiece:1.2), ultra high res, ultra detailed';
  positive_conditioning.value = State.positive_conditioning;
  State.positive_conditioning;
  positive_conditioning.addEventListener('input', (event) => {
    State.positive_conditioning = event.target.value;
  });

  let negative_conditioning = document.getElementById('negative-conditioning');
  State.negative_conditioning =
    State.negative_conditioning || 'watermark, text, blurry';
  negative_conditioning.value = State.negative_conditioning;
  negative_conditioning.addEventListener('input', (event) => {
    State.negative_conditioning = event.target.value;
  });

  console.log(document.getElementById('sampler').value)

  document.getElementById('add-lora').addEventListener('click', addLora);

  document.getElementById('show-all').addEventListener('click', (event) => {
    let icon_button_eye;
    fig.boxMap.forEach((box, box_id, map) => {
      box.hide = false;
      icon_button_eye = document.getElementById(`eye-button-${box_id}`);
      icon_button_eye.src = '/static/eye-on.svg';
      icon_button_eye.style.opacity = '1';
    });
    clearCanvas('canvas_main');
    drawBoxes();
    setMap('boxes', fig.boxMap);
  });

  document.getElementById('hide-all').addEventListener('click', (event) => {
    let icon_button_eye;
    fig.boxMap.forEach((box, box_id, map) => {
      box.hide = true;
      icon_button_eye = document.getElementById(`eye-button-${box_id}`);
      icon_button_eye.src = '/static/eye-off.svg';
      icon_button_eye.style.opacity = '0.5';
    });
    clearCanvas('canvas_main');
    setMap('boxes', fig.boxMap);
  });

  document.getElementById('delete-all').addEventListener('click', (event) => {
    fig.boxMap.forEach((box, box_id, map) => {
      colorSet.add(fig.boxMap.get(box_id).color);
      deleteRow(box_id);
      fig.boxMap.delete(box_id);
    });
    clearCanvas('canvas_main');
    drawBoxes();
    setMap('boxes', fig.boxMap);
  });

  let canvas_temp = document.getElementById('canvas_temp');
  canvas_temp.addEventListener('mousedown', (event) =>
    handleMouseEvent(event, 'mousedown')
  );
  canvas_temp.addEventListener('mouseup', (event) =>
    handleMouseEvent(event, 'mouseup')
  );
  canvas_temp.addEventListener('mousemove', (event) =>
    handleMouseEvent(event, 'mousemove')
  );
});
