export type Shapes =
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
    }
  | {
      type: "Diamond";
      x: number;
      y: number;
      width: number;
      height: number;
    }
  | {
      type: "Arrow";
      startX: number;
      startY: number;
      endX: number;
      endY: number;
    }
  | {
      type: "Line";
      startX: number;
      startY: number;
      endX: number;
      endY: number;
    }
  | {
      type: "Pencil";
      strokes: Strokes[];
    }
  | {
      type: "Eraser";
    };

// type Tools = "Rectangle" | "Circle" | "Diamond" | "Arrow" | "Line" | "Pencil";

export type Strokes = {
  x: number;
  y: number;
};
