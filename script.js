const canvas = document.querySelector("canvas"),
  toolBtns = document.querySelectorAll(".tool"),
  fillColor = document.querySelector("#fill-color"),
  sizeSlider = document.querySelector("#size-slider"),
  colorBtns = document.querySelectorAll(".colors .option"),
  colorPicker = document.querySelector("#color-picker"),
  clearCanvas = document.querySelector(".clear-canvas"),
  saveImg = document.querySelector(".save-img"),
  ctx = canvas.getContext("2d");

// global variables with default value
let snapshot,
  isDrawing = false,
  selectedTool = "brush",
  brushWidth = 3,
  selectedColor = "#000",
  startX,
  startY;

const setCanvasBackground = () => {
  // setting whole canvas background to white, so the downloaded img background will be white
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = selectedColor; // setting fillstyle back to the selectedColor, it'll be the brush color
};

window.addEventListener("load", () => {
  // setting canvas width/height.. offsetwidth/height returns viewable width/height of an element
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
  setCanvasBackground();
});

const drawRect = (x, y, width, height) => {
  // if fillColor isn't checked draw a rect with border else draw rect with background
  if (!fillColor.checked) {
    // creating rectangle according to the touch position
    return ctx.strokeRect(x, y, width, height);
  }
  ctx.fillRect(x, y, width, height);
};

const drawCircle = (x, y, radius) => {
  ctx.beginPath(); // creating new path to draw circle
  ctx.arc(x, y, radius, 0, 2 * Math.PI); // creating circle according to the touch position
  fillColor.checked ? ctx.fill() : ctx.stroke(); // if fillColor is checked fill circle else draw border circle
};

const drawTriangle = (x, y, side) => {
  ctx.beginPath(); // creating new path to draw triangle
  ctx.moveTo(x, y); // moving triangle to the touch position
  ctx.lineTo(x + side / 2, y + side); // creating first line of triangle
  ctx.lineTo(x - side / 2, y + side); // creating second line of triangle
  ctx.closePath(); // closing path of a triangle so the third line draw automatically
  fillColor.checked ? ctx.fill() : ctx.stroke(); // if fillColor is checked fill triangle else draw border
};

const startDraw = (x, y) => {
  isDrawing = true;
  startX = x; // passing current touchX position as startX value
  startY = y; // passing current touchY position as startY value
  ctx.beginPath(); // creating new path to draw
  ctx.lineWidth = brushWidth; // passing brushSize as line width
  ctx.strokeStyle = selectedColor; // passing selectedColor as stroke style
  ctx.fillStyle = selectedColor; // passing selectedColor as fill style
  // copying canvas data & passing as snapshot value.. this avoids dragging the image
  snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
};

const drawing = (x, y) => {
  if (!isDrawing) return; // if isDrawing is false return from here
  ctx.putImageData(snapshot, 0, 0); // adding copied canvas data on to this canvas

  const width = x - startX;
  const height = y - startY;
  const radius = Math.sqrt(width ** 2 + height ** 2);
  const side = width > height ? width : height;

  if (selectedTool === "brush" || selectedTool === "eraser") {
    // if selected tool is eraser then set strokeStyle to white
    // to paint white color on to the existing canvas content else set the stroke color to selected color
    ctx.strokeStyle = selectedTool === "eraser" ? "#fff" : selectedColor;
    ctx.lineTo(x, y); // creating line according to the touch position
    ctx.stroke(); // drawing/filling line with color
  } else if (selectedTool === "rectangle") {
    drawRect(startX, startY, width, height);
  } else if (selectedTool === "circle") {
    drawCircle(startX, startY, radius);
  } else {
    drawTriangle(startX, startY, side);
  }
};

toolBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    // adding click event to all tool option
    // removing active class from the previous option and adding on current clicked option
    document.querySelector(".options .active").classList.remove("active");
    btn.classList.add("active");
    selectedTool = btn.id;
  });
});

sizeSlider.addEventListener("change", () => (brushWidth = sizeSlider.value)); // passing slider value as brushSize

colorBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    // adding click event to all color button
    // removing selected class from the previous option and adding on current clicked option
    document.querySelector(".options .selected").classList.remove("selected");
    btn.classList.add("selected");
    // passing selected btn background color as selectedColor value
    selectedColor = window
      .getComputedStyle(btn)
      .getPropertyValue("background-color");
  });
});

colorPicker.addEventListener("change", () => {
  // passing picked color value from color picker to last color btn background
  colorPicker.parentElement.style.background = colorPicker.value;
  colorPicker.parentElement.click();
});

clearCanvas.addEventListener("click", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height); // clearing whole canvas
  setCanvasBackground();
});

saveImg.addEventListener("click", () => {
  const link = document.createElement("a"); // creating <a> element
  link.download = `${Date.now()}.jpg`; // passing current date as link download value
  link.href = canvas.toDataURL(); // passing canvasData as link href value
  link.click(); // clicking link to download image
});

canvas.addEventListener("touchstart", (e) => {
  const rect = canvas.getBoundingClientRect();
  const touchX = e.touches[0].clientX - rect.left;
  const touchY = e.touches[0].clientY - rect.top;
  startDraw(touchX, touchY);
});

canvas.addEventListener("touchmove", (e) => {
  const rect = canvas.getBoundingClientRect();
  const touchX = e.touches[0].clientX - rect.left;
  const touchY = e.touches[0].clientY - rect.top;
  drawing(touchX, touchY);
});

canvas.addEventListener("touchend", () => (isDrawing = false));
