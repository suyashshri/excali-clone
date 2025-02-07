import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/context/auth-context";

interface Room {
  id: string;
  slug: string;
  createdAt?: Date;
}

interface RoomCardProps {
  room: Room;
}

export default function RoomCard({ room }: RoomCardProps) {
  const { userId } = useAuth();
  console.log(userId);

  const slug = room.slug.split(" ").join("_");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{room.slug}</CardTitle>
      </CardHeader>
      <CardContent>
        <Button asChild>
          <Link href={`/room/${slug}?id=${userId}`}>
            Enter Room <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
