import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatButtonModule } from '@angular/material/button';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatListModule } from '@angular/material/list';
import { MatDialogModule } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select'
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { AppComponent } from './app.component';
import { LocationComponent } from './location/location.component';
import { RegistrationComponent } from './registration/registration.component';
import { NavBarComponent } from './nav-bar/nav-bar.component';
import { TrainingComponent } from './training/training.component';
import { FinanceComponent } from './finance/finance.component';
import { ProfileComponent } from './profile/profile.component';
import { SettingsComponent } from './settings/settings.component';
import { LandingpageComponent } from './landingpage/landingpage.component';
import { TrainingCardComponent } from './training/training-card/training-card.component';
import { GroupComponent } from './group/group.component';
import { UserComponent } from './user/user.component';
import { EditUserComponent } from './user/edit-user/edit-user.component';
import { NewTrainingComponent } from './training/new-training/new-training.component';
import { AuthService } from './auth.service';
import { JwtHelperService, JWT_OPTIONS } from '@auth0/angular-jwt';
import { RoleGuardService } from './role-guard.service';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { RegisterGuestDialogComponent } from './training/training-details-dialog/register-guest-dialog/register-guest-dialog.component';
import { ManageTrainingFinancesDialogComponent } from './training/training-details-dialog/manage-training-finances-dialog/manage-training-finances-dialog.component';
import { TrainingDetailsDialogComponent } from './training/training-details-dialog/training-details-dialog.component';

@NgModule({
    declarations: [
        AppComponent,
        LocationComponent,
        NavBarComponent,
        TrainingComponent,
        FinanceComponent,
        ProfileComponent,
        SettingsComponent,
        LandingpageComponent,
        RegistrationComponent,
        TrainingCardComponent,
        GroupComponent,
        UserComponent,
        EditUserComponent,
        NewTrainingComponent,
        ConfirmDialogComponent,
        RegisterGuestDialogComponent,
        ManageTrainingFinancesDialogComponent,
        TrainingDetailsDialogComponent,
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        HttpClientModule,
        BrowserAnimationsModule,
        MatGridListModule,
        MatButtonModule,
        FlexLayoutModule,
        MatListModule,
        MatCardModule,
        MatTabsModule,
        MatFormFieldModule,
        MatInputModule,
        MatCheckboxModule,
        MatIconModule,
        MatDialogModule,
        MatExpansionModule,
        FormsModule,
        ReactiveFormsModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatSelectModule,
        MatTableModule,
        MatSortModule,
        MatTooltipModule,
        MatChipsModule,
        MatSnackBarModule,
        
    ],
    providers: [
        RegistrationComponent,
        MatDatepickerModule,
        AuthService,
        { provide: JWT_OPTIONS, useValue: JWT_OPTIONS },
        JwtHelperService,
        RoleGuardService,
        {provide: MAT_DATE_LOCALE, useValue: 'hu-HU'},
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
