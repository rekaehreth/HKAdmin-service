import { Injectable } from '@nestjs/common';
import { Coach } from '../coach/coach.entity';
import { Group } from '../group/group.entity';
import { Training } from '../training/training.entity';
import { Connection, DeleteResult, Like, Repository, SimpleConsoleLogger } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { addApplicationToTraining, Application, removeApplicationFromTraining } from '../utils';

@Injectable()
export class UserService {
    userRepository: Repository<User>;
    groupRepository: Repository<Group>;
    coachRepository: Repository<Coach>;
    trainingRepository: Repository<Training>;

    constructor(
        connection: Connection,
        private jwtService: JwtService
    ) {
        this.userRepository = connection.getRepository(User);
        this.groupRepository = connection.getRepository(Group);
        this.coachRepository = connection.getRepository(Coach);
        this.trainingRepository = connection.getRepository(Training);
    }
    public async getAll(): Promise<User[]> {
        return await this.userRepository.find({ relations: ["trainings", "groups"] });
    }

    public async getById(id: number): Promise<User> {
        return await this.userRepository.findOne(id, { relations: ["trainings", "groups"] });
    }

    public async getByEmail(email: string): Promise<User> {
        return await this.userRepository.findOne({ relations: ["trainings", "groups"], where: {email: email} });
    }

    public async getByRole(role: string): Promise<User[]> {
        return await this.userRepository.find({ relations: ["trainings", "groups"], where: { roles: Like(`%${role}%`) } });
    }

    public async create(rawUserData: {
        name: string,
        roles: string,
        email: string,
        password: string,
        birth_date: Date,
    }): Promise<{ success: boolean, user: User }> {
        if (!await this.getByEmail(rawUserData.email)) {
            const newUser = new User();
            Object.keys(rawUserData).forEach((key) => { newUser[key] = (key === "password") ? bcrypt.hashSync(rawUserData[key], 10) : rawUserData[key]; });
            newUser.roles = rawUserData.roles;
            if( newUser.roles === '') {
                newUser.roles += "trainee ";
            }
            return { success: true, user: await this.userRepository.save(newUser) };
        }
        return { success: false, user: undefined };

    }

    public async delete(id: number): Promise<DeleteResult> {
        return await this.userRepository.delete(id);
    }

    public async modify(userId: number, rawUserData: {
        name: string,
        roles: string,
        email: string,
        password: string,
        birth_date: Date,
    }): Promise<{ success: boolean, user: User }> {
        const modifiedUser = await this.userRepository.findOne(userId);
        const userWithSameEmail = await this.getByEmail(rawUserData.email);
        if (modifiedUser && (userWithSameEmail === undefined || userWithSameEmail?.id === userId)) {
            Object.keys(rawUserData).forEach((key) => { modifiedUser[key] = (key === "password") ? bcrypt.hashSync(rawUserData[key], 10) : rawUserData[key]; });
            return { success: true, user: await this.userRepository.save(modifiedUser) };
        }
        return { success: false, user: undefined };

    }

    public async addToGroup(userId: number, groupId: number, forceTrainee = false): Promise<{ success: boolean, error?: any }> {
        const userToBeAdded = await this.userRepository.findOne(userId, { relations: ["groups"] });
        if( userToBeAdded === undefined ) {
            return { success: false, error: 'There is no user in db with the given id' };
        }
        const groupToAddTo = await this.groupRepository.findOne(groupId, { relations: ["members", "coaches"] });
        if( groupToAddTo === undefined ) {
            return { success: false, error: 'There is no group in db with the given id' };
        }
        if (userToBeAdded.roles.includes('coach') && !forceTrainee) {
            const coachToBeAdded = await this.coachRepository.findOne({ user: userToBeAdded }, { relations: ["groups"] });
            if( coachToBeAdded === undefined ) {
                return { success: false, error: 'There is no coach in db with the given id' };
            }
            groupToAddTo.coaches.push(coachToBeAdded);
            coachToBeAdded.groups.push(groupToAddTo);
            await this.coachRepository.save(coachToBeAdded);
        }
        else {
            groupToAddTo.members.push(userToBeAdded);
            userToBeAdded.groups.push(groupToAddTo);
            await this.userRepository.save(userToBeAdded);
        }
        await this.groupRepository.save(groupToAddTo);
        return { success: true };
    }

