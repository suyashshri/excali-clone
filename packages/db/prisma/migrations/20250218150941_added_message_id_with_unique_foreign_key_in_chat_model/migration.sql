/*
  Warnings:

  - A unique constraint covering the columns `[roomId,messageId]` on the table `Chat` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Chat_roomId_messageId_key" ON "Chat"("roomId", "messageId");
