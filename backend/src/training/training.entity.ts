import { Location } from "src/location/location.entity";
import { User } from "src/user/user.entity";
import { Coach } from "src/coach/coach.entity";
import { Column, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

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
    @ManyToMany( () => Coach, coach => coach.userId)
    @JoinTable()
    coaches : Coach[];
    @Column()
    startTime : Date;
    @Column()
    endTime : Date;
    @Column()
    status : string; // Planned | Fixed | Past
}