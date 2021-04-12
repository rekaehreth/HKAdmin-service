import { Coach } from "src/coach/coach.entity";
import { User } from "src/user/user.entity";
import { Training } from "src/training/training.entity";
import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Group 
{
    @PrimaryGeneratedColumn()
    id : number;
    @Column()
    name : string;
    @ManyToMany( () => User, user => user.groups )
    @JoinTable()
    members : User[];
    @ManyToMany( () => Coach, coach => coach.id )
    @JoinTable()
    coaches : Coach[];
    @ManyToMany( () => Training, training => training.id )
    @JoinTable()
    trainings : Training[];

}