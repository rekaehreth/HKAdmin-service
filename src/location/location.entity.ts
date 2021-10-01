import { Training } from "../training/training.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Location 
{
    @PrimaryGeneratedColumn()
    id : number;
    @Column()
    name : string;
    @Column()
    capacity : number;
    @Column()
    min_attendees : number;
    @OneToMany( () => Training, training => training.location, { cascade: true } )
    trainings : Training[];
    @Column()
    plus_code: string;
}