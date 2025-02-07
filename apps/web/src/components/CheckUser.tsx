"use client";
import ChatRoom from "./ChatRoom";
import { useRouter } from "next/navigation";

export const CheckUser = ({ room }: { room: string }) => {
  const router = useRouter();
  const token = localStorage.getItem("token");
  if (!token) {
    router.push("/sign-up");
  }

  return <ChatRoom roomName={room} />;
};
