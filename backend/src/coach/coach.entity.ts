import { Group } from "src/group/group.entity";
import { Training } from "src/training/training.entity";
import { User } from "src/user/user.entity";
import { Column, Entity, JoinColumn, ManyToMany, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Coach 
{
    @PrimaryGeneratedColumn()
    id : number; 
    @OneToOne( () => User )
    @JoinColumn()
    user : User;
    @ManyToMany( () => Group, group => group.id )
    groups : Group[];
    @ManyToMany( () => Training, training => training.id )
    trainings : Training[];
    @Column()
    wage : number;
}