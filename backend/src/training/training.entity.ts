import { Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Location } from "src/location/location.entity";
import { User } from "src/user/user.entity";
import { Coach } from "src/coach/coach.entity";
import { Group } from "src/group/group.entity";
import { Payment } from "src/finance/payment.entity";

@Entity()
export class Training 
{
    @PrimaryGeneratedColumn()
    id : number;
    @ManyToOne( () => Location, site => site.trainings, { onDelete: 'CASCADE' } )
    location : Location;
    @ManyToMany( () => User, user => user.trainings )
    @JoinTable()
    attendees : User[];
    @ManyToMany( () => Coach, coach => coach.trainings)
    @JoinTable({name: "coach_trainings_training"})
    coaches : Coach[];
    @ManyToMany( () => Group, group => group.trainings)
    @JoinTable()
    groups : Group[];
    @OneToMany( () => Payment, payment => payment.training)
    payments: Payment[];
    @Column()
    startTime : Date;
    @Column()
    endTime : Date;
    @Column()
    status : string; // Planned | Fixed | Past
    @Column()
    type: string; // Száraz | Jeges | Balett 
    @Column()
    applications: string; 
}