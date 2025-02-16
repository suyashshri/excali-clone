export type Shapes =
  | {
      id?: string;
      type: "Rectangle";
      x: number;
      y: number;
      width: number;
      height: number;
    }
  | {
      id?: string;

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
      id?: string;

      type: "Diamond";
      x: number;
      y: number;
      width: number;
      height: number;
    }
  | {
      id?: string;

      type: "Arrow";
      startX: number;
      startY: number;
      endX: number;
      endY: number;
    }
  | {
      id?: string;

      type: "Line";
      startX: number;
      startY: number;
      endX: number;
      endY: number;
    }
  | {
      id?: string;

      type: "Pencil";
      strokes: Strokes[];
    }
  | {
      id?: string;

      type: "Eraser";
    };

// type Tools = "Rectangle" | "Circle" | "Diamond" | "Arrow" | "Line" | "Pencil";

export type Strokes = {
  x: number;
  y: number;
};
