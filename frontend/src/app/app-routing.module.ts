import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FinanceComponent } from './finance/finance.component';
import { GroupComponent } from './group/group.component';
import { LandingpageComponent } from './landingpage/landingpage.component';
import { ProfileComponent } from './profile/profile.component';
import { RoleGuardService } from './role-guard.service';
import { SettingsComponent } from './settings/settings.component';
import { TrainingComponent } from './training/training.component';
import { UserComponent } from './user/user.component';


const routes: Routes = [
  { path : 'training', component : TrainingComponent },
  { path : 'finance', component : FinanceComponent }, 
  { path : 'profile', component : ProfileComponent },
  { path : 'settings', component : SettingsComponent },
  { path : 'users', component : UserComponent, canActivate: [RoleGuardService], data: { acceptedRoles: ["admin"] }},
  { path : 'groups', component : GroupComponent, canActivate: [RoleGuardService], data: { acceptedRoles: ["admin", "coach", "trainee"] } },
  { path : '', pathMatch : "full", component : LandingpageComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
