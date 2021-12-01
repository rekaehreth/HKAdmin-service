import { Payment } from "src/finance/payment.entity";
import { createTestUser } from "./user_helper";
import { Column, JoinColumn, JoinTable, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../src/user/user.entity';
import { Training } from '../../src/training/training.entity';
import { createTestTraining } from './training_helper';

export const createTestPayment = ( partialPayment: Partial<Payment> = {} ) => {
    return {
        ...defaultPayment,
        ...partialPayment
    }
};

const defaultPayment: Payment = {
    id: null,
    amount: 3000,
    time: new Date('2021.11.01'), // fucking timezones
    status: '', // Paid | Pending
    description: '', // E.g. Edzés, Gyakorló Jégcsarnok 2021.04.18. 9:00
    notes: '', // E.g. Credentials of deleted user
    user: createTestUser(),
    training: createTestTraining(),
};
