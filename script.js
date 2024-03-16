const canvas = document.querySelector("canvas"),
  toolBtns = document.querySelectorAll(".tool"),
  // sizeSlider = document.querySelector("#size-slider"),
  colorBtns = document.querySelectorAll(".colors .option"),
  clearCanvas = document.querySelector(".clear-canvas"),
  saveImg = document.querySelector(".save-img"),
  writeBtn = document.getElementById("write"),
  ctx = canvas.getContext("2d");

let prevMouseX,
  prevMouseY,
  snapshot,
  isDrawing = false,
  isWriting = false,
  selectedTool = "brush",
  brushWidth = 6,
  selectedColor = "#000",
  typingText = "";

const toggleWritingMode = () => {
  isWriting = !isWriting;
  typingText = "";
};

const brushWidthIcon = document.getElementById("brushWidthIcon");
let brushWidthActive = false;

brushWidthIcon.addEventListener("click", () => {
  if (!brushWidthActive) {
    brushWidth = 10; // Set fixed brush width
    brushWidthIcon.classList.add("active");
  } else {
    brushWidth = 6; // Reset brush width
    brushWidthIcon.classList.remove("active");
  }
  brushWidthActive = !brushWidthActive;
});

writeBtn.addEventListener("click", () => {
  toolBtns.forEach((btn) => {
    btn.classList.remove("active");
  });
  writeBtn.classList.add("active");
  selectedTool = "write";
  toggleWritingMode();
});

const setCanvasBackground = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgba(0, 0, 0, 0)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = selectedColor;
};

window.addEventListener("load", () => {
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
  setCanvasBackground();
});

const drawRect = (e) => {
  ctx.strokeRect(
    e.offsetX,
    e.offsetY,
    prevMouseX - e.offsetX,
    prevMouseY - e.offsetY
  );
};

const drawCircle = (e) => {
  ctx.beginPath();
  let radius = Math.sqrt(
    Math.pow(prevMouseX - e.offsetX, 2) + Math.pow(prevMouseY - e.offsetY, 2)
  );
  ctx.arc(prevMouseX, prevMouseY, radius, 0, 2 * Math.PI);
  ctx.stroke();
};

const drawTriangle = (e) => {
  ctx.beginPath();
  ctx.moveTo(prevMouseX, prevMouseY);
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.lineTo(prevMouseX * 2 - e.offsetX, e.offsetY);
  ctx.closePath();
  ctx.stroke();
};

const startDraw = (e) => {
  isDrawing = true;
  const rect = canvas.getBoundingClientRect();
  prevMouseX = (e.clientX || e.touches[0].clientX) - rect.left;
  prevMouseY = (e.clientY || e.touches[0].clientY) - rect.top;
  ctx.beginPath();
  ctx.lineWidth = brushWidth;
  ctx.strokeStyle = selectedColor;
  snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
};

const drawing = (e) => {
  if (!isDrawing) return;
  const rect = canvas.getBoundingClientRect();
  const mouseX = (e.clientX || e.touches[0].clientX) - rect.left;
  const mouseY = (e.clientY || e.touches[0].clientY) - rect.top;

  if (selectedTool === "brush" || selectedTool === "eraser") {
    const mouseXPrev = prevMouseX;
    const mouseYPrev = prevMouseY;
    const dx = mouseX - mouseXPrev;
    const dy = mouseY - mouseYPrev;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const step = brushWidth / 2;
    const steps = Math.max(1, Math.floor(distance / step));

    for (let i = 0; i < steps; i++) {
      const x = mouseXPrev + dx * (i / steps);
      const y = mouseYPrev + dy * (i / steps);
      if (selectedTool === "brush") {
        ctx.putImageData(snapshot, 0, 0);
        ctx.strokeStyle = selectedColor;
        ctx.lineTo(x, y);
        ctx.stroke();
      } else if (selectedTool === "eraser") {
        ctx.clearRect(
          x - brushWidth / 2,
          y - brushWidth / 2,
          brushWidth,
          brushWidth
        );
      }
    }

    prevMouseX = mouseX;
    prevMouseY = mouseY;
  } else if (selectedTool === "write" && isWriting) {
    renderText();
  } else {
    ctx.putImageData(snapshot, 0, 0);
    if (selectedTool === "rectangle") {
      drawRect({ offsetX: mouseX, offsetY: mouseY });
    } else if (selectedTool === "circle") {
      drawCircle({ offsetX: mouseX, offsetY: mouseY });
    } else if (selectedTool === "triangle") {
      drawTriangle({ offsetX: mouseX, offsetY: mouseY });
    }
  }
};

toolBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    toolBtns.forEach((tool) => tool.classList.remove("active"));
    btn.classList.add("active");
    selectedTool = btn.id;
    isWriting = selectedTool === "write";
    isDrawing = false;
  });
});

// sizeSlider.addEventListener("change", () => (brushWidth = sizeSlider.value));

colorBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelector(".options .selected").classList.remove("selected");
    btn.classList.add("selected");
    selectedColor = window
      .getComputedStyle(btn)
      .getPropertyValue("background-color");
  });
});

clearCanvas.addEventListener("click", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  setCanvasBackground();
});

saveImg.addEventListener("click", () => {
  const link = document.createElement("a");
  link.download = `${Date.now()}.jpg`;
  link.href = canvas.toDataURL();
  link.click();
});

canvas.addEventListener("mousedown", startDraw);
canvas.addEventListener("mousemove", drawing);
canvas.addEventListener("mouseup", () => {
  isDrawing = false;
});

canvas.addEventListener("touchstart", (e) => {
  startDraw(e.touches[0]);
});

canvas.addEventListener("touchmove", (e) => {
  drawing(e.touches[0]);
});

canvas.addEventListener("touchend", () => {
  isDrawing = false;
});

const renderText = () => {
  const fontSize = brushWidth * 4;
  ctx.font = `${fontSize}px Arial`;
  ctx.fillStyle = selectedColor;
  ctx.fillText(typingText, prevMouseX, prevMouseY);
};

document.addEventListener("keydown", (e) => {
  if (selectedTool === "write" && isWriting) {
    if (e.key === "Enter") {
      isWriting = false;
    } else if (e.key === "Backspace") {
      typingText = typingText.slice(0, -1);
    } else {
      typingText += e.key;
    }

    renderText();
  }
});

canvas.addEventListener("click", () => {
  if (selectedTool === "write") {
    isWriting = true;
    prevMouseX = cursorX;
    prevMouseY = cursorY;
  }
});

canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  cursorX = e.clientX - rect.left;
  cursorY = e.clientY - rect.top;
  // typingText = "";
});

canvas.addEventListener("mousedown", () => {
  typingMode = true;
  typingText = "";
});
