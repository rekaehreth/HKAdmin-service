import { Injectable } from '@nestjs/common';
import { Connection, DeleteResult, Repository } from 'typeorm';
import { User } from '../user/user.entity';
import { Payment } from './payment.entity';
import { Location } from '../location/location.entity';
import { Training } from '../training/training.entity';

@Injectable()
export class FinanceService {
    userRepository: Repository<User>;
    locationRepository: Repository<Location>;
    paymentRepository: Repository<Payment>;
    trainingRepository: Repository<Training>;

    constructor( connection:Connection ) {
        this.userRepository = connection.getRepository(User);
        this.locationRepository = connection.getRepository( Location );
        this.paymentRepository = connection.getRepository( Payment );
        this.trainingRepository = connection.getRepository( Training );
    }

    public async getAll() : Promise<Payment[]> {
        return await this.paymentRepository.find( { relations: ["user", "training"] } );
    }

    public async getById( id : number ) : Promise<Payment> {
        return await this.paymentRepository.findOne( id, { relations: ["user", "training"] } );
    }

    public async getByUser( userId: number ) : Promise<Payment[]> {
        const user = await this.userRepository.findOne(userId);
        if( user === undefined) {
            throw new Error('There is no user in the database with the given id');
        }
        return  await this.paymentRepository.find( { relations: ["user", "training"], where: {user} } );
    }

    public async create( userId : number, trainingId: number, rawPaymentData : {
        amount : number,
        time : Date,
        status : string,
        description : string,
        notes : string
    } ) : Promise<Payment> {
        const user = await this.userRepository.findOne(userId, {relations: ["payments"]});
        if( user === undefined) {
            throw new Error('There is no user in the database with the given id');
        }
        const training = await this.trainingRepository.findOne(trainingId);
        if( training === undefined) {
            throw new Error('There is no training in the database with the given id');
        }
        const newPayment = new Payment();
        Object.keys(rawPaymentData).forEach( (key) => { newPayment[key] = rawPaymentData[key] });

        newPayment.user = user;
        newPayment.training = training;
        return await this.paymentRepository.save(newPayment);
    }

    public async delete ( id : number ) : Promise<DeleteResult> {
        return await this.paymentRepository.delete(id);
    }

    public async modify ( userId : number = -1, paymentId : number, trainingId: number = -1, rawPaymentData : {
        amount : number,
        time : Date,
        status : string,
        description : string,
        notes : string
    } ) : Promise<Payment> {
        const user = await this.userRepository.findOne(userId);
        if (user === undefined ) {
            throw new Error('There is no user in the database with the given id');
        }
        const training = await this.trainingRepository.findOne(trainingId);
        if (training === undefined ) {
            throw new Error('There is no training in the database with the given id');
        }
        const modifiedPayment = await this.paymentRepository.findOne( paymentId, { relations: ["user", "training"] } );
        if (modifiedPayment === undefined ) {
            throw new Error('There is no payment in the database with the given id');
        }
        Object.keys(rawPaymentData).forEach( (key) => { modifiedPayment[key] = rawPaymentData[key] });
        modifiedPayment.user = user;
        modifiedPayment.training = training;
        return await this.paymentRepository.save(modifiedPayment);
    }
}

