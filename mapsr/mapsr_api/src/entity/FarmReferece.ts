import { Entity, Column, Unique, JoinColumn, OneToOne, ManyToOne } from "typeorm";
import { BaseEntity } from "./BaseEntity";
import { Farm } from "./Farm";
import { User } from "./User";
@Entity({ name: 'FarmReferece' })
export class FarmReferece extends BaseEntity {
    @Column({ type: 'varchar', length: 200 })
    referenceName: string;
    @ManyToOne(() => Farm, (farm: Farm) => farm.uid, { onDelete: 'CASCADE', eager: true})
    // `JoinColumn` can be used on both one-to-one and many-to-one relations to specify custom column name
    // or custom referenced column.
    @JoinColumn({ referencedColumnName: "uid", name: 'farmId'/*nome a ser exibido no bd*/ })
    farmId: string;

    @Column({ type: 'varchar', length: 200 })
    car_shp: string;
    @Column({ type: 'varchar', length: 200 , nullable: true})
    car_shx: string;
    @Column({ type: 'varchar', length: 200, nullable: true})
    car_prj: string;
    @Column({ type: 'varchar', length: 200, nullable: true })
    car_dfb: string;


    @Column({ type: 'varchar', length: 200 })
    app_shp: string;
    @Column({ type: 'varchar', length: 200 , nullable: true})
    app_shx: string;
    @Column({ type: 'varchar', length: 200, nullable: true})
    app_prj: string;
    @Column({ type: 'varchar', length: 200, nullable: true })
    app_dfb: string;

 
    @Column({ type: 'varchar', length: 200, nullable: true })
    biomas: string;
    // @Column({ default: false, nullable: true })
    // isDefault: boolean;

    @ManyToOne(() => User, (user: User) => user.uid, { onDelete: 'CASCADE'})
    // `JoinColumn` can be used on both one-to-one and many-to-one relations to specify custom column name
    // or custom referenced column.
    @JoinColumn({ referencedColumnName: "uid", name: 'requestingUser'/*nome a ser exibido no bd*/ })
    requestingUser: string;

}
