import ChatRoom from "@/components/ChatRoom";

const page = async ({ params }: { params: { room: string } }) => {
  const room = (await params).room;
  return <ChatRoom roomName={room} />;
};

export default page;
