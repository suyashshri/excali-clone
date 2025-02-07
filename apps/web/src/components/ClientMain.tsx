"use client";

import { usePathname } from "next/navigation";

export default function ClientMain({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isRoomRoute = pathname?.startsWith("/room");

  return (
    <main className={isRoomRoute ? "" : "container mx-auto px-4 py-8"}>
      {children}
    </main>
  );
}
