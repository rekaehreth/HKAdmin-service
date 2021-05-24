import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { AuthService } from '../auth.service';
import { HttpService } from '../httpService';
import { RawPayment, RawUser } from '../types';
import { formatFullDate, formatHourDate } from '../utils';

@Component({
    selector: 'app-finance',
    templateUrl: './finance.component.html',
    styleUrls: ['./finance.component.scss']
})
export class FinanceComponent implements OnInit {
    allPayments: RawPayment[] = [];
    userPayments: RawPayment[] = [];
    adminDataSource = new MatTableDataSource<RawPayment>();
    userDataSource = new MatTableDataSource<RawPayment>();

    @ViewChild(MatSort) sort?: MatSort;
    adminDisplayedColumns: string[] = ['date', 'name', 'email', 'description', 'amount', 'status'];
    userDisplayedColumns: string[] = ['date', 'amount', 'status'];

    roles: string[] = [];
    user!: RawUser;

    formatFullDate = formatFullDate;
    formatHourDate = formatHourDate;

    constructor(
        private http: HttpService,
        private authService: AuthService,
    ) { }

    ngOnInit(): void {
        this.loadPayments();
    }
    ngAfterViewInit() {
        console.log(this.sort)
        if (this.sort) {
            this.adminDataSource.sort = this.sort;
            this.userDataSource.sort = this.sort;
        }
    }
    async loadPayments(): Promise<void> {
        this.roles = this.authService.getLoggedInRoles();
        if( this.roles.includes("admin")) {
            await this.loadAdminPayments();
        }
        await this.loadUserPayments();
        // console.log(this.allPayments);
        // console.log(this.userPayments);
        this.adminDataSource = new MatTableDataSource(this.allPayments);
        this.userDataSource = new MatTableDataSource(this.userPayments);
        if (this.sort) {
            this.adminDataSource.sort = this.sort;
            this.userDataSource.sort = this.sort;
        }
    }
    async loadAdminPayments(): Promise<void> {
        this.allPayments = await this.http.get<RawPayment[]>(`finance`);
    }
    async loadUserPayments(): Promise<void> {
        const userId = this.authService.getLoggedInUserId();
        this.userPayments = await this.http.get<RawPayment[]>(`finance/getByUser/${userId}`);
    }
    // layout: similarly to user, a table, with sort options to username, payment date, description
    // if no user is linked, display name from description with red and concatenate (deleted user)
    // amount: green if > 0, red if < 0, standard if === 0 
    // **TODO** when deleting a user, remove user from payments linked to it
}
