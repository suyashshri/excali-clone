import { CheckUser } from "@/components/CheckUser";
export type paramsType = Promise<{ room: string }>;
export default async function RoomPage({ params }: { params: paramsType }) {
  let { room } = await params;
  room = room.split("_").join(" ");

  return <CheckUser room={room} />;
}
