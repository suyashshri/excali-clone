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
      }
    });
  }

  mouseDownHandler = (e: MouseEvent) => {
    this.clicked = true;
    this.startX = e.clientX;
    this.startY = e.clientY;
  };

  mouseMoveHandler = (e: MouseEvent) => {
    if (this.clicked) {
      const width = e.clientX - this.startX;
      const height = e.clientY - this.startY;

      this.clearCanvas();
      this.context.strokeStyle = "rgba(255, 255, 255)";
      if (this.selectedButton === "Rectangle") {
        this.context.strokeRect(this.startX, this.startY, width, height);
      } else if (this.selectedButton == "Circle") {
        this.context.beginPath();
        this.context.ellipse(
          this.startX + width / 2,
          this.startY + height / 2,
          width / 2,
          height / 2,
          0,
          0,
          2 * Math.PI
        );
        this.context.stroke();
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
        radiusX: width / 2,
        radiusY: height / 2,
        rotation: 0,
        startAngle: 0,
        endAngle: 2 * Math.PI,
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
      console.log("Message sent to WebSocket:", shape);
    } catch (error) {
      console.error("WebSocket send failed:", error);
    }
  };

  initMouseHandler() {
    // const debouncedMouseMoveHandler = debounce(
    //   this.mouseMoveHandler.bind(this),
    //   200
    // );

    this.canvas.addEventListener("mousedown", this.mouseDownHandler);
    this.canvas.addEventListener("mousemove", this.mouseMoveHandler);
    this.canvas.addEventListener("mouseup", this.mouseUpHandler);

    // this.mouseMoveHandler = debouncedMouseMoveHandler;
  }
}

// import { HTTP_BACKEND } from "@/app/config";
// import axios from "axios";

// let isMessageHandlerSet = false;
// export async function initDraw(
//   canvas: HTMLCanvasElement,
//   roomId: string,
//   socket: WebSocket,
//   selectedButton: string
// ) {
//   console.log("selectedButton", selectedButton);

//   let context = canvas.getContext("2d");
//   if (!context) {
//     console.log("no context");
//     return;
//   }

//   let existingShapes: Shapes[] = await getShapesFromDb(roomId);

//   console.log("initDraw called");
//   if (!isMessageHandlerSet) {
//     socket.onmessage = (event) => {
//       console.log("WebSocket message received");
//       const message = JSON.parse(event.data);
//       if (message.type == "chat") {
//         console.log("Chat message received");
//         const parsedData = JSON.parse(message.message);
//         existingShapes.push(parsedData.shape);
//         clearCanvas(canvas, context, existingShapes);
//       }
//     };
//     isMessageHandlerSet = true;
//   }

//   let clicked = false;
//   let startX = 0;
//   let startY = 0;
//   clearCanvas(canvas, context, existingShapes);

//   const handleMouseDown = (e: MouseEvent) => {
//     clicked = true;
//     startX = e.clientX;
//     startY = e.clientY;
//   };

//   const handleMouseMove = (e: MouseEvent) => {
//     if (clicked) {
//       const width = e.clientX - startX;
//       const height = e.clientY - startY;

//       clearCanvas(canvas, context, existingShapes);

//       if (selectedButton === "Rectangle") {
//         context.strokeRect(startX, startY, width, height);
//       } else if (selectedButton == "Circle") {
//         context.beginPath();
//         context.ellipse(
//           startX + width / 2,
//           startY + height / 2,
//           width / 2,
//           height / 2,
//           0,
//           0,
//           2 * Math.PI
//         );
//         context.stroke();
//       }
//     }
//   };

//   const handleMouseUp = (e: MouseEvent) => {
//     clicked = false;
//     let shape: Shapes | null = null;
//     const width = e.clientX - startX;
//     const height = e.clientY - startY;

//     if (selectedButton === "Rectangle") {
//       shape = {
//         type: "Rectangle",
//         x: startX,
//         y: startY,
//         width,
//         height,
//       };
//     } else if (selectedButton === "Circle") {
//       shape = {
//         type: "Circle",
//         x: startX + width / 2,
//         y: startY + height / 2,
//         radiusX: width / 2,
//         radiusY: height / 2,
//         rotation: 0,
//         startAngle: 0,
//         endAngle: 2 * Math.PI,
//       };
//     }

//     if (!shape) {
//       return;
//     }

//     if (shape.type === selectedButton) {
//       existingShapes.push(shape);
//       console.log("existingShapes", existingShapes);
//       console.log("shapeeee", shape);
//     }

//     socket.send(
//       JSON.stringify({
//         type: "chat",
//         message: JSON.stringify({
//           shape,
//         }),
//         roomId,
//       })
//     );
//   };

//   const debouncedMouseMove = debounce(handleMouseMove, 200);

//   canvas.addEventListener("mousedown", handleMouseDown);
//   canvas.addEventListener("mousemove", handleMouseMove);
//   canvas.addEventListener("mouseup", handleMouseUp);

//   return () => {
//     console.log("Cleaning up event listeners");
//     canvas.removeEventListener("mousedown", handleMouseDown);
//     canvas.removeEventListener("mousemove", handleMouseMove);
//     canvas.removeEventListener("mouseup", handleMouseUp);
//   };
// }

// export function clearCanvas(
//   canvas: HTMLCanvasElement,
//   context: CanvasRenderingContext2D,
//   existingShapes: Shapes[]
// ) {
//   context.clearRect(0, 0, canvas.width, canvas.height);
//   context.fillStyle = "rgba(25,25,25)";
//   context.fillRect(0, 0, canvas.width, canvas.height);
//   context.strokeStyle = "rgba(255,255,255)";
//   existingShapes.forEach((shape) => {
//     if (shape.type == "Rectangle") {
//       context.strokeRect(shape.x, shape.y, shape.width, shape.height);
//     } else if (shape.type == "Circle") {
//       context.beginPath();
//       context.ellipse(
//         shape.x,
//         shape.y,
//         shape.radiusX,
//         shape.radiusY,
//         shape.rotation,
//         shape.startAngle,
//         shape.endAngle
//       );
//       context.stroke();
//     }
//   });
// }

// async function getShapesFromDb(roomId: string) {
//   const response = await axios.get(
//     `${HTTP_BACKEND}/user/room/chats/${roomId}`,
//     {
//       headers: {
//         Authorization: localStorage.getItem("token"),
//       },
//     }
//   );
//   const messages = response.data.messages;

//   const shapes = messages.map((x: { message: string }) => {
//     const parsedMessage = JSON.parse(x.message);
//     return parsedMessage.shape;
//   });

//   return shapes;
// }

// function debounce(func: Function, wait: number) {
//   let timeout: ReturnType<typeof setTimeout> | null = null;
//   return function (this: any, ...args: any[]) {
//     if (timeout !== null) {
//       clearTimeout(timeout);
//     }
//     timeout = setTimeout(() => func.apply(this, args), wait);
//   };
// }
