// @ManyToMany(() => Friend)
//   @JoinTable({
//     name: 'user_friend',
//     joinColumn: { name: 'user_id', referencedColumnName: 'id' },
//     inverseJoinColumn: { name: 'friend_id', referencedColumnName: 'id' },
//   })
//   friends: Friend[];


import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Unique, OneToMany, OneToOne, JoinColumn, DeleteDateColumn, ManyToOne, ManyToMany, JoinTable, BeforeInsert } from "typeorm"
import { Role } from "./role.entity"
const bcrypt = require('bcrypt');

@Entity({ name: "user" })
export class User {
    @PrimaryGeneratedColumn('increment')
    'id': number

    @Column()
    'first_name': string

    @Column()
    'last_name': string

    @Column({ unique: true })
    'email': string

    @Column()
    'phone': string

    @Column()
    'password': string
    @BeforeInsert()
    async hashPassword() {
        if (this.password) {
            console.log(this.password, '***************');
            this.password = await bcrypt.hash(this.password, 10);
        }
    }

    @ManyToOne(() => Role, role => role.id, { cascade: true, onDelete: 'CASCADE', eager: true })
    @JoinColumn({ name: "role_id" })
    "role": Role

    @Column({ default: 1 })
    'status': number

    @CreateDateColumn({ nullable: true, default: () => 'CURRENT_TIMESTAMP' })
    'created_date': Date

    @UpdateDateColumn({ name: 'updated_date' })
    'updated_date': Date;

    @DeleteDateColumn({ name: 'deleted_at' })
    "deleted_at": Date


}