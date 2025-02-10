import { CanvasProvider } from "@/context/canvas-context";

export default function RoomLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <CanvasProvider>{children}</CanvasProvider>
    </>
  );
}
