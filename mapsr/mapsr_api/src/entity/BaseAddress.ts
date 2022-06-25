
import { Column } from "typeorm";
import { BaseEntity } from "./BaseEntity";

export abstract class BaseAddress extends BaseEntity {

    @Column({ type: 'varchar', length: 9, nullable: true  })
    addressCEP: string;

    @Column({ type: 'varchar', length: 200, nullable: true  })
    addressPlace: string;

    @Column({ type: 'int', nullable: true })
    addressNumber: number;

    @Column({ type: 'varchar', length: 200, nullable: true })
    addressDistrict: string;

    @Column({ type: 'varchar', length: 200, nullable: true })
    addressComplement: string;

    @Column({ type: 'varchar', length: 100, nullable: true  })
    addressCity: string;
}