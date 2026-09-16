import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity("telegram_chats")
export class TelegramChat {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", unique: true })
  chatId!: string;

  @Column({ type: "varchar" })
  chatType!: "group" | "supergroup" | "channel" | "private";

  @Column({ type: "varchar", nullable: true })
  title?: string | null;

  @Column({
    type: "enum",
    enum: ["management", "channel", "general"],
    default: "management",
  })
  purpose!: "management" | "channel" | "general";

  @Column({ type: "boolean", default: true })
  isActive!: boolean;

  @Column({ type: "varchar", nullable: true })
  registeredByUserId?: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
