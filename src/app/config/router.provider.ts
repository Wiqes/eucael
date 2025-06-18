import { provideRouter, Routes } from '@angular/router';
import { CasesComponent } from '../features/cases/cases.component';
import { CaseComponent } from '../features/case/case.component';
import { CaseCreationComponent } from '../features/case-creation/case-creation.component';
import { ProfileComponent } from '../features/profile/profile.component';
import { LoginComponent } from '../features/login/login.component';

const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'home', component: CasesComponent },
  { path: 'cases', component: CasesComponent },
  { path: 'cases/:id', component: CaseComponent },
  { path: 'case-creation', component: CaseCreationComponent },
  { path: 'profile', component: ProfileComponent },
];

export const routerProvider = () => provideRouter(routes);
