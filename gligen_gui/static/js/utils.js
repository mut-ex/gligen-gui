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

function almostEqual(val1, val2, tolerance = ERROR_MARGIN) {
  return abs(val1 - val2) <= ERROR_MARGIN;
}

function roundTo8(n) {
  return Math.floor(n / 8 + 0.5) * 8;
}

function getMousePos(canvas) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  let x = (event.clientX - rect.left) * scaleX;
  let y = (event.clientY - rect.top) * scaleY;
  x = Math.floor(x / 8 + 0.5) * 8;
  y = Math.floor(y / 8 + 0.5) * 8;
  // x = round(x);
  // y = round(y);
  mouse_id.innerHTML = `${x}, ${y}`;
  return {
    x: x,
    y: y,
  };
}

function hexToRgb(hex) {
  let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

function luminance(r, g, b) {
  let a = [r, g, b].map(function (v) {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function contrast(hexcolor1, hexcolor2) {
  let rgb1 = hexToRgb(hexcolor1);
  let rgb2 = hexToRgb(hexcolor2);

  let lum1 = luminance(rgb1.r, rgb1.g, rgb1.b);
  let lum2 = luminance(rgb2.r, rgb2.g, rgb2.b);
  let brightest = Math.max(lum1, lum2);
  let darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

function getComplementaryColor(hexColor) {
  // Remove the hash from the color if it's there
  hexColor = hexColor.replace("#", "");

  // Convert the hex color to RGB
  let r = parseInt(hexColor.substring(0, 2), 16);
  let g = parseInt(hexColor.substring(2, 4), 16);
  let b = parseInt(hexColor.substring(4, 6), 16);

  // Calculate the complementary color
  let rComplement = 255 - r;
  let gComplement = 255 - g;
  let bComplement = 255 - b;

  // Convert the RGB color back to hex
  let hexComplement = (
    (rComplement << 16) |
    (gComplement << 8) |
    bComplement
  ).toString(16);

  // Pad the hex color with zeros if necessary and return it
  return "#" + ("000000" + hexComplement).slice(-6);
}

function getForegroundColor(color) {
  let black = contrast("#1f1f1e", color);
  let white = contrast("#fefefa", color);
  if (black > white) return "#1f1f1e";
  return "#fefefa";
}

function padNumber(num, n) {
  let numStr = num.toString();
  if (numStr.length > n) {
    return "Number length is greater than n";
  }
  //<span style="opacity:0.5;">\u00A0</span>
  let padding = '<span style="opacity:0.0625;">0</span>'.repeat(
    n - numStr.length
  );
  return padding + numStr;
}

function flatten() {
  console.log(myAppState["loraMap"].stringify());
  const lmap = myAppState["loraMap"].stringify();
  let d = JSON.stringify(myAppState);
  console.log(d);
  d = JSON.parse(d);
  d["loraMap"] = lmap;
  // console.log(d)
  // console.log(d["loraMap"])
  export2txt(d);
}

function makeSavefileName() {
  let d = new Date();
  console.log(d.getMinutes());
  let time = `${d.getHours()}${d.getMinutes()}${d.getSeconds()}`;
  console.log(time)
  let day = `${d.getMonth()+1}${d.getDate()}${d.getFullYear()}`;
  let fname = `gligenGUI_${time}_${day}`
// console.log(fname)
  return fname;
}

function export2txt(data) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(
    new Blob([JSON.stringify(data, null, 2)], {
      type: "text/plain",
    })
  );
  a.setAttribute("download", "data.json");
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

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

function requestPOST(endpoint, payload, handler) {
  fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })
    .then((response) => response.json())
    .then((data) => {
      handler(endpoint, data);
    });
}
