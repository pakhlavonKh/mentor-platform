import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

export interface LearningFile {
  url: string;
  mimeType: string;
  name: string;
}

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

  @Column({ type: "varchar", nullable: true })
  fileUrl!: string; // Primary file URL/path (for backward compatibility)

  @Column({ type: "varchar", nullable: true })
  thumbnailUrl!: string; // Preview image for videos

  @Column({ type: "varchar" })
  mimeType!: string; // e.g., "video/mp4", "application/pdf", "image/jpeg"

  @Column("jsonb", { nullable: true })
  files?: LearningFile[]; // Array of additional supporting files

  @Column({ type: "boolean", default: false })
  completed!: boolean;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt!: Date;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
  updatedAt!: Date;
}
