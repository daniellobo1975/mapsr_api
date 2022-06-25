import { Entity, Column, Unique, JoinColumn, OneToOne, ManyToOne, OneToMany } from "typeorm";
import { BaseEntity } from "./BaseEntity";
import { Farm } from "./Farm";
import { FarmReferece } from "./FarmReferece";
@Entity({ name: 'farmDefaultReference' })
export class farmDefaultReference extends BaseEntity {
  @OneToOne(() => Farm, (farm: Farm) => farm.uid, { eager: false})
  // `JoinColumn` can be used on both one-to-one and many-to-one relations to specify custom column name
  // or custom referenced column.
  @JoinColumn({ referencedColumnName: "uid", name: 'farmId'/*nome a ser exibido no bd*/ })
  farmId: string;
  @OneToOne(() => FarmReferece, (farmRef: FarmReferece) => farmRef.uid,  { eager: true})
  // `JoinColumn` can be used on both one-to-one and many-to-one relations to specify custom column name
  // or custom referenced column.
  @JoinColumn({ referencedColumnName: "uid", name: 'defaultReference'/*nome a ser exibido no bd*/ })
  defaultReference: string;
}
