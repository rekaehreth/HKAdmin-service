import { User } from "src/user/user.entity";
import { Column, Entity, JoinTable, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Payment 
{
    @PrimaryGeneratedColumn()
    id : number;
    @Column( { nullable : false } )
    amount : number;
    @Column()
    time : Date;
    @Column()
    status : string; // Paid | Pending
    @Column()
    description : string; // E.g. Edzés, Gyakorló Jégcsarnok 2021.04.18. 9:00
    @Column()
    notes : string; // E.g. Credentials of deleted user
    @ManyToOne( () => User, user => user.id )
    @JoinTable()
    user : User; 
}
