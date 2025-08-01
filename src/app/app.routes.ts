import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ProfileComponent } from './profile/profile.component';
import { FactsComponent } from './facts/facts.component';
import { NarrativesComponent } from './narratives/narratives.component';

export const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'facts', component: FactsComponent },
  { path: 'narratives', component: NarrativesComponent },
];
