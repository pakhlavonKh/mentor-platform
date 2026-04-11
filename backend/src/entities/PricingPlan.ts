import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("pricing_plans")
export class PricingPlan {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  name!: string;

  @Column()
  documents!: number;

  @Column()
  price!: number;

  @Column("simple-array")
  features!: string[];

  @Column({ default: false })
  popular!: boolean;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt!: Date;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
  updatedAt!: Date;
}
