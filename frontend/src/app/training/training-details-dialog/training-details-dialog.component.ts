import { Component, OnInit, ChangeDetectorRef, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as mapboxgl from 'mapbox-gl';
import OpenLocationCode, { CodeArea } from 'open-location-code-typescript';
import { RawTraining } from 'src/app/types';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-training-details-dialog',
    templateUrl: './training-details-dialog.component.html',
    styleUrls: ['./training-details-dialog.component.scss']
})
export class TrainingDetailsDialogComponent implements OnInit {
    map!: mapboxgl.Map;
    googleMapsLink: string = "";
    style = 'mapbox://styles/mapbox/streets-v11';
    latitude = 37.75;
    longitude = -122.41;
    constructor(
        public dialogRef: MatDialogRef<TrainingDetailsDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: RawTraining) { }
    ngOnInit(): void {
        (mapboxgl as any).accessToken = environment.mapbox.accessToken;
        this.setCoordinates();
        this.map = new mapboxgl.Map({
            container: 'map',
            style: this.style,
            zoom: 13,
            center: [this.longitude, this.latitude]
        });
        // Add map controls
        this.map.addControl(new mapboxgl.NavigationControl());
    }
    setCoordinates(): void {
        this.googleMapsLink = "https://www.google.com/maps/search/"+this.data.location.plus_code.replace('+', '%')+"+Budapest";
        const plus_code = OpenLocationCode.recoverNearest( this.data.location.plus_code, 47.49622, 19.04588 );
        console.log(plus_code);
        const location: CodeArea = OpenLocationCode.decode(plus_code);
        this.latitude = location.latitudeCenter;
        this.longitude = location.longitudeCenter;
    }
}
