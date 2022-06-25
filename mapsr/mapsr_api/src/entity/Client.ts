import { Entity, Column, Unique, JoinColumn, OneToOne, OneToMany } from "typeorm";
import { BaseAddress } from "./BaseAddress";
import { Farm } from "./Farm";
@Entity({ name: 'Client' })
export class Client extends BaseAddress {
    @Column({ type: 'varchar', length: 200})
    clientName: string;
    @Column({ type: 'varchar', length: 200, nullable: true })
    photo: string;
    @Column({ type: 'varchar', length: 100, unique: true })
    email: string;
    @Column({ type: 'varchar', length: 200, nullable: true })
    phone: string;
  @OneToMany(() => Farm, (farm: Farm) => farm.clientId, {
    // cascade: true,
    // onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
    nullable: true,
    eager: true
  })
  clientFarms: Farm[];
}
