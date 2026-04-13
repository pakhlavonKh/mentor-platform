import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("pricing_plans")
export class PricingPlan {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column("jsonb")
  name!: { en: string; ru: string; kz: string };

  @Column()
  documents!: number;

  @Column()
  price!: number;

  @Column("jsonb")
  features!: { en: string[]; ru: string[]; kz: string[] };

  @Column({ default: false })
  popular!: boolean;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt!: Date;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
  updatedAt!: Date;
}
