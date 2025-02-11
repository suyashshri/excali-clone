"use client";
import { useCanvas } from "@/context/canvas-context";
import { Game } from "@/Game-Logic/Game";
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
  const { selectedButton, setSelectedButton } = useCanvas();
  const [game, setGame] = useState<Game>();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (canvasref.current) {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
      const g = new Game(canvasref.current, roomId, socket, selectedButton);
      setGame(g);

      return () => {
        console.log("Cleaning up event listeners from Canvas.tsx");
        g.destroy();
      };
    }
  }, [selectedButton, roomId, socket]);

  return (
    <div className="overflow-hidden relative">
      <canvas
        ref={canvasref}
        width={dimensions.width}
        height={dimensions.height}
      ></canvas>
      <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-gray-700 px-2 py-4 rounded-md h-12 z-10 flex gap-2 justify-center items-center">
        <button
          className={
            selectedButton === "Rectangle"
              ? "w-10 h-10 rounded bg-cyan-600 flex justify-center items-center"
              : "w-10 h-10 rounded flex justify-center items-center hover:bg-gray-800"
          }
          onClick={() => setSelectedButton("Rectangle")}
        >
          <RectangleHorizontal className="text-white" />
        </button>
        <button
          className={
            selectedButton === "Circle"
              ? "w-10 h-10 rounded bg-cyan-600 flex justify-center items-center"
              : "w-10 h-10 rounded flex justify-center items-center hover:bg-gray-800"
          }
          onClick={() => setSelectedButton("Circle")}
        >
          <Circle className="text-white" />
        </button>
      </div>
    </div>
  );
}
