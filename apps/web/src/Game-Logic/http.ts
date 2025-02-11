import { HTTP_BACKEND } from "@/app/config";
import axios from "axios";

export async function getExistingShapes(roomId: string) {
  const response = await axios.get(
    `${HTTP_BACKEND}/user/room/chats/${roomId}`,
    {
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    }
  );
  const messages = response.data.messages;

  const shapes = messages.map((x: { message: string }) => {
    const parsedMessage = JSON.parse(x.message);
    return parsedMessage.shape;
  });

  return shapes;
}
