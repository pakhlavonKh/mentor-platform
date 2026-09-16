import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./User.js";

@Entity("submissions")
export class Submission {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: "userId" })
  user!: User;

  @Column({ type: "uuid" })
  userId!: string;

  @ManyToOne(() => User, { eager: true, nullable: true })
  @JoinColumn({ name: "reviewerId" })
  reviewer?: User | null;

  @Column({ type: "uuid", nullable: true })
  reviewerId?: string | null;

  @Column({ type: "uuid", nullable: true })
  learningContentId?: string | null;

  @Column("jsonb")
  files!: { filename: string; originalName: string; size: number; mimeType: string; path: string; url?: string }[];

  @Column({
    type: "enum",
    enum: ["pending", "in_review", "completed", "rejected"],
    default: "pending",
  })
  status!: "pending" | "in_review" | "completed" | "rejected";

  @Column({ type: "text", nullable: true })
  feedback?: string | null;

  @Column({ type: "varchar", length: 100, nullable: true, default: "motivation_letter" })
  documentType?: string | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  targetUniversity?: string | null;

  @Column({ type: "text", nullable: true })
  studentNotes?: string | null;

  @Column("jsonb", { nullable: true, default: () => "'[]'" })
  feedbackFiles?: { filename: string; originalName: string; size: number; mimeType: string; path: string; url?: string }[] | null;

  @Column({ type: "int", nullable: true })
  rating?: number | null;

  @Column({ type: "timestamp", nullable: true })
  reviewedAt?: Date | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

