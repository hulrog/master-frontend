import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'standalone-expertise',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './expertise.component.html',
  styleUrls: ['./expertise.component.scss'],
})
export class ExpertiseComponent {
  @Input() expertise: any;

  baseURL = 'http://localhost:8000';

  constructor(private authService: AuthService) {}

  async rateExpertise(value: number) {
    const user = this.authService.getUser();

    try {
      const response = await fetch(
        `${this.baseURL}/api/createExpertiseRating`,
        {
          method: 'POST',
          headers: this.authService.getAuthHeaders(),
          body: JSON.stringify({
            user_id: user.user_id,
            expertise_id: this.expertise.expertise_id,
            rating: value,
          }),
        }
      );

      if (!response.ok) throw new Error('Failed to rate expertise');

      // instantly update the UI
      this.expertise.total_rating += value;
      this.expertise.user_rating = value; // mark that user already rated
    } catch (err) {
      console.error('Error rating expertise:', err);
    }
  }
}
