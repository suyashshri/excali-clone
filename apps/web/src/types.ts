type Shapes =
  | {
      type: "Rectangle";
      x: number;
      y: number;
      width: number;
      height: number;
    }
  | {
      type: "Circle";
      x: number;
      y: number;
      radiusX: number;
      radiusY: number;
      rotation: number;
      startAngle: number;
      endAngle: number;
    };

type Tools = "Rectangle" | "Circle";
