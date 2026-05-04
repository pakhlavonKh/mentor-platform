import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("grants")
export class Grant {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column("jsonb")
  title!: { en: string; ru: string; kz: string };

  @Column({ type: "varchar" })
  country!: string;

  @Column({
    type: "enum",
    enum: ["bachelor", "master", "internship", "phd"],
  })
  type!: "bachelor" | "master" | "internship" | "phd";

  @Column({
    type: "enum",
    enum: ["full", "partial"],
  })
  funding!: "full" | "partial";

  @Column({ type: "varchar" })
  deadline!: string;

  @Column("jsonb")
  description!: { en: string; ru: string; kz: string };

  @Column({ type: "varchar" })
  link!: string;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt!: Date;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
  updatedAt!: Date;
}
