import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("learning_content")
export class LearningContent {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  title!: string;

  @Column({
    type: "enum",
    enum: ["video", "text", "checklist"],
  })
  type!: "video" | "text" | "checklist";

  @Column()
  topic!: string;

  @Column("text")
  description!: string;

  @Column()
  duration!: string;

  @Column({ default: false })
  completed!: boolean;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt!: Date;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
  updatedAt!: Date;
}
