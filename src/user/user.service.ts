import { Injectable } from '@nestjs/common';
import { Coach } from '../coach/coach.entity';
import { Group } from '../group/group.entity';
import { Training } from '../training/training.entity';
import { Connection, DeleteResult, Like, Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Payment } from '../finance/payment.entity';
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
        if (!await this.userRepository.findOne(rawUserData.email)) {
            const newUser = new User();
            Object.keys(rawUserData).forEach((key) => { newUser[key] = (key === "password") ? bcrypt.hashSync(rawUserData[key], 10) : rawUserData[key]; });
            newUser.roles = rawUserData.roles;
            newUser.roles += "trainee ";
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
        if (modifiedUser && !(await this.getByEmail(rawUserData.email))) {
            Object.keys(rawUserData).forEach((key) => { modifiedUser[key] = (key === "password") ? bcrypt.hashSync(rawUserData[key], 10) : rawUserData[key]; });
            return { success: true, user: await this.userRepository.save(modifiedUser) };
        }
        return { success: false, user: undefined };

    }
    public async addToGroup(userId: number, groupId: number, forceTrainee: boolean = false): Promise<{ success: boolean, error?: any }> {
        try {
            const groupToAddTo = await this.groupRepository.findOne(groupId, { relations: ["members", "coaches"] });
            const userToBeAdded = await this.userRepository.findOne(userId, { relations: ["groups"] });
            if (userToBeAdded.roles.match(/.*coach.*/) && !forceTrainee) {
                const coachToBeAdded = await this.coachRepository.findOne({ user: userToBeAdded }, { relations: ["groups"] });
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
        catch (error) {
            return { success: false, error: error.toString() };
        }
    }
    public async removeFromGroup(userId: number, groupId: number, forceTrainee: boolean = false): Promise<{ success: boolean, error?: any }> {
        try {
            const groupToRemoveFrom = await this.groupRepository.findOne(groupId, { relations: ["trainings", "members", "coaches"] });
            const userToRemove = await this.userRepository.findOne(userId, { relations: ["groups"] });
            if (userToRemove.roles.match(/.*coach.*/) && !forceTrainee) {
                let coachToRemove = await this.coachRepository.findOne({ user: userToRemove }, { relations: ["groups"] });
                let coachIndex = groupToRemoveFrom.coaches.indexOf(coachToRemove);
                groupToRemoveFrom.coaches.splice(coachIndex, 1);
                let groupIndex = coachToRemove.groups.indexOf(groupToRemoveFrom);
                coachToRemove.groups.splice(groupIndex, 1);
                await this.coachRepository.save(coachToRemove);
            }
            else {
                let userIndex = groupToRemoveFrom.members.indexOf(userToRemove);
                groupToRemoveFrom.members.splice(userIndex, 1);
                let groupIndex = userToRemove.groups.indexOf(groupToRemoveFrom);
                userToRemove.groups.splice(groupIndex, 1);
                await this.userRepository.save(userToRemove);

            }
            await this.groupRepository.save(groupToRemoveFrom);
            return { success: true };
        }
        catch (error) {
            return { success: false, error: error.toString() };
        }
    }
    public async addToTraining(userId: number, trainingId: number, groupId: number, forceTrainee: boolean = false): Promise<{ success: boolean, error?: any }> {
        try {
            const trainingToAddTo = await this.trainingRepository.findOne(trainingId, { relations: ["attendees", "coaches"] });
            const userToBeAdded = await this.userRepository.findOne(userId, { relations: ["trainings"] });
            if (userToBeAdded.roles.match(/.*coach.*/) && !forceTrainee) {
                const coachToBeAdded = await this.coachRepository.findOne({ user: userToBeAdded }, { relations: ["trainings"] });
                trainingToAddTo.coaches.push(coachToBeAdded);
                coachToBeAdded.trainings.push(trainingToAddTo);
                await this.coachRepository.save(coachToBeAdded);
                const applicationToBeAdded: Application = { userId, groupId, role: "coach"};
                trainingToAddTo.applications = addApplicationToTraining(applicationToBeAdded, trainingToAddTo.applications);
            }
            else {
                trainingToAddTo.attendees.push(userToBeAdded);
                userToBeAdded.trainings.push(trainingToAddTo);
                this.userRepository.save(userToBeAdded);
                const applicationToBeAdded: Application = { userId, groupId, role: "trainee"};
                trainingToAddTo.applications = addApplicationToTraining(applicationToBeAdded, trainingToAddTo.applications);
            }
            await this.trainingRepository.save(trainingToAddTo);
            return { success: true };
        }
        catch (error) {
            return { success: false, error: error.toString() };
        }
    }
    public async removeFromTraining(userId: number, trainingId: number, groupId: number, forceTrainee: boolean = false): Promise<{ success: boolean, error?: any }> {
        try {
            const trainingToRemoveFrom = await this.trainingRepository.findOne(trainingId, { relations: ["coaches", "attendees"] });
            const userToRemove = await this.userRepository.findOne(userId, { relations: ["trainings"] }); // , { relations: ["groups"] }
            if (userToRemove.roles.match(/.*coach.*/) && !forceTrainee) {
                let coachToRemove = await this.coachRepository.findOne({ user: userToRemove }, { relations: ["trainings"] });
                let coachIndex = trainingToRemoveFrom.coaches.indexOf(coachToRemove);
                trainingToRemoveFrom.coaches.splice(coachIndex, 1);
                let trainingIndex = coachToRemove.trainings.indexOf(trainingToRemoveFrom);
                coachToRemove.trainings.splice(trainingIndex, 1);
                await this.coachRepository.save(coachToRemove);
                trainingToRemoveFrom.coaches.splice(coachIndex, 1);
                const applicationToBeRemoved: Application = { userId, groupId, role: "coach"};
                trainingToRemoveFrom.applications = removeApplicationFromTraining(applicationToBeRemoved, trainingToRemoveFrom.applications);
            }
            else {
                let userIndex = trainingToRemoveFrom.attendees.indexOf(userToRemove);
                trainingToRemoveFrom.attendees.splice(userIndex, 1);
                let trainingIndex = userToRemove.trainings.indexOf(trainingToRemoveFrom);
                userToRemove.trainings.splice(trainingIndex, 1);
                await this.userRepository.save(userToRemove);
                const applicationToBeRemoved: Application = { userId, groupId, role: "trainee"};
                trainingToRemoveFrom.applications = removeApplicationFromTraining(applicationToBeRemoved, trainingToRemoveFrom.applications);
            }
            await this.trainingRepository.save(trainingToRemoveFrom);
            return { success: true };
        }
        catch (error) {
            return { success: false, error: error.toString() };
        }
    }
    public async listAvailableTrainings(userId: number): Promise<[Training, boolean][]> {
        const availableTrainings: [Training, boolean][] = []; // boolean is true if user has already signed up for that training
        let user = await this.userRepository.findOne(userId, { relations: ["groups", "trainings"] });

        for (const userGroup of user.groups) {
            let group = await this.groupRepository.findOne(userGroup.id, { relations: ["trainings"] });
            group.trainings.forEach(training => {
                if (user.trainings.includes(training)) { availableTrainings.push([training, false]) }
                else { availableTrainings.push([training, true]) }
            });
        }
        return availableTrainings;
    }
    public async login(email: string, rawpassword: string): Promise<{ success: boolean, token?: string, userId?: number, userRoles?: string }> {
        let failResult = { success: false };
        let user = await this.userRepository.findOne({ email });
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