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
    @JoinTable()
    trainings : Training[];
    @Column()
    name : string;
    @Column( { nullable : true } )
    roles : string;
    @Column()
    email : string;
    @Column()
    username : string;
    @Column( { nullable : true } )
    password : string;
    @ManyToMany( () => Group, group => group.id)
    @JoinTable()
    groups : Group[];
    @Column( { nullable : true } )
    birth_date : Date;
    @OneToMany( () => Payment, payment => payment.id )
    payments : Payment[];
}
