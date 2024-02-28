function nodeCheckpointLoaderSimple(name) {
  return {
    inputs: {
      ckpt_name: name,
    },
    class_type: "CheckpointLoaderSimple",
    _meta: {
      title: "Load Checkpoint",
    },
  };
}

function nodeVAELoader(vae_name) {
  return {
    inputs: {
      vae_name: vae_name,
    },
    class_type: "VAELoader",
    _meta: {
      title: "Load VAE",
    },
  };
}

function nodeKSampler(
  seed,
  steps,
  cfg,
  sampler_name,
  scheduler_name,
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
      scheduler: scheduler_name,
      denoise: 1,
      model: [String(model_in), 0],
      positive: [String(positive), 0],
      negative: [String(negative), 0],
      latent_image: [String(latent_image), 0],
    },
    class_type: "KSampler",
    _meta: {
      title: "KSampler",
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
    class_type: "EmptyLatentImage",
    _meta: {
      title: "Empty Latent Image",
    },
  };
}

function nodeCLIPTextEncode(prompt, model_in) {
  return {
    inputs: {
      text: prompt,
      clip: [String(model_in), 1],
    },
    class_type: "CLIPTextEncode",
    _meta: {
      title: "CLIP Text Encode (Prompt)",
    },
  };
}

function nodeVAEDecode(model_in, slot_num, samples_in) {
  return {
    inputs: {
      samples: [String(samples_in), 0],
      vae: [String(model_in), slot_num],
    },
    class_type: "VAEDecode",
    _meta: {
      title: "VAE Decode",
    },
  };
}

function nodeSaveImage(filename_prefix, images_in) {
  return {
    inputs: {
      filename_prefix: filename_prefix,
      images: [String(images_in), 0],
    },
    class_type: "SaveImage",
    _meta: {
      title: "Save Image",
    },
  };
}

function nodeGLIGENLoader(gligen_name) {
  return {
    inputs: {
      gligen_name: gligen_name,
    },
    class_type: "GLIGENLoader",
    _meta: {
      title: "GLIGENLoader",
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
      clip: [String(model_in), 1],
      gligen_textbox_model: [String(gligentextboxmodel_in), 0],
    },
    class_type: "GLIGENTextBoxApply",
    _meta: {
      title: "GLIGENTextBoxApply",
    },
  };
}

function nodeLoraLoader(name, strength, model_in) {
  return {
    inputs: {
      lora_name: name,
      strength_model: strength,
      strength_clip: strength,
      model: [String(model_in), 0],
      clip: [String(model_in), 1],
    },
    class_type: "LoraLoader",
    _meta: {
      title: "Load LoRA",
    },
  };
}

function buildPrompt() {
  if (globalState.seedMode === "random") {
    globalState.seedValue = getSeed();
    document.getElementById("seed").value = globalState.seedValue;
  }
  let seed = globalState.seedValue;
  prompt = {};
  let idx = 1;

  let modelID = 1;
  prompt[String(idx)] = nodeCheckpointLoaderSimple(globalState.checkpointName);
  if (globalState.loraMap.size > 0) {
    console.log(globalState.loraMap);
    globalState.loraMap.forEach((lora, key) => {
      console.log(lora.name, lora.strength);
      idx += 1;
      prompt[String(idx)] = nodeLoraLoader(
        lora.name,
        lora.strength,
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
  AppSurface.shapes.forEach((box, boxes, map) => {
    console.log(box);
    if (box.caption) tags.push(box.caption);
    idx = idx + 1;
    prompt[String(idx)] = nodeGligenTextboxApply(
      box.caption,
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
  let positive_prompt = `${globalState.positivePrompt.replace(
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
    globalState.negativePrompt,
    modelID
  );

  idx += 1;
  let latentID = idx;
  let canvas = document.getElementById("main-canvas");
  prompt[String(latentID)] = nodeEmptyLatentImage(
    canvas.width,
    canvas.height,
    1
  );

  idx += 1;
  let ksamplerID = idx;
  prompt[String(ksamplerID)] = nodeKSampler(
    seed,
    globalState.stepsValue,
    globalState.cfgValue,
    globalState.samplerName,
    globalState.schedulerName,
    modelID,
    positiveID,
    negativeID,
    latentID
  );
  let vaedecodeID;
  let vaeloaderID;

  if (globalState.vaeName === "fromCheckpoint") {
    idx += 1;
    vaedecodeID = idx;
    prompt[String(vaedecodeID)] = nodeVAEDecode(1, 2, ksamplerID);
  } else {
    idx += 1;
    vaeloaderID = idx;
    prompt[String(vaeloaderID)] = nodeVAELoader(globalState.vaeName);

    idx += 1;
    vaedecodeID = idx;
    prompt[String(vaedecodeID)] = nodeVAEDecode(vaeloaderID, 0, ksamplerID);
  }

  idx += 1;
  let saveimageID = idx;
  prompt[String(saveimageID)] = nodeSaveImage("gligen/image", vaedecodeID);
  globalState.outputImageNode = saveimageID;
  console.log(prompt);
  // export2txt(prompt)
  return prompt;
}

var socketInitialized = false;
const clientID = "1122";
function onSocketMessageReceive(event) {
  try {
    let parsed = JSON.parse(event.data);
    if (parsed.type === "progress") {
      let progress = Math.round((100 * parsed.data.value) / parsed.data.max);
      document.getElementById("progress-bar").style.width = `${progress}%`;
    } else if (parsed.type === "status" && !parsed.data.sid) {
      if (parsed.data.status.exec_info.queue_remaining === 0) {
        requestGET("/history", (endpoint, response) => {
          if (globalState.promptID) {
            let pid = response[globalState.promptID];
            let images = pid.outputs[globalState.outputImageNode].images;
            images.forEach((image) => {
              let img_url = `/view?filename=${image.filename}&subfolder=${image.subfolder}&type=${image.type}`;
              getImage(img_url);
            });
          }
        });
      }
    }
  } catch (error) {}
}

function initializeWebSocket() {
  if (socketInitialized) return;

  socketInitialized = true;

  const socket = new WebSocket(
    `ws://127.0.0.1:${globalState.comfyPort || "8188"}/ws?clientId=${clientID}`
  );

  socket.addEventListener("open", (event) => {
    console.log("Socket opened");
  });

  socket.addEventListener("message", onSocketMessageReceive);
}

function queuePrompt() {
  let pb = document.getElementById("progress-bar");
  pb.style.width = "0%";
  let prompt = buildPrompt();
  initializeWebSocket();
  requestPOST(
    "/prompt",
    {
      prompt: prompt,
      client_id: clientID,
    },
    (endpoint, response) => {
      if (response.error) {
        addToast(
          "<u>Oops</u>",
          response.error.message,
          (is_error = true),
          (timeout = 0)
        );
        let node_errors = response.node_errors;
        if (node_errors) {
          let node;
          for (var node_id in node_errors) {
            node = node_errors[node_id];
            // console.log(node);
            let class_type = node.class_type;
            let errors = node.errors;
            for (var eid in errors) {
              // console.log(errors[eid].message);
              // console.log(errors[eid].details);
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
        globalState.promptID = response.prompt_id;
        console.log("prompt_id = ", globalState.promptID);
      }
    }
  );
}
