import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { WorldMapComponent } from 'src/app/components/world-map/world-map.component';
import { LoadingSpinnerComponent } from 'src/app/components/loading-spinner/loading-spinner.component';
import { AuthService } from 'src/app/services/auth.service';
import { PoliticalCompassComponent } from 'src/app/components/political-compass/political-compass.component';
import { TagCloudComponent } from 'src/app/components/tag-cloud/tag-cloud.component';
import { UserActivityComponent } from 'src/app/components/user-activity/user-activity.component';

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.page.html',
  styleUrls: ['./analytics.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    FormsModule,
    WorldMapComponent,
    LoadingSpinnerComponent,
    PoliticalCompassComponent,
    TagCloudComponent,
    UserActivityComponent,
  ],
})
export class AnalyticsPage implements OnInit {
  selectedTab: 'map' | 'compass' | 'tag-cloud' | 'charts' = 'map';
  countries: any[] = [];
  topCountries: any[] = [];
  users: any[] = [];
  userActivity: any[] = [];
  baseURL = 'http://localhost:8000';
  loading = true;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.loadUsers();
  }

  async loadUsers() {
    try {
      const response = await fetch(
        `${this.baseURL}/api/getAllCountriesWithUsers`,
        {
          headers: this.authService.getAuthHeaders(),
        }
      );
      const data = await response.json();
      this.countries = data.countries;

      // Calculate top 10 countries
      this.topCountries = this.countries
        .filter((country) => country.population > 0) // Only countries with users
        .sort((a, b) => b.population - a.population) // Sort by population descending
        .slice(0, 10); // Take top 10

      console.log('All countries:', this.countries);
      console.log('Top 10 countries:', this.topCountries);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
    try {
      const response = await fetch(`${this.baseURL}/api/getAllUsers`, {
        headers: this.authService.getAuthHeaders(),
      });
      const data = await response.json();
      this.users = data.users;

      console.log('All users:', this.users);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
    try {
      const response = await fetch(`${this.baseURL}/api/getUserActivity`, {
        headers: this.authService.getAuthHeaders(),
      });
      const data = await response.json();
      this.userActivity = data.users;

      console.log('All users:', this.users);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
    this.loading = false;
  }
}
