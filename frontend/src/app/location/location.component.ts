import { Component, Input, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-location',
  templateUrl: './location.component.html',
  styleUrls: ['./location.component.scss']
})

export class LocationComponent implements OnInit {
  @Input()
  locationId : number = 0;
  name : string = ""; 
  capacity : number = 0; 
  minAttendees : number = 0; 
  trainingIds : number[] = [];
  constructor( private http : HttpClient ) { }

  ngOnInit(): void {
    this.loadLocation();
  }

  async loadLocation() : Promise<void> {
    console.log(this.locationId);
    const locationObj = await this.http.get<RawLocation>( `https://hkadmin-api.icescream.net/location/${this.locationId}` ).toPromise()
    // .catch( error => { 
    //   console.log(error); 
    //   return {error}; 
    // } )
    ;
    this.name = locationObj.name;
    this.capacity = locationObj.capacity;
    this.minAttendees = locationObj.min_attendees;
    this.trainingIds = locationObj.trainings.map( training => training.id);
    // let locationText = JSON.stringify( locationObj );
  }
}

type RawLocation = {
  id : number, 
  name : string, 
  capacity : number, 
  min_attendees : number, 
  trainings : any[],
}