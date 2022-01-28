/*
  Warnings:

  - A unique constraint covering the columns `[user_id,message_id]` on the table `ChatMessageReadConfirmation` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[friendship_id]` on the table `Conversation` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[party_id]` on the table `Conversation` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `ChatMessageReadConfirmation_user_id_message_id_key` ON `ChatMessageReadConfirmation`(`user_id`, `message_id`);

-- CreateIndex
CREATE UNIQUE INDEX `Conversation_friendship_id_key` ON `Conversation`(`friendship_id`);

-- CreateIndex
CREATE UNIQUE INDEX `Conversation_party_id_key` ON `Conversation`(`party_id`);
