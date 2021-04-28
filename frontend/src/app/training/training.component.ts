import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { format } from 'date-fns';
import { RawTraining } from '../types';

@Component({
    selector: 'app-training',
    templateUrl: './training.component.html',
    styleUrls: ['./training.component.scss']
})

export class TrainingComponent implements OnInit {
    colNum: number = 5;
    trainings: any[] = [];
    
    constructor(private http: HttpClient) { }
    ngOnInit(): void {
        this.loadTrainings();
    }
    async loadTrainings(): Promise<void> {
        this.trainings = await this.http.get<RawTraining[]>(`https://hkadmin-api.icescream.net/training`).toPromise()
            // .catch( error => { 
            //   console.log(error); 
            //   return {error}; 
            // } )
            ;
        console.log(this.trainings);
    }
    formatFullDate(date: Date): string {
        return format(new Date(date), "yyyy.MM.dd HH:mm");
    }
    formatHourDate(date: Date): string {
        return format(new Date(date), "HH:mm");
    }
    setColNum(): boolean {
            const screenWidth = window.innerWidth;
            this.colNum = screenWidth / 360 >= 1 ? screenWidth / 360 : 1;

            return true;
    }
}
