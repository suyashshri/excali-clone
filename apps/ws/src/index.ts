import { WebSocketServer, WebSocket } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "./config";
import { db } from "@repo/db/client";

import { createServer, Server } from "http";
const server: Server = createServer();
const wss = new WebSocketServer({ noServer: true });
// const wss = new WebSocketServer({ port: 8080 });

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

server.on("upgrade", (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit("connection", ws, request);
  });
});

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

    if (parsedData.type === "join_room") {
      const user = users.find((u) => u.ws === ws);
      user?.rooms.push(parsedData.roomId);
    }

    if (parsedData.type === "leave_room") {
      const user = users.find((u) => u.ws === ws);
      if (!user) {
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
      const parsedMessagetoJSON = JSON.parse(message);

      await db.chat.create({
        data: {
          roomId: roomId,
          messageId: parsedMessagetoJSON.shape.id,
          message,
          userId,
        },
      });

      users.forEach((user) => {
        if (user.rooms.includes(roomId.toString())) {
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

server.listen(8080, () => {
  console.log("WebSocket server running on port 8080");
});
