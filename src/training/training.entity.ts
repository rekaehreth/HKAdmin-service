import { Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Location } from "../location/location.entity";
import { User } from "../user/user.entity";
import { Coach } from "../coach/coach.entity";
import { Group } from "../group/group.entity";
import { Payment } from "../finance/payment.entity";

@Entity()
export class Training
{
    @PrimaryGeneratedColumn()
    id : number;
    @ManyToOne( () => Location, site => site.trainings, { onDelete: 'CASCADE' })
    location : Location;
    @ManyToMany( () => User, user => user.trainings, { cascade: true, onDelete: "CASCADE" })
    @JoinTable()
    attendees : User[];
    @ManyToMany( () => Coach, coach => coach.trainings, { cascade: true, onDelete: "CASCADE" })
    @JoinTable({name: "coach_trainings_training"})
    coaches : Coach[];
    @ManyToMany( () => Group, group => group.trainings)
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
