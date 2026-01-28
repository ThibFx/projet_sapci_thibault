import { Routes } from '@angular/router';

import { PollutionDetailComponent } from './pollutions/pages/pollution-detail/pollution-detail.component';
import { PollutionFormComponent } from './pollutions/pages/pollution-form/pollution-form.component';
import { PollutionListComponent } from './pollutions/pages/pollution-list/pollution-list.component';
import { LoginComponent } from './features/auth/pages/login/login.component';
import { RegisterComponent } from './features/auth/pages/register/register.component';
import { FavoritesListComponent } from './features/favorites/pages/favorites-list/favorites-list.component';
import { authGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'pollutions' },
  {
    path: 'auth',
    children: [
      { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
      { path: 'register', component: RegisterComponent, canActivate: [guestGuard] },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  },
  {
    path: 'pollutions',
    children: [
      { path: '', component: PollutionListComponent },
      { path: 'new', component: PollutionFormComponent, canActivate: [authGuard] },
      { path: ':id/edit', component: PollutionFormComponent, canActivate: [authGuard] },
      { path: ':id', component: PollutionDetailComponent }
    ]
  },
  {
    path: 'favorites',
    component: FavoritesListComponent,
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: 'pollutions' }
];
