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

// export function debounce(func: Function, wait: number) {
//   let timeout: ReturnType<typeof setTimeout> | null = null;
//   return function (this: any, ...args: any[]) {
//     if (timeout !== null) {
//       clearTimeout(timeout);
//     }
//     timeout = setTimeout(() => func.apply(this, args), wait);
//   };
// }

export function debounce(func: Function, delay: number) {
  let timer: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func(...args);
    }, delay);
  };
}
