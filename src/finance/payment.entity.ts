import { Training } from "../training/training.entity";
import { User } from "../user/user.entity";
import { Column, Entity, JoinColumn, JoinTable, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Payment 
{
    @PrimaryGeneratedColumn()
    id: number;
    @Column( { nullable : false } )
    amount: number;
    @Column()
    time: Date;
    @Column()
    status: string; // Paid | Pending
    @Column()
    description : string; // E.g. Edzés, Gyakorló Jégcsarnok 2021.04.18. 9:00
    @Column( { nullable: true })
    notes: string; // E.g. Credentials of deleted user
    @ManyToOne( () => User, user => user.payments, { eager: true, nullable: true,  onDelete: "SET NULL" } )
    @JoinTable()
    user: User; 
    @ManyToOne( () => Training, training => training.payments, { nullable: true,  onDelete: "SET NULL" })
    @JoinColumn()
    training: Training;
}
