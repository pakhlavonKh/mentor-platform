import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

export type CalendarCategory = "grant_deadline" | "event" | "application" | "platform";

@Entity("calendar_events")
export class CalendarEvent {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column("jsonb")
  title!: { en: string; ru: string; kz: string };

  @Column("jsonb", { nullable: true })
  description?: { en: string; ru: string; kz: string } | null;

  /** ISO date string YYYY-MM-DD */
  @Column({ type: "varchar" })
  date!: string;

  @Column({
    type: "enum",
    enum: ["grant_deadline", "event", "application", "platform"],
    default: "event",
  })
  category!: CalendarCategory;

  @Column({ type: "varchar", nullable: true })
  link?: string | null;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt!: Date;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
  updatedAt!: Date;
}
