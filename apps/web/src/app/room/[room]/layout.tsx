export default function RoomLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  console.log("Room Layout Loaded");

  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
