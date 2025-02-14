"use client";
import { HTTP_BACKEND, WS_URL } from "@/app/config";
import axios from "axios";
import React, { useEffect, useState } from "react";
import Canvas from "./Canvas";
import { useSearchParams } from "next/navigation";

const ChatRoom = ({ roomName }: { roomName: string }) => {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);

  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoomId = async (roomName: string) => {
      if (id) {
        setUserId(id);
      }
      const token = localStorage.getItem("token");
      const slug = roomName;

      if (!token || !userId) return;
      try {
        const response = await axios.get(
          `${HTTP_BACKEND}/user/room/${slug}?id=${userId}`,
          {
            headers: {
              Authorization: token,
            },
          }
        );

        if (response.status == 200) {
          const roomId = response.data.room.id.toString();
          setRoomId(roomId);

          if (!roomId) {
            return;
          }
          const ws = new WebSocket(`${WS_URL}?token=${token.split(" ")[1]}`);
          ws.onopen = () => {
            setSocket(ws);

            const data = JSON.stringify({
              type: "join_room",
              roomId,
            });

            ws.send(data);
          };
        }
      } catch (error) {
        console.log("error in finding roomID", error);
        return;
      }
    };
    fetchRoomId(roomName);
  }, [roomName, userId]);

  if (!socket || !userId) {
    // router.push("/sign-up");
    return <div>Loading...</div>;
  }

  return <Canvas roomId={roomId!} socket={socket} />;
};

export default ChatRoom;
