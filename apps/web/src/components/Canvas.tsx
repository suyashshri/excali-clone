"use client";
import { initDraw } from "@/Game-Logic/Game";
import { Circle, RectangleHorizontal } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function Canvas({
  roomId,
  socket,
}: {
  roomId: string;
  socket: WebSocket;
}) {
  const canvasref = useRef<HTMLCanvasElement>(null);
  const [selectedTool, setSelecetedTool] = useState<"Rectangle" | "Circle">(
    "Rectangle"
  );

  useEffect(() => {
    if (canvasref.current) {
      initDraw(canvasref.current, selectedTool, roomId, socket);
    }
  }, []);
  return (
    <div className="overflow-hidden relative">
      <canvas
        ref={canvasref}
        width={window.innerWidth}
        height={window.innerHeight}
      ></canvas>
      <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-gray-700 px-2 py-4 rounded-md h-12 z-10 flex gap-2 justify-center items-center">
        <button
          className={
            selectedTool === "Rectangle"
              ? "w-10 h-10 rounded bg-cyan-600 flex justify-center items-center"
              : "w-10 h-10 rounded flex justify-center items-center hover:bg-gray-800"
          }
          onClick={() => setSelecetedTool("Rectangle")}
        >
          <RectangleHorizontal className="text-white" />
        </button>
        <button
          className={
            selectedTool === "Circle"
              ? "w-10 h-10 rounded bg-cyan-600 flex justify-center items-center"
              : "w-10 h-10 rounded flex justify-center items-center hover:bg-gray-800"
          }
          onClick={() => setSelecetedTool("Circle")}
        >
          <Circle className="text-white" />
        </button>
      </div>
    </div>
  );
}
