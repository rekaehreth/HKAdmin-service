import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { HttpService } from 'src/app/httpService';
import { RawPayment, RawTraining } from 'src/app/types';

@Component({
	selector: 'app-manage-training-finances-dialog',
	templateUrl: './manage-training-finances-dialog.component.html',
	styleUrls: ['./manage-training-finances-dialog.component.scss']
})
export class ManageTrainingFinancesDialogComponent implements OnInit {
	payments: RawPayment[] = [];
	paymentDataSource = new MatTableDataSource<RawPayment>();
	@ViewChild(MatSort) sort?: MatSort;
	displayedColumns: string[] = ['name', 'email', 'amount', 'status', 'actions'];
	constructor(
		public dialog: MatDialog,
		private http: HttpService,
		@Inject(MAT_DIALOG_DATA) public data: RawTraining,
	) { }
	ngOnInit(): void {
		this.loadPayments();
	}
	async loadPayments(): Promise<void> {
		this.payments = this.data.payments;
		this.paymentDataSource = new MatTableDataSource(this.payments);
	}
	async changePaymentStatus(payment: RawPayment, index: number, status: string) : Promise<void> {
		const changedPayment = await this.http.post<RawPayment>('finance/modify', {
			userId : payment.user.id, 
            paymentId : payment.id, 
            trainingId: this.data.id,
            rawPaymentData : {
                status : status,
                time : Date(),
		}});
		this.data.payments[index] = changedPayment;
		await this.loadPayments();
	}
	// **TODO** ok and cancel buttons
}
