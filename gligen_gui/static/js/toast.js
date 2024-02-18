var toast_id = 0;

function addToast(header, body, is_error = false, timeout = 5000) {
  toast_container = document.getElementById("toast-container");

  let new_toast = document.createElement("div");
  new_toast.id = `toast-${toast_id}`;
  new_toast.classList.add("toast");
  if (is_error) {
    new_toast.classList.add("toast--error");
  }

  let toast_header_row = document.createElement("div");
  toast_header_row.classList.add("toast-header-row");

  let toast_header = document.createElement("div");
  toast_header.classList.add("toast-header");
  toast_header.innerHTML = header;

  let toast_close_button = document.createElement("button");
  toast_close_button.classList.add("toast-close-button");
  toast_close_button.innerHTML = "🗙";
  toast_close_button.addEventListener("click", (event) => {
    // new_toast.classList.add('toast-leave-animation');
    new_toast.style.marginBottom = `-${new_toast.offsetHeight + 12}px`;
    new_toast.style.opacity = `0`;
    new_toast.style.transform = `translateX(512px)`;

    new_toast.addEventListener("transitionend", () => {
      new_toast.remove();
    });
  });

  let toast_body = document.createElement("p");
  toast_body.innerHTML = body;

  toast_header_row.appendChild(toast_header);
  toast_header_row.appendChild(toast_close_button);
  new_toast.append(toast_header_row);
  new_toast.append(toast_body);

  toast_container.prepend(new_toast);
  animateCSS(new_toast.id, "slideInRight");
  toast_id += 1;
  if (timeout > 0) {
    setTimeout(() => toast_close_button.click(), timeout);
  }
}

var idx = 0;

function testToast() {
  addToast(`toast #${idx}`, "This is a test message!");
  idx += 1;
}
