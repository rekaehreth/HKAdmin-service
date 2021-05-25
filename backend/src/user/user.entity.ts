import { Payment } from "src/finance/payment.entity";
import { Group } from "src/group/group.entity";
import { Training } from "src/training/training.entity";
import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export class User 
{
    @PrimaryGeneratedColumn()
    id : number;
    @ManyToMany( () => Training, training => training.attendees )
    trainings : Training[];
    @Column()
    name : string;
    @Column( { nullable : true } )
    roles : string; // trainee | coach | guardian | guest | admin
    @Column()
    email : string;
    @Column( { nullable : true } )
    password : string;
    @ManyToMany( () => Group, group => group.members)
    @JoinTable()
    groups : Group[];
    @Column( { nullable : true } )
    birth_date : Date;
    @OneToMany( () => Payment, payment => payment.user, { nullable: true, onDelete: "SET NULL"} )
    payments : Payment[];
    // @OneToMany( () => Child, child => child.id )
    // children : Child[];
}
