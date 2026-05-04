import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("learning_content")
export class LearningContent {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column("jsonb")
  title!: { en: string; ru: string; kz: string };

  @Column({
    type: "enum",
    enum: ["video", "text", "checklist"],
  })
  type!: "video" | "text" | "checklist";

  @Column("jsonb")
  topic!: { en: string; ru: string; kz: string };

  @Column("jsonb")
  description!: { en: string; ru: string; kz: string };

  @Column({ type: "varchar" })
  duration!: string;

  @Column({ type: "boolean", default: false })
  completed!: boolean;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt!: Date;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
  updatedAt!: Date;
}