    public async removeFromGroup(userId: number, groupId: number, forceTrainee = false): Promise<{ success: boolean, error?: any }> {
        const userToRemove = await this.userRepository.findOne(userId, { relations: ["groups"] });
        if( userToRemove === undefined ) {
            return { success: false, error: 'There is no user in db with the given id' };
        }
        const groupToRemoveFrom = await this.groupRepository.findOne(groupId, { relations: ["trainings", "members", "coaches"] });
        if( groupToRemoveFrom === undefined ) {
            return { success: false, error: 'There is no group in db with the given id' };
        }
        if (userToRemove.roles.includes('coach') && !forceTrainee) {
            const coachToRemove = await this.coachRepository.findOne({ user: userToRemove }, { relations: ["groups"] });
            if( coachToRemove === undefined ) {
                return { success: false, error: 'There is no coach in db with the given id' };
            }
            const coachIndex = groupToRemoveFrom.coaches.indexOf(coachToRemove);
            const groupIndex = coachToRemove.groups.indexOf(groupToRemoveFrom);
            groupToRemoveFrom.coaches.splice(coachIndex, 1);
            coachToRemove.groups.splice(groupIndex, 1);
            await this.coachRepository.save(coachToRemove);
        }
        else {
            const userIndex = groupToRemoveFrom.members.indexOf(userToRemove);
            const groupIndex = userToRemove.groups.indexOf(groupToRemoveFrom);
            groupToRemoveFrom.members.splice(userIndex, 1);
            userToRemove.groups.splice(groupIndex, 1);
            await this.userRepository.save(userToRemove);
        }
        await this.groupRepository.save(groupToRemoveFrom);
        return { success: true };
    }

    public async addToTraining(userId: number, trainingId: number, groupId: number, forceTrainee = false): Promise<{ success: boolean, error?: any }> {
        const userToBeAdded = await this.userRepository.findOne(userId, { relations: ["trainings"] });
        if( userToBeAdded === undefined ) {
            return { success: false, error: 'There is no user in db with the given id' };
        }
        const trainingToAddTo = await this.trainingRepository.findOne(trainingId, { relations: ["attendees", "coaches"] });
        if( trainingToAddTo === undefined ) {
            return { success: false, error: 'There is no training in db with the given id' };
        }
        const groupOfUser = await this.groupRepository.findOne(groupId, { relations: ["members", "coaches", "trainings"] });
        if( groupOfUser === undefined ) {
            return { success: false, error: 'There is no group in db with the given id' };
        }
        if (userToBeAdded.roles.includes('coach') && !forceTrainee) {
            const coachToBeAdded = await this.coachRepository.findOne({ user: userToBeAdded }, { relations: ["trainings"] });
            if( coachToBeAdded === undefined ) {
                return { success: false, error: 'There is no coach in db with the given id' };
            }
            const applicationToBeAdded: Application = { userId, groupId, role: "coach"};
            trainingToAddTo.coaches.push(coachToBeAdded);
            coachToBeAdded.trainings.push(trainingToAddTo);
            trainingToAddTo.applications = addApplicationToTraining(applicationToBeAdded, trainingToAddTo.applications);
            await this.coachRepository.save(coachToBeAdded);
        }
        else {
            const applicationToBeAdded: Application = { userId, groupId, role: "trainee"};
            trainingToAddTo.attendees.push(userToBeAdded);
            userToBeAdded.trainings.push(trainingToAddTo);
            trainingToAddTo.applications = addApplicationToTraining(applicationToBeAdded, trainingToAddTo.applications);
            this.userRepository.save(userToBeAdded);
        }
        await this.trainingRepository.save(trainingToAddTo);
        return { success: true };
    }

