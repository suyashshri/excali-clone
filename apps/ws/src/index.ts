import { WebSocketServer, WebSocket } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "./config";
import { db } from "@repo/db/client";

const wss = new WebSocketServer({ port: 8080 });

enum Role {
  User,
  Admin,
}

interface User {
  ws: WebSocket;
  role: Role;
  userId: string;
  rooms: string[];
}

const users: User[] = [];

function authenticateUser(token: string): string | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (typeof decoded == "string") {
      return null;
    }
    if (!decoded || !decoded.userId) {
      return null;
    }
    return decoded.userId;
  } catch (e) {
    return null;
  }
}

wss.on("connection", (ws, request) => {
  const url = request.url;

  if (!url) {
    ws.close();
    return;
  }
  const queryParams = new URLSearchParams(url.split("?")[1]);
  const token = queryParams.get("token") || "";
  const userId = authenticateUser(token);

  if (!userId) {
    ws.close();
    return;
  }
  users.push({
    ws,
    role: Role.User,
    userId,
    rooms: [],
  });

  ws.on("message", async (data) => {
    let parsedData;

    if (typeof data != "string") {
      parsedData = JSON.parse(data.toString());
    } else {
      parsedData = JSON.parse(data);
    }

    // if (parsedData.type === "create_room") {
    //   users.push({
    //     ws,
    //     role: Role.Admin,
    //     userId,
    //     rooms: [],
    //   });
    // }

    if (parsedData.type === "join_room") {
      const user = users.find((u) => u.ws === ws);
      // if()
      user?.rooms.push(parsedData.roomId);
    }

    if (parsedData.type === "leave_room") {
      const user = users.find((u) => u.ws === ws);
      if (!user) {
        // users.push({ ws, role: Role.User, userId, rooms: [parsedData.roomId] });
        return;
      } else {
        if (!user.rooms.includes(parsedData.roomId)) {
          user.rooms.push(parsedData.roomId);
        }
      }
      // const user = users.find((u) => u.ws === ws);
      // if (!user) {
      //   return;
      // }
      // user.rooms = user.rooms.filter((u) => u === parsedData.roomId);
    }

    if (parsedData.type === "chat") {
      const roomId = Number(parsedData.roomId);
      const message = parsedData.message;
      console.log("inside chat from ws", roomId, message);

      await db.chat.create({
        data: {
          roomId: roomId,
          message,
          userId,
        },
      });

      users.forEach((user) => {
        if (user.rooms.includes(roomId.toString())) {
          console.log(
            "inside for each sending to other user from ws",
            user.userId
          );

          if (ws !== user.ws) {
            user.ws.send(
              JSON.stringify({
                type: "chat",
                roomId: roomId,
                message: message,
              })
            );
          }
        }
      });
    }
  });
});
