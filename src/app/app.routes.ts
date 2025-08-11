import { Routes } from '@angular/router';
import { ProfileComponent } from './profile/profile.component';
import { FactsComponent } from './facts/facts.component';
import { NarrativesComponent } from './narratives/narratives.component';

export const routes: Routes = [
  { path: 'profile', component: ProfileComponent },
  { path: 'facts', component: FactsComponent },
  { path: 'narratives', component: NarrativesComponent },
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
];
