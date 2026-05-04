import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("telegram_posts")
export class TelegramPost {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column("jsonb")
  title!: { en: string; ru: string; kz: string };

  @Column("jsonb")
  description!: { en: string; ru: string; kz: string };

  @Column({ type: "varchar" })
  source!: string;

  @Column({ type: "varchar" })
  link!: string;

  @Column({ type: "varchar" })
  date!: string;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt!: Date;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
  updatedAt!: Date;
}
