import { Group } from "src/group/group.entity";
import { User } from "src/user/user.entity";
import { Column, Entity, ManyToMany, OneToOne, PrimaryColumn } from "typeorm";

@Entity()
export class Coach 
{
    @PrimaryColumn()
    @OneToOne( () => User, user => user.id )
    userId : number;
    @ManyToMany( () => Group, group => group.id )
    groups : Group[];
    @Column()
    wage : number;
}