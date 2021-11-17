import { Group } from "../group/group.entity";
import { Training } from "../training/training.entity";
import { User } from "../user/user.entity";
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Coach 
{
    @PrimaryGeneratedColumn()
    id : number; 
    @OneToOne( () => User, {eager: true, onDelete: "CASCADE"})
    @JoinColumn()
    user : User;
    @ManyToMany( () => Group, group => group.coaches)
    @JoinTable()
    groups : Group[];
    @ManyToMany( () => Training, training => training.coaches)
    trainings : Training[];
    @Column()
    wage : number;
}