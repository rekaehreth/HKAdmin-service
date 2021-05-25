import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { HttpService } from 'src/app/httpService';
import { RawPayment } from 'src/app/types';

@Component({
	selector: 'app-manage-training-finances-dialog',
	templateUrl: './manage-training-finances-dialog.component.html',
	styleUrls: ['./manage-training-finances-dialog.component.scss']
})
export class ManageTrainingFinancesDialogComponent implements OnInit {
	payments: RawPayment[] = [];
	paymentDataSource = new MatTableDataSource<RawPayment>();
	@ViewChild(MatSort) sort?: MatSort;
	displayedColumns: string[] = ['name', 'email', 'amount', 'status', 'action'];
	constructor(
		private http: HttpService,
		public dialog: MatDialog,
	) { }
	ngOnInit(): void {
		this.loadPayments();
	}
	async loadPayments(): Promise<void> {
		
	}


}
