import { Entity, Column, Unique, JoinColumn, OneToOne, ManyToOne, OneToMany } from "typeorm";
import { BaseAddress } from "./BaseAddress";
import { Client } from "./Client";
import { FarmReferece } from "./FarmReferece";
@Entity({ name: 'Farm' })
export class Farm extends BaseAddress {
    @Column({ type: 'varchar', length: 200 })
    farmName: string;
    // @Column({ type: 'varchar', length: 200, nullable: true })
    // passwordResetToken: string;
    @Column({ type: 'varchar', length: 200 })
    fCar: string;
  @ManyToOne(() => Client, (client: Client) => client.uid, { onDelete: 'CASCADE'})
  // `JoinColumn` can be used on both one-to-one and many-to-one relations to specify custom column name
  // or custom referenced column.
  @JoinColumn({ referencedColumnName: "uid", name: 'clientId'/*nome a ser exibido no bd*/ })
  clientId: string;
  @OneToMany(() => FarmReferece, (farmReference: FarmReferece) => farmReference.farmId, {
    // cascade: true,
    // onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
    nullable: true,
    // eager: true
  })
  farmReferences: FarmReferece[];
}
