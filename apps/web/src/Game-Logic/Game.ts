import { Shapes, Strokes } from "@/types";
import { getExistingShapes, removeShapeFomDB } from "./http";

export class Game {
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private roomId: string;
  private socket: WebSocket;
  private selectedButton: string;
  private clicked: boolean;
  private existingShapes: Shapes[];
  private startX = 0;
  private startY = 0;

  private lastX = 0;
  private lastY = 0;
  private painting: boolean;
  private currentStrokes: Strokes[];
  private isErasing: boolean;

  constructor(
    canvas: HTMLCanvasElement,
    roomId: string,
    socket: WebSocket,
    selectedButton: string
  ) {
    this.canvas = canvas;
    this.context = canvas.getContext("2d")!;
    this.roomId = roomId;
    this.socket = socket;
    this.selectedButton = selectedButton;
    this.clicked = false;
    this.existingShapes = [];
    this.painting = false;
    this.currentStrokes = [];
    this.isErasing = false;
    console.log("selectedtool", this.selectedButton);

    this.init();
    this.initHandlers();
    this.initMouseHandler();
  }

  destroy() {
    this.canvas.removeEventListener("mousedown", this.mouseDownHandler);
    this.canvas.removeEventListener("mousemove", this.mouseMoveHandler);
    this.canvas.removeEventListener("mouseup", this.mouseUpHandler);
  }

  async init() {
    this.existingShapes = await getExistingShapes(this.roomId);
    console.log(this.existingShapes);

    this.clearCanvas();
    if (this.selectedButton == "Eraser") {
      this.isErasing = true;
      this.canvas.style.cursor = "url('/eraser.png'), auto";
    } else if (
      this.selectedButton == "Rectangle" ||
      this.selectedButton == "Circle" ||
      this.selectedButton == "Diamond" ||
      this.selectedButton == "Arrow" ||
      this.selectedButton == "Line"
    ) {
      this.canvas.style.cursor = "crosshair";
    } else {
      this.canvas.style.cursor = "pointer";
    }
  }

  initHandlers() {
    this.socket.onmessage = (event) => {
      const parsedData = JSON.parse(event.data);

      if (parsedData.type === "chat") {
        const parsedMessage = JSON.parse(parsedData.message);

        this.existingShapes.push(parsedMessage.shape);
        this.clearCanvas();
      }
    };
  }

