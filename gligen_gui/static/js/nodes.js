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

function nodeVAELoader(name) {
  return {
    inputs: {
      vae_name: name,
    },
    class_type: "VAELoader",
    _meta: {
      title: "Load VAE",
    }
  }
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
      scheduler: "normal",
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
      clip: [String(1), 1],
    },
    class_type: "CLIPTextEncode",
    _meta: {
      title: "CLIP Text Encode (Prompt)",
    },
  };
}

function nodeVAEDecode(input_provider, provider_output_index, samples_in) {
  return {
    inputs: {
      samples: [String(samples_in), 0],
      vae: [String(input_provider), provider_output_index],
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
      clip: [String(1), 1],
      gligen_textbox_model: [String(gligentextboxmodel_in), 0],
    },
    class_type: "GLIGENTextBoxApply",
    _meta: {
      title: "GLIGENTextBoxApply",
    },
  };
}

function nodeLoraLoaderModelOnly(name, strength, model_in) {
  return {
    inputs: {
      lora_name: name,
      strength_model: strength,
      strength_clip: strength,
      model: ["1", 0],
      clip: [String(model_in), 1],
    },
    class_type: "LoraLoader",
    _meta: {
      title: "Load LoRA",
    },
  };
}
