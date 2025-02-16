"use client";
import { useCanvas } from "@/context/canvas-context";
import { Game } from "@/Game-Logic/Game";
import {
  ArrowRight,
  Circle,
  Diamond,
  Eraser,
  Minus,
  Pencil,
  RectangleHorizontal,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ToastContainer, toast, Bounce } from "react-toastify";

export default function Canvas({
  roomId,
  socket,
}: {
  roomId: string;
  socket: WebSocket;
}) {
  const canvasref = useRef<HTMLCanvasElement>(null);
  const { selectedButton, setSelectedButton } = useCanvas();
  // const [game, setGame] = useState<Game>();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (canvasref.current) {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
      const g = new Game(canvasref.current, roomId, socket, selectedButton);
      // setGame(g);

      return () => {
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
        <button
          className={
            selectedButton === "Diamond"
              ? "w-10 h-10 rounded bg-cyan-600 flex justify-center items-center"
              : "w-10 h-10 rounded flex justify-center items-center hover:bg-gray-800"
          }
          onClick={() => setSelectedButton("Diamond")}
        >
          <Diamond className="text-white" />
        </button>
        <button
          className={
            selectedButton === "Arrow"
              ? "w-10 h-10 rounded bg-cyan-600 flex justify-center items-center"
              : "w-10 h-10 rounded flex justify-center items-center hover:bg-gray-800"
          }
          onClick={() => setSelectedButton("Arrow")}
        >
          <ArrowRight className="text-white" />
        </button>
        <button
          className={
            selectedButton === "Line"
              ? "w-10 h-10 rounded bg-cyan-600 flex justify-center items-center"
              : "w-10 h-10 rounded flex justify-center items-center hover:bg-gray-800"
          }
          onClick={() => setSelectedButton("Line")}
        >
          <Minus className="text-white" />
        </button>
        <button
          className={
            selectedButton === "Pencil"
              ? "w-10 h-10 rounded bg-cyan-600 flex justify-center items-center"
              : "w-10 h-10 rounded flex justify-center items-center hover:bg-gray-800"
          }
          onClick={() => setSelectedButton("Pencil")}
        >
          <Pencil className="text-white" />
        </button>
        <button
          className={
            selectedButton === "Eraser"
              ? "w-10 h-10 rounded bg-cyan-600 flex justify-center items-center"
              : "w-10 h-10 rounded flex justify-center items-center hover:bg-gray-800"
          }
          onClick={() => setSelectedButton("Eraser")}
        >
          <Eraser className="text-white" />
        </button>
      </div>
      <button
        className="fixed top-6 right-8 bg-sky-600 px-4 py-2 rounded-md hover:bg-sky-200 hover:text-black"
        onClick={() => {
          navigator.clipboard
            .writeText(window.location.href)
            .then(() => {
              toast.success("Copied to Clipboard", {
                position: "bottom-right",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
                transition: Bounce,
              });
            })
            .catch(() =>
              toast.error("Unable to Copy", {
                position: "bottom-right",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
                transition: Bounce,
              })
            );
        }}
      >
        Share Your Canvas
      </button>
      <ToastContainer />
    </div>
  );
}
