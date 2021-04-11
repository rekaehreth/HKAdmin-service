import { Injectable } from '@nestjs/common';
import { Connection, DeleteResult, Repository } from 'typeorm';
import { User } from 'src/user/user.entity';
import { Payment } from './payment.entity';
import { Location } from 'src/location/location.entity';

@Injectable()
export class FinanceService {
    userRepository: Repository<User>;
    locationRepository: Repository<Location>;
    paymentRepository: Repository<Payment>;

    constructor( connection:Connection ) {
        this.userRepository = connection.getRepository(User);
        this.locationRepository = connection.getRepository( Location );
        this.paymentRepository = connection.getRepository( Payment );
    }
    public async getAll() : Promise<Payment[]>
    {
        return await this.paymentRepository.find( { relations: ["user"] } );
    }

    public async getById( id : number ) : Promise<Payment>
    {
        return await this.paymentRepository.findOne( id, { relations: ["user"] } );
    }

    public async create( userId : number, rawPaymentData : {
        amount : number,
        time : Date,
        status : string, 
        description : string, 
        notes : string
    } ) : Promise<Payment>
    {
        const newPayment = new Payment();
        Object.keys(rawPaymentData).forEach( (key) => { newPayment[key] = rawPaymentData[key] });
        const user = await this.userRepository.findOne(userId);
        newPayment.user = user;
        return await this.paymentRepository.save(newPayment);
    }

    public async delete ( id : number ) : Promise<DeleteResult>
    {
        return await this.paymentRepository.delete(id);
    }
    public async modify ( userId : number = -1, paymentId : number, rawPaymentData : {
        amount : number,
        time : Date,
        status : string, 
        description : string, 
        notes : string
    } ) : Promise<Payment>
    {
        const modifiedPayment = await this.paymentRepository.findOne( paymentId );
        Object.keys(rawPaymentData).forEach( (key) => { modifiedPayment[key] = rawPaymentData[key] });
        if ( userId > 0 )
        {
            const user = await this.userRepository.findOne(userId);
            modifiedPayment.user = user;
        }
        return await this.paymentRepository.save(modifiedPayment); 
    }
}

