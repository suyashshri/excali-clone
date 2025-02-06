"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import AddRoomModal from "@/components/Add-room-modal";
import RoomCard from "@/components/Room-card";
import axios from "axios";
import { HTTP_BACKEND } from "../config";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";

interface Room {
  id: string;
  slug: string;
  createdAt?: Date;
}

export default function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const handleAddRoom = async (roomName: string) => {
    try {
      const room = await axios.post(
        `${HTTP_BACKEND}/user/room`,
        {
          name: roomName,
        },
        {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        }
      );
      const newRoom: Room = {
        id: room.data.roomId,
        slug: roomName,
        createdAt: new Date(),
      };
      setRooms((prevRooms) => [...prevRooms, newRoom]);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error creating room:", error);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/sign-in");
      return;
    }
    const fetchRooms = async () => {
      try {
        const response = await axios.get(`${HTTP_BACKEND}/user/room`, {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        });
        setRooms(response.data.rooms);
      } catch (error) {
        console.error("Error fetching rooms:", error);
      }
    };
    fetchRooms();
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    console.log("hello from null");

    return null; // or a loading spinner
  }

  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Room
        </Button>
      </div>

      {rooms.length === 0 ? (
        <p className="text-center text-gray-500 mt-8">
          No rooms created yet. Click "Add Room" to get started!
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {rooms.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
      )}

      <AddRoomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddRoom={handleAddRoom}
      />
    </div>
  );
}
