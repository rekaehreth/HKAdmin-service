import { Group } from "src/group/group.entity";
import { Training } from "src/training/training.entity";
import { User } from "src/user/user.entity";
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Coach 
{
    @PrimaryGeneratedColumn()
    id : number; 
    @OneToOne( () => User, {eager: true} )
    @JoinColumn()
    user : User;
    @ManyToMany( () => Group, group => group.coaches )
    @JoinTable()
    groups : Group[];
    @ManyToMany( () => Training, training => training.coaches )
    @JoinTable({name: "coach_trainings_training"})
    trainings : Training[];
    @Column()
    wage : number;
}