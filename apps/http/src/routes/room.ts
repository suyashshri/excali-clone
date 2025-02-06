import { CreateRoomSchema } from "@repo/backend-common/types";
import { db } from "@repo/db/client";
import { Router } from "express";
import { middleware } from "../middleware";

const roomRouter: Router = Router();

roomRouter.post("/", middleware, async (req, res) => {
  const data = req.body;
  const parsedData = CreateRoomSchema.safeParse(data);

  if (!parsedData.success) {
    res.json({ message: "Please enter valid room name" }).status(422);
    return;
  }
  const userId = req.userId;
  if (!userId) {
    res.json({ message: "Unautorized" }).status(401);
    return;
  }
  try {
    const room = await db.room.create({
      data: {
        slug: parsedData.data.name,
        adminId: userId,
      },
    });
    res.json({ roomId: room.id }).status(200);
  } catch (error) {
    console.log("Error creating room: ", error);
    res.json({
      message: "Unable to create the room",
    });
  }
});

roomRouter.get("/chats/:roomId", middleware, async (req, res) => {
  try {
    const roomId = Number(req.params.roomId);
    const messages = await db.chat.findMany({
      where: {
        roomId: roomId,
      },
      orderBy: {
        id: "desc",
      },
      take: 100,
    });
    res.json({
      messages,
    });
  } catch (error) {
    console.log("Error getting messages: ", error);
    res.json({
      message: [],
    });
  }
});

roomRouter.get("/", middleware, async (req, res) => {
  try {
    const rooms = await db.room.findMany({
      where: {
        adminId: req.userId,
      },
      select: {
        id: true,
        slug: true,
        createdAt: true,
      },
    });
    if (!rooms) {
      res.json({
        rooms: [],
      });
    } else {
      res.json({
        rooms: rooms,
      });
    }
  } catch (error) {
    console.log("Error in fetching rooms for user");
    res.json({ error }).status(402);
  }
});

roomRouter.get("/:slug", middleware, async (req, res) => {
  const slug = req.params.slug;
  const id = req.query.id as string | undefined;

  try {
    const room = await db.room.findFirst({
      where: {
        slug,
        adminId: id,
      },
      select: {
        id: true,
      },
    });

    if (!room) {
      res
        .json({
          message: "No room found with this Name",
        })
        .status(402);
      return;
    }
    res
      .json({
        room,
      })
      .status(200);
  } catch (error) {
    console.log("error fetching roomId for this room Name", error);
    res
      .json({
        message: "No room found with this Name",
      })
      .status(402);
  }
});

export default roomRouter;
