import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./User.js";

@Entity("orders")
export class Order {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: "userId" })
  user!: User;

  @Column({ type: "uuid" })
  userId!: string;

  @Column({ type: "uuid" })
  pricingPlanId!: string;

  @Column({ type: "jsonb", nullable: true })
  submissionIds?: string[] | null;

  @Column({ type: "numeric", default: 0 })
  price!: number;

  @Column({ type: "int", default: 1 })
  documents!: number;

  @Column({ type: "enum", enum: ["pending", "in_review", "completed", "failed"], default: "pending" })
  status!: "pending" | "in_review" | "completed" | "failed";

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
