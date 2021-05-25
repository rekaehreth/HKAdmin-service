import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { DeleteResult } from 'typeorm';
import { FinanceService } from './finance.service';
import { Payment } from './payment.entity';

@Controller('finance')
export class FinanceController {
    constructor 
    (
        private readonly service : FinanceService
    ){}
    @Get()
    async getAll() : Promise<Payment[]>
    {
        return await this.service.getAll();
    }  
    @Get('/:id')
    async getById( @Param('id') id : number ) : Promise<Payment> 
    {
        return await this.service.getById(id);
    }
    @Get('getByUser/:userId')
    async getByUser( @Param('userId') userId : number ) : Promise<Payment[]> 
    {
        return await this.service.getByUser(userId);
    }
    @Post('/new')
    async create
    ( 
        @Body() 
        requestBody : {
            userId : number,
            trainingId: number,
            rawPaymentData : {
                amount : number,
                time : Date,
                status : string, 
                description : string, 
                notes : string
            }
        }
    ) : Promise<Payment> 
    {
        return await this.service.create(requestBody.userId, requestBody.trainingId, requestBody.rawPaymentData);
    }
    @Delete('/:id')
    async delete ( @Param('id') id : number ) : Promise<DeleteResult>
    {
        return await this.service.delete(id);
    }
    @Post('/modify')
    async modify(
        @Body()
        requestBody : {
            userId : number, 
            paymentId : number, 
            trainingId: number,
            rawPaymentData : {
                amount : number,
                time : Date,
                status : string, 
                description : string, 
                notes : string
            }
        }
    ) : Promise<Payment>
    {
        return await this.service.modify(requestBody.userId, requestBody.paymentId, requestBody.trainingId, requestBody.rawPaymentData );
    }
}