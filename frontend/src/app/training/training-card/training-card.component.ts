import { Component, Input, OnInit } from '@angular/core';
import { RawTraining } from 'src/app/types';
import { formatFullDate, formatHourDate } from 'src/app/utils';

@Component({
    selector: 'app-training-card',
    templateUrl: './training-card.component.html',
    styleUrls: ['./training-card.component.scss']
})
export class TrainingCardComponent implements OnInit {
    @Input()
    trainingData!: RawTraining; 
    trainingText: string = "";

    formatFullDate = formatFullDate;
    formatHourDate = formatHourDate;

    constructor() { }

    ngOnInit(): void {
        this.trainingText = JSON.stringify(this.trainingData);
    }

}
