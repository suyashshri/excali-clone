import { debounce, getExistingShapes } from "./http";

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

  constructor(
    canvas: HTMLCanvasElement,
    roomId: string,
    socket: WebSocket,
    selectedButton: string
  ) {
    (this.canvas = canvas),
      (this.context = canvas.getContext("2d")!),
      (this.roomId = roomId),
      (this.socket = socket),
      (this.selectedButton = selectedButton),
      (this.clicked = false),
      (this.existingShapes = []);

    this.painting = false;
    this.currentStrokes = [];

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
    this.clearCanvas();
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
        var headlen = 10;
        var dx = shape.endX - shape.startX;
        var dy = shape.endY - shape.startY;
        var angle = Math.atan2(dy, dx);
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

  mouseMoveHandler = (e: MouseEvent) => {
    if (this.clicked) {
      if (this.selectedButton === "Pencil" && this.painting) {
        this.context.strokeStyle = "rgba(255, 255, 255,0.5)";

        this.context.lineTo(e.offsetX, e.offsetY);
        this.context.stroke();
        this.lastX = e.offsetX;
        this.lastY = e.offsetY;
        this.currentStrokes.push({ x: this.lastX, y: this.lastY });
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
      }
    }
  };

  mouseUpHandler = (e: MouseEvent) => {
    this.clicked = false;

    let shape: Shapes | null = null;
    const width = e.clientX - this.startX;
    const height = e.clientY - this.startY;

    if (this.selectedButton === "Rectangle") {
      shape = {
        type: "Rectangle",
        x: this.startX,
        y: this.startY,
        width,
        height,
      };
    } else if (this.selectedButton === "Circle") {
      shape = {
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
        type: "Diamond",
        x: this.startX,
        y: this.startY,
        width,
        height,
      };
    } else if (this.selectedButton === "Arrow") {
      shape = {
        type: "Arrow",
        startX: this.startX,
        startY: this.startY,
        endX: e.clientX,
        endY: e.clientY,
      };
    } else if (this.selectedButton === "Line") {
      shape = {
        type: "Line",
        startX: this.startX,
        startY: this.startY,
        endX: e.clientX,
        endY: e.clientY,
      };
    } else if (this.selectedButton === "Pencil") {
      this.painting = false;

      shape = {
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
      console.error("WebSocket send failed:", error);
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
