import { Injectable } from '@nestjs/common';
import { User } from 'src/user/user.entity';
import { DeleteResult, getRepository } from 'typeorm';
import { Payment } from './payment.entity';

@Injectable()
export class FinanceService {
    public async getAll() : Promise<Payment[]>
    {
        const paymentRepository = getRepository(Payment);
        return await paymentRepository.find( { relations: ["user"] } );
    }

    public async getById( id : number ) : Promise<Payment>
    {
        const paymentRepository = getRepository(Payment);
        return await paymentRepository.findOne( id, { relations: ["user"] } );
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
        const user = await getRepository(User).findOne(userId);
        const paymentRepository = getRepository(Payment);
        newPayment.user = user;
        return await paymentRepository.save(newPayment);
    }

    public async delete ( id : number ) : Promise<DeleteResult>
    {
        const paymentRepository = getRepository(Payment);
        return await paymentRepository.delete(id);
    }
    public async modify ( userId : number = -1, paymentId : number, rawPaymentData : {
        amount : number,
        time : Date,
        status : string, 
        description : string, 
        notes : string
    } ) : Promise<Payment>
    {
        const paymentRepository = getRepository(Payment);
        const modifiedPayment = await paymentRepository.findOne( paymentId );
        Object.keys(rawPaymentData).forEach( (key) => { modifiedPayment[key] = rawPaymentData[key] });
        if ( userId > 0 )
        {
            const user = await getRepository(User).findOne(userId);
            modifiedPayment.user = user;
        }
        return await paymentRepository.save(modifiedPayment); 
    }
}
// function Finance(Finance: any) {
//     throw new Error('Function not implemented.');
// }