  clearCanvas() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.fillStyle = "rgba(25,25,25)";
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.strokeStyle = "rgba(255,255,255)";
    this.existingShapes.forEach((shape) => {
      if (shape.type == "Rectangle") {
        this.context.strokeRect(shape.x, shape.y, shape.width, shape.height);
      } else if (shape.type == "Circle") {
        this.context.beginPath();
        this.context.ellipse(
          shape.x,
          shape.y,
          shape.radiusX,
          shape.radiusY,
          shape.rotation,
          shape.startAngle,
          shape.endAngle
        );
        this.context.stroke();
      } else if (shape.type == "Diamond") {
        this.context.beginPath();
        this.context.moveTo(shape.x + shape.width / 2, shape.y);
        this.context.lineTo(shape.x + shape.width, shape.y + shape.height / 2);
        this.context.lineTo(shape.x + shape.width / 2, shape.y + shape.height);
        this.context.lineTo(shape.x, shape.y + shape.height / 2);
        this.context.closePath();
        this.context.stroke();
      } else if (shape.type == "Arrow") {
        const headlen = 10;
        const dx = shape.endX - shape.startX;
        const dy = shape.endY - shape.startY;
        const angle = Math.atan2(dy, dx);
        this.context.beginPath();
        this.context.moveTo(shape.startX, shape.startY);
        this.context.lineTo(shape.endX, shape.endY);
        this.context.lineTo(
          shape.endX - headlen * Math.cos(angle - Math.PI / 6),
          shape.endY - headlen * Math.sin(angle - Math.PI / 6)
        );
        this.context.moveTo(shape.endX, shape.endY);
        this.context.lineTo(
          shape.endX - headlen * Math.cos(angle + Math.PI / 6),
          shape.endY - headlen * Math.sin(angle + Math.PI / 6)
        );
        this.context.stroke();
      } else if (shape.type == "Line") {
        this.context.beginPath();
        this.context.moveTo(shape.startX, shape.startY);
        this.context.lineTo(shape.endX, shape.endY);
        this.context.stroke();
      } else if (shape.type == "Pencil") {
        this.context.beginPath();
        this.context.moveTo(shape.strokes[0].x, shape.strokes[0].y);
        shape.strokes.forEach((point) => {
          this.context.lineTo(point.x, point.y);
        });
        this.context.stroke();
      }
    });
  }

  mouseDownHandler = (e: MouseEvent) => {
    this.clicked = true;
    this.startX = e.clientX;
    this.startY = e.clientY;

    if (this.selectedButton == "Pencil") {
      this.painting = true;
      this.lastX = e.offsetX;
      this.lastY = e.offsetY;
      this.context.beginPath();
      this.context.moveTo(this.lastX, this.lastY);
      this.currentStrokes = [{ x: e.offsetX, y: e.offsetY }];
    }
  };

  mouseMoveHandler = async (e: MouseEvent) => {
    if (this.clicked) {
      if (this.selectedButton === "Pencil") {
        if (this.painting) {
          this.context.strokeStyle = "rgba(255, 255, 255,0.5)";

          this.context.lineTo(e.offsetX, e.offsetY);
          this.context.stroke();
          this.lastX = e.offsetX;
          this.lastY = e.offsetY;
          this.currentStrokes.push({ x: this.lastX, y: this.lastY });
        }
      } else {
        this.clearCanvas();
        this.context.strokeStyle = "rgba(255, 255, 255)";
        const width = e.clientX - this.startX;
        const height = e.clientY - this.startY;
        if (this.selectedButton === "Rectangle") {
          this.context.strokeRect(this.startX, this.startY, width, height);
        } else if (this.selectedButton === "Circle") {
          this.context.beginPath();
          this.context.ellipse(
            this.startX + width / 2,
            this.startY + height / 2,
            Math.abs(width) / 2,
            Math.abs(height) / 2,
            0,
            0,
            2 * Math.PI
          );
          this.context.stroke();
        } else if (this.selectedButton === "Diamond") {
          this.context.beginPath();
          this.context.moveTo(this.startX + width / 2, this.startY);
          this.context.lineTo(this.startX + width, this.startY + height / 2);
          this.context.lineTo(this.startX + width / 2, this.startY + height);
          this.context.lineTo(this.startX, this.startY + height / 2);
          this.context.closePath();
          this.context.stroke();
        } else if (this.selectedButton === "Arrow") {
          const headlen = 10;
          const dx = e.clientX - this.startX;
          const dy = e.clientY - this.startY;
          const angle = Math.atan2(dy, dx);
          this.context.beginPath();
          this.context.moveTo(this.startX, this.startY);
          this.context.lineTo(e.clientX, e.clientY);
          this.context.lineTo(
            e.clientX - headlen * Math.cos(angle - Math.PI / 6),
            e.clientY - headlen * Math.sin(angle - Math.PI / 6)
          );
          this.context.moveTo(e.clientX, e.clientY);
          this.context.lineTo(
            e.clientX - headlen * Math.cos(angle + Math.PI / 6),
            e.clientY - headlen * Math.sin(angle + Math.PI / 6)
          );
          this.context.stroke();
        } else if (this.selectedButton === "Line") {
          this.context.beginPath();
          this.context.moveTo(this.startX, this.startY);
          this.context.lineTo(e.clientX, e.clientY);
          this.context.stroke();
        }
        if (this.selectedButton === "Eraser") {
          if (!this.isErasing) return;
          const eraserSize = 6;
          const eraserX = e.clientX;
          const eraserY = e.clientY;
          const eraserXLeft = e.clientX - eraserSize;
          const eraserXRight = e.clientX + eraserSize;
          const eraserYTop = e.clientY - eraserSize;
          const eraserYBottom = e.clientY + eraserSize;
          for (let i = 0; i < this.existingShapes.length; i++) {
            const shape = this.existingShapes[i];

            if (shape.type === "Rectangle") {
              const rectXLeft = Math.min(shape.x, shape.x + shape.width);
              const rectXRight = Math.max(shape.x, shape.x + shape.width);
              const rectYTop = Math.min(shape.y, shape.y + shape.height);
              const rectYBottom = Math.max(shape.y, shape.y + shape.height);

              const touchingLeftBorder =
                eraserXRight >= rectXLeft &&
                eraserXLeft <= rectXLeft &&
                eraserYBottom >= rectYTop &&
                eraserYTop <= rectYBottom;
              const touchingRightBorder =
                eraserXLeft <= rectXRight &&
                eraserXRight >= rectXRight &&
                eraserYBottom >= rectYTop &&
                eraserYTop <= rectYBottom;
              const touchingTopBorder =
                eraserYBottom >= rectYTop &&
                eraserYTop <= rectYTop &&
                eraserXRight >= rectXLeft &&
                eraserXLeft <= rectXRight;
              const touchingBottomBorder =
                eraserYTop <= rectYBottom &&
                eraserYBottom >= rectYBottom &&
                eraserXRight >= rectXLeft &&
                eraserXLeft <= rectXRight;

              const isTouching =
                touchingLeftBorder ||
                touchingRightBorder ||
                touchingTopBorder ||
                touchingBottomBorder;

              if (isTouching) {
                this.existingShapes.splice(i, 1);

                if (shape.id) {
                  await removeShapeFomDB(this.roomId, shape.id);
                  this.existingShapes = await getExistingShapes(this.roomId);
                }
              }
            } else if (shape.type == "Circle") {
              const dx = e.clientX - shape.x;
              const dy = e.clientY - shape.y;
              const distance = Math.sqrt(dx * dx + dy * dy);

              const isTouching =
                distance >=
                  Math.min(shape.radiusX, shape.radiusY) - eraserSize &&
                distance <= Math.max(shape.radiusX, shape.radiusY) + eraserSize;

              if (isTouching) {
                console.log(`Erasing Circle with ID: ${shape.id}`);
                this.existingShapes.splice(i, 1);

                if (shape.id) {
                  await removeShapeFomDB(this.roomId, shape.id);
                  this.existingShapes = await getExistingShapes(this.roomId);
                }
              }
            } else if (shape.type == "Diamond") {
              const centerX = shape.x + shape.width / 2;
              const centerY = shape.y + shape.height / 2;

              // "x": 22,
              // "y": 23,
              // "width": 64,
              // "height": 74
              const x1 = shape.x,
                y1 = centerY;
              const x2 = centerX,
                y2 = shape.y;
              const x3 = shape.x + shape.width,
                y3 = centerY;
              const x4 = centerX,
                y4 = shape.y + shape.height;

              function isPointNearLine(
                x1: any,
                y1: any,
                x2: any,
                y2: any,
                px: any,
                py: any,
                threshold: any
              ) {
                const A = px - x1;
                const B = py - y1;
                const C = x2 - x1;
                const D = y2 - y1;

                const dot = A * C + B * D;
                const len_sq = C * C + D * D;
                let param = len_sq !== 0 ? dot / len_sq : -1;

                let xx, yy;
                if (param < 0) {
                  xx = x1;
                  yy = y1;
                } else if (param > 1) {
                  xx = x2;
                  yy = y2;
                } else {
                  xx = x1 + param * C;
                  yy = y1 + param * D;
                }

                const dx = px - xx;
                const dy = py - yy;
                return Math.sqrt(dx * dx + dy * dy) <= threshold;
              }

              const isTouching =
                isPointNearLine(x1, y1, x2, y2, eraserX, eraserY, eraserSize) ||
                isPointNearLine(x2, y2, x3, y3, eraserX, eraserY, eraserSize) ||
                isPointNearLine(x3, y3, x4, y4, eraserX, eraserY, eraserSize) ||
                isPointNearLine(x4, y4, x1, y1, eraserX, eraserY, eraserSize);

              if (isTouching) {
                this.existingShapes.splice(i, 1);

                if (shape.id) {
                  await removeShapeFomDB(this.roomId, shape.id);
                  this.existingShapes = await getExistingShapes(this.roomId);
                }
              }
            } else if (shape.type === "Arrow" || shape.type === "Line") {
              const { startX, startY, endX, endY } = shape;

              function isPointNearLine(
                x1: any,
                y1: any,
                x2: any,
                y2: any,
                px: any,
                py: any,
                threshold: any
              ) {
                const lineLength = Math.hypot(x2 - x1, y2 - y1);
                if (lineLength === 0) return false;

                const distance =
                  Math.abs(
                    (y2 - y1) * px - (x2 - x1) * py + x2 * y1 - y2 * x1
                  ) / lineLength;

                return distance <= threshold;
              }

              const isTouching = isPointNearLine(
                startX,
                startY,
                endX,
                endY,
                eraserX,
                eraserY,
                eraserSize
              );

              if (isTouching) {
                this.existingShapes.splice(i, 1);

                if (shape.id) {
                  await removeShapeFomDB(this.roomId, shape.id);
                  this.existingShapes = await getExistingShapes(this.roomId);
                }
              }
            } else if (shape.type === "Pencil") {
              const { strokes } = shape;

              function isPointNear(
                px: any,
                py: any,
                sx: any,
                sy: any,
                threshold: any
              ) {
                return Math.hypot(px - sx, py - sy) <= threshold;
              }

              let isTouching = false;

              for (let j = 0; j < strokes.length; j++) {
                const { x, y } = strokes[j];

                if (isPointNear(eraserX, eraserY, x, y, eraserSize)) {
                  isTouching = true;
                  break;
                }
              }

              if (isTouching) {
                this.existingShapes.splice(i, 1);

                if (shape.id) {
                  await removeShapeFomDB(this.roomId, shape.id);
                  this.existingShapes = await getExistingShapes(this.roomId);
                }
              }
            }
          }
        }
      }
    }
  };

  mouseUpHandler = (e: MouseEvent) => {
    this.clicked = false;

    let shape: Shapes | null = null;
    const width = e.clientX - this.startX;
    const height = e.clientY - this.startY;
    // if (this.selectedButton != "Eraser") {
    //   this.canvas.style.cursor = "default";
    // }

    if (this.selectedButton === "Rectangle") {
      shape = {
        id: crypto.randomUUID(),
        type: "Rectangle",
        x: this.startX,
        y: this.startY,
        width,
        height,
      };
    } else if (this.selectedButton === "Circle") {
      shape = {
        id: crypto.randomUUID(),

        type: "Circle",
        x: this.startX + width / 2,
        y: this.startY + height / 2,
        radiusX: Math.abs(width) / 2,
        radiusY: Math.abs(height) / 2,
        rotation: 0,
        startAngle: 0,
        endAngle: 2 * Math.PI,
      };
    } else if (this.selectedButton === "Diamond") {
      shape = {
        id: crypto.randomUUID(),

        type: "Diamond",
        x: this.startX,
        y: this.startY,
        width,
        height,
      };
    } else if (this.selectedButton === "Arrow") {
      shape = {
        id: crypto.randomUUID(),

        type: "Arrow",
        startX: this.startX,
        startY: this.startY,
        endX: e.clientX,
        endY: e.clientY,
      };
    } else if (this.selectedButton === "Line") {
      shape = {
        id: crypto.randomUUID(),

        type: "Line",
        startX: this.startX,
        startY: this.startY,
        endX: e.clientX,
        endY: e.clientY,
      };
    } else if (this.selectedButton === "Pencil") {
      this.painting = false;

      shape = {
        id: crypto.randomUUID(),

        type: "Pencil",
        strokes: this.currentStrokes,
      };
    }

    if (!shape) {
      return;
    }

    this.existingShapes.push(shape);

    try {
      this.socket.send(
        JSON.stringify({
          type: "chat",
          message: JSON.stringify({ shape }),
          roomId: this.roomId,
        })
      );
    } catch (error) {
      console.log("WebSocket send failed:", error);
    }
  };

  initMouseHandler() {
    // const debouncedMouseMoveHandler = debounce(
    //   this.mouseMoveHandler.bind(this),
    //   50
    // );

    this.canvas.addEventListener("mousedown", this.mouseDownHandler);
    this.canvas.addEventListener("mousemove", this.mouseMoveHandler);
    this.canvas.addEventListener("mouseup", this.mouseUpHandler);

    // this.mouseMoveHandler = debouncedMouseMoveHandler;
  }
}
