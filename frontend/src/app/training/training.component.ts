import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { format } from 'date-fns';
import { RawTraining } from '../types';

@Component({
    selector: 'app-training',
    templateUrl: './training.component.html',
    styleUrls: ['./training.component.scss']
})

export class TrainingComponent implements OnInit {

    constructor(private http: HttpClient) { }
    trainings: any[] = [];
    ngOnInit(): void {
        this.loadTrainings();
    }
    async loadTrainings(): Promise<void> {
        this.trainings = await this.http.get<RawTraining[]>(`http://localhost:3000/training`).toPromise()
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
}
