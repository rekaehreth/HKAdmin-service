import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FinanceComponent } from './finance/finance.component';
import { GroupComponent } from './group/group.component';
import { LandingpageComponent } from './landingpage/landingpage.component';
import { ProfileComponent } from './profile/profile.component';
import { RoleGuardService } from './role-guard.service';
// import { SettingsComponent } from './settings/settings.component';
import { TrainingComponent } from './training/training.component';
import { UserComponent } from './user/user.component';


const routes: Routes = [
    { path: 'training', component: TrainingComponent, data: { acceptedRoles: ["admin", "coach", "trainee", "guest"] } },
    { path: 'finance', component: FinanceComponent, canActivate: [RoleGuardService], data: { acceptedRoles: ["admin", "coach", "trainee"] } },
    { path: 'profile', component: ProfileComponent, canActivate: [RoleGuardService], data: { acceptedRoles: ["admin", "coach", "trainee"] } },
    // { path : 'settings', component : SettingsComponent },
    { path: 'users', component: UserComponent, canActivate: [RoleGuardService], data: { acceptedRoles: ["admin"] } },
    { path: 'groups', component: GroupComponent, canActivate: [RoleGuardService], data: { acceptedRoles: ["admin", "coach"] } },
    { path: '', pathMatch: "full", component: LandingpageComponent },
    // **TODO** add 404 error for non-existent / not-authenticated endpoints
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
