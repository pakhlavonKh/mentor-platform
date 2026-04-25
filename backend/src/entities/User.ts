import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable } from "typeorm";
import { Grant } from "./Grant.js";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column()
  firstName!: string;

  @Column()
  lastName!: string;

  @Column({
    type: "enum",
    enum: ["admin", "mentor", "student"],
    default: "student",
  })
  role!: "admin" | "mentor" | "student";

  @Column({ default: true })
  isActive!: boolean;

  @Column({ type: "text", nullable: true })
  profilePicture?: string | null;

  @ManyToMany(() => Grant, { eager: false })
  @JoinTable({ name: "user_saved_grants" })
  savedGrants?: Grant[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
