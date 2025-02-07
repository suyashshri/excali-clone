import { CheckUser } from "@/components/CheckUser";

const page = async ({ params }: { params: { room: string } }) => {
  let room = (await params).room;
  room = room.split("_").join(" ");

  return <CheckUser room={room} />;
};

export default page;
