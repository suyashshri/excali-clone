export function initDraw(
  canvas: HTMLCanvasElement,
  selectedTool = "Rectangle",
  roomId: string,
  socket: WebSocket
) {
  let context = canvas.getContext("2d");
  if (!context) {
    console.log("no context");
    return;
  }

  socket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.type == "chat") {
      const parsedData = JSON.parse(message.message);
      existingShapes.push(parsedData.shape);
      clearCanvas(canvas, context);
      getShapes(context, existingShapes);
    }
  };

  clearCanvas(canvas, context);
  let existingShapes: Shapes[] = [];
  let clicked = false;
  let startX = 0;
  let startY = 0;

  const handleMouseDown = (e: MouseEvent) => {
    clicked = true;
    startX = e.clientX;
    startY = e.clientY;
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (clicked) {
      const width = e.clientX - startX;
      const height = e.clientY - startY;

      clearCanvas(canvas, context);

      if (selectedTool === "Rectangle") {
        context.strokeRect(startX, startY, width, height);
      } else if (selectedTool == "Circle") {
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
      getShapes(context, existingShapes);
    }
  };

  const handleMouseUp = (e: MouseEvent) => {
    clicked = false;
    let shape: Shapes | null = null;
    const width = e.clientX - startX;
    const height = e.clientY - startY;

    shape = {
      type: "Rectangle",
      x: startX,
      y: startY,
      width,
      height,
    };
    if (!shape) {
      return;
    }

    existingShapes.push(shape);
    console.log(existingShapes);

    socket.send(
      JSON.stringify({
        type: "chat",
        message: JSON.stringify({
          shape,
        }),
        roomId,
      })
    );

    // socket.send(
    //   JSON.stringify({
    //     type: "chat",
    //     roomId,
    //     messgae: JSON.stringify({ data }),
    //   })
    // );

    getShapes(context, existingShapes);
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
  context: CanvasRenderingContext2D
) {
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "rgba(25,25,25)";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = "rgba(255,255,255)";
}

export function getShapes(
  context: CanvasRenderingContext2D,
  existingShapes: Shapes[]
) {
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
