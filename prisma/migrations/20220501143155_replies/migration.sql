-- AlterTable
ALTER TABLE `ChatMessage` ADD COLUMN `reply_to_id` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `ChatMessage` ADD CONSTRAINT `ChatMessage_reply_to_id_fkey` FOREIGN KEY (`reply_to_id`) REFERENCES `ChatMessage`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
