"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";

export default function ClientHeader() {
  const pathname = usePathname();
  const isRoomRoute = pathname?.startsWith("/room");

  if (isRoomRoute) return null;

  return <Header />;
}
