import { Entity, Column, Unique, JoinColumn, OneToOne, ManyToOne, OneToMany } from "typeorm";
import { BaseEntity } from "./BaseEntity";
import { Client } from "./Client";
import { statusQueryReport } from "./enum/statusQueryReport";
import { FarmReferece } from "./FarmReferece";
// import { Stores } from "./Stores";
@Entity({ name: 'queryReport' })
export class queryReport extends BaseEntity {
    @Column({ type: "enum", enum: statusQueryReport, nullable: true })
    status: statusQueryReport;
    @Column({ type: 'varchar', length: 2000, nullable: true })
    observation: string;
    @OneToOne(() => FarmReferece, (farmRef: FarmReferece) => farmRef.uid, {eager: true})
    // `JoinColumn` can be used on both one-to-one and many-to-one relations to specify custom column name
    // or custom referenced column.
    @JoinColumn({ referencedColumnName: "uid", name: 'farmRef'/*nome a ser exibido no bd*/ })
    farmRef: string;
    @Column({ type: 'varchar', length: 200, nullable: true })
    result_csv: string;
    @Column({ type: 'varchar', length: 200, nullable: true })
    result_mapPdf: string;
    @Column({ type: 'varchar', length: 200, nullable: true })
    result_shapefile_shp: string;
    @Column({ type: 'varchar', length: 200, nullable: true })
    result_shapefile_prj: string;
    @Column({ type: 'varchar', length: 200, nullable: true })
    result_shapefile_dfb: string;
    @Column({ type: 'varchar', length: 200, nullable: true })
    result_shapefile_shx: string;


}
