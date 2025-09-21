import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { WorldMapComponent } from 'src/app/components/world-map/world-map.component';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.page.html',
  styleUrls: ['./analytics.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, WorldMapComponent],
})
export class AnalyticsPage implements OnInit {
  countries: any[] = [];
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
      console.log(this.countries);
      this.loading = false;
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }
}
