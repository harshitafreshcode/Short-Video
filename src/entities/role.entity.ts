import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Unique, OneToMany, OneToOne, JoinColumn, DeleteDateColumn, ManyToMany, JoinTable } from "typeorm"
import { User } from "./user.entity";
import { Permission } from "./permissions.entity";


@Entity({ name: "role" })
export class Role {
    @PrimaryGeneratedColumn('increment')
    'id': number

    @Column()
    'role_name': string

    @Column({ default: 1 })
    'status': number

    // @ManyToMany(() => User, user => user.roles)
    // "users": User[];

    @ManyToMany(() => Permission)
    @JoinTable({name:"role_permissions"})
    "permissions": Permission[];
      
    @CreateDateColumn({ nullable: true, default: () => 'CURRENT_TIMESTAMP' })
    'created_date': Date

    @UpdateDateColumn({ name: 'updated_date' })
    'updated_date': Date;

    @DeleteDateColumn({ name: 'deleted_at' })
    "deleted_at": Date


}