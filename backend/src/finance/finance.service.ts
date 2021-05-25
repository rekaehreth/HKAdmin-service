import { Injectable } from '@nestjs/common';
import { Connection, DeleteResult, Repository } from 'typeorm';
import { User } from 'src/user/user.entity';
import { Payment } from './payment.entity';
import { Location } from 'src/location/location.entity';
import { Training } from 'src/training/training.entity';

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
        return await this.paymentRepository.find( { relations: ["user"] } );
    }

    public async getById( id : number ) : Promise<Payment> {
        return await this.paymentRepository.findOne( id, { relations: ["user"] } );
    }

    public async getByUser( userId: number ) : Promise<Payment[]> {
        const user = await this.userRepository.findOne(userId);
        return  await this.paymentRepository.find( { relations: ["user"], where: {user: user} } );
    }

    public async create( userId : number, trainingId: number, rawPaymentData : {
        amount : number,
        time : Date,
        status : string, 
        description : string, 
        notes : string
    } ) : Promise<Payment> {
        const newPayment = new Payment();
        Object.keys(rawPaymentData).forEach( (key) => { newPayment[key] = rawPaymentData[key] });
        const user = await this.userRepository.findOne(userId);
        newPayment.user = user;
        const training = await this.trainingRepository.findOne(trainingId);
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
        const modifiedPayment = await this.paymentRepository.findOne( paymentId, { relations: ["user"] } );
        Object.keys(rawPaymentData).forEach( (key) => { modifiedPayment[key] = rawPaymentData[key] });
        if ( userId > 0 ){
            const user = await this.userRepository.findOne(userId);
            modifiedPayment.user = user;
        }
        if( trainingId > 0 ) {
            const training = await this.trainingRepository.findOne(trainingId);
            modifiedPayment.training = training;
        }
        return await this.paymentRepository.save(modifiedPayment); 
    }
}