    public async removeFromTraining(userId: number, trainingId: number, groupId: number, forceTrainee = false): Promise<{ success: boolean, error?: any }> {
        const userToRemove = await this.userRepository.findOne(userId, { relations: ["trainings"] });
        if( userToRemove === undefined ) {
            return { success: false, error: 'There is no user in db with the given id' };
        }
        const trainingToRemoveFrom = await this.trainingRepository.findOne(trainingId, { relations: ["coaches", "attendees"] });
        if( trainingToRemoveFrom === undefined ) {
            return { success: false, error: 'There is no training in db with the given id' };
        }
        const groupToRemove = await this.groupRepository.findOne(groupId, { relations: ["trainings", "members", "coaches"] });
        if( groupToRemove === undefined ) {
            return { success: false, error: 'There is no group in db with the given id' };
        }
        if (userToRemove.roles.match(/.*coach.*/) && !forceTrainee) {
            const coachToRemove = await this.coachRepository.findOne({ user: userToRemove }, { relations: ["trainings"] });
            const coachIndex = trainingToRemoveFrom.coaches.findIndex( coach => coach.id === coachToRemove.id);
            const trainingIndex = coachToRemove.trainings.findIndex( training => training.id === trainingToRemoveFrom.id);
            const applicationToBeRemoved: Application = { userId, groupId, role: "coach"};

            coachToRemove.trainings.splice(trainingIndex, 1);
            trainingToRemoveFrom.coaches.splice(coachIndex, 1);
            trainingToRemoveFrom.applications = removeApplicationFromTraining(applicationToBeRemoved, trainingToRemoveFrom.applications);

            await this.coachRepository.save(coachToRemove);
        } else {
            const userIndex = trainingToRemoveFrom.attendees.findIndex( attendee => attendee.id === userToRemove.id);
            const trainingIndex = userToRemove.trainings.findIndex( training => training.id === trainingToRemoveFrom.id);
            const applicationToBeRemoved: Application = { userId, groupId, role: "trainee"};

            trainingToRemoveFrom.attendees.splice(userIndex, 1);
            userToRemove.trainings.splice(trainingIndex, 1);
            trainingToRemoveFrom.applications = removeApplicationFromTraining(applicationToBeRemoved, trainingToRemoveFrom.applications);

            await this.userRepository.save(userToRemove);
        }
        await this.trainingRepository.save(trainingToRemoveFrom);
        return { success: true };
    }
    public async listAvailableTrainings(userId: number): Promise<[Training, boolean][]> {
        const availableTrainings: [Training, boolean][] = []; // boolean is true if user has already signed up for that training
        const user = await this.userRepository.findOne(userId, { relations: ["groups", "trainings"] });

        for (const userGroup of user.groups) {
            const group = await this.groupRepository.findOne(userGroup.id, { relations: ["trainings"] });
            group.trainings.forEach(training => {
                if (user.trainings.includes(training)) { availableTrainings.push([training, false]) }
                else { availableTrainings.push([training, true]) }
            });
        }
        return availableTrainings;
    }
    public async login(email: string, rawpassword: string): Promise<{ success: boolean, token?: string, userId?: number, userRoles?: string }> {
        const failResult = { success: false };
        const user = await this.userRepository.findOne({ email });
        if (!user) {
            return failResult;
        }
        const pwdCorrect = bcrypt.compareSync(rawpassword, user.password);
        if (pwdCorrect) {
            return {
                success: true,
                token: this.jwtService.sign({ id: user.id, roles: user.roles }),
                userId: user.id,
                userRoles: user.roles
            }
        }
        return failResult;
    }
    public async getCoach(userId: number): Promise<Coach> {
        const user = await this.userRepository.findOne(userId);
        return await this.coachRepository.findOne({ user: user }, { relations: ["user", "groups", "trainings"] });
    }
}
