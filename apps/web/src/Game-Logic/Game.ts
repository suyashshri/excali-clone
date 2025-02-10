import { HTTP_BACKEND } from "@/app/config";
import axios from "axios";

export async function initDraw(
  canvas: HTMLCanvasElement,
  roomId: string,
  socket: WebSocket,
  selectedButton: string
) {
  console.log("selectedButton", selectedButton);

  let context = canvas.getContext("2d");
  if (!context) {
    console.log("no context");
    return;
  }

  let existingShapes: Shapes[] = await getShapesFromDb(roomId);

  socket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.type == "chat") {
      const parsedData = JSON.parse(message.message);
      existingShapes.push(parsedData.shape);
    }
  };

  let clicked = false;
  let startX = 0;
  let startY = 0;
  clearCanvas(canvas, context, existingShapes);

  const handleMouseDown = (e: MouseEvent) => {
    clicked = true;
    startX = e.clientX;
    startY = e.clientY;
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (clicked) {
      const width = e.clientX - startX;
      const height = e.clientY - startY;

      clearCanvas(canvas, context, existingShapes);

      if (selectedButton === "Rectangle") {
        context.strokeRect(startX, startY, width, height);
      } else if (selectedButton == "Circle") {
        context.beginPath();
        context.ellipse(
          startX + width / 2,
          startY + height / 2,
          width / 2,
          height / 2,
          0,
          0,
          2 * Math.PI
        );
        context.stroke();
      }
    }
  };

  const handleMouseUp = (e: MouseEvent) => {
    clicked = false;
    let shape: Shapes | null = null;
    const width = e.clientX - startX;
    const height = e.clientY - startY;

    if (selectedButton === "Rectangle") {
      shape = {
        type: "Rectangle",
        x: startX,
        y: startY,
        width,
        height,
      };
    } else if (selectedButton === "Circle") {
      shape = {
        type: "Circle",
        x: startX + width / 2,
        y: startY + height / 2,
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

    if (shape.type === selectedButton) {
      existingShapes.push(shape);
      console.log("existingShapes", existingShapes);
      console.log("shapeeee", shape);
    }

    socket.send(
      JSON.stringify({
        type: "chat",
        message: JSON.stringify({
          shape,
        }),
        roomId,
      })
    );
  };

  canvas.addEventListener("mousedown", handleMouseDown);
  canvas.addEventListener("mousemove", handleMouseMove);
  canvas.addEventListener("mouseup", handleMouseUp);

  return () => {
    canvas.removeEventListener("mousedown", handleMouseDown);
    canvas.removeEventListener("mousemove", handleMouseMove);
    canvas.removeEventListener("mouseup", handleMouseUp);
  };
}

export function clearCanvas(
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  existingShapes: Shapes[]
) {
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "rgba(25,25,25)";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = "rgba(255,255,255)";
  existingShapes.forEach((shape) => {
    if (shape.type == "Rectangle") {
      context.strokeRect(shape.x, shape.y, shape.width, shape.height);
    } else if (shape.type == "Circle") {
      context.beginPath();
      context.ellipse(
        shape.x,
        shape.y,
        shape.radiusX,
        shape.radiusY,
        shape.rotation,
        shape.startAngle,
        shape.endAngle
      );
      context.stroke();
    }
  });
}

async function getShapesFromDb(roomId: string) {
  const response = await axios.get(
    `${HTTP_BACKEND}/user/room/chats/${roomId}`,
    {
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    }
  );
  const messages = response.data.messages;

  const shapes = messages.map((x: { message: string }) => {
    const parsedMessage = JSON.parse(x.message);
    return parsedMessage.shape;
  });

  return shapes;
}
