import { Entity, Column, Unique, JoinColumn, OneToOne } from "typeorm";
import { BaseEntity } from "./BaseEntity";
@Entity({ name: 'User' })
export class User extends BaseEntity {
    @Column({ type: 'varchar', length: 200, nullable: true })
    attendantName: string;
    @Column({ type: 'varchar', length: 200, nullable: true })
    photo: string;
    @Column({ type: 'varchar',select: false, length: 200, nullable: true })
    passwordResetToken: string;
    @Column({ type: "timestamptz",select: false, nullable: true })
    passwordResetExpires: Date;
    @Column({ type: 'varchar', length: 100, unique: true })
    email: string;
    @Column({ select: false, type: 'varchar', length: 100 })
    password: string;
    @Column({ default: false, nullable: true })
    isRoot: boolean;
}
