import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { DateFormatPipe } from '../../pipes/date-format.pipe';
import { AuthService } from 'src/app/services/auth.service';
import { thumbsDown, thumbsUp, search } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';
import { WorldMapComponent } from '../world-map/world-map.component';

@Component({
  selector: 'standalone-fact',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    DateFormatPipe,
    LoadingSpinnerComponent,
    WorldMapComponent,
  ],
  templateUrl: './fact.component.html',
  styleUrls: ['./fact.component.scss'],
})
export class FactComponent {
  @Input() fact: any;

  baseURL = 'http://localhost:8000';
  flipped = false; // toggle front/back
  loading = false;

  constructor(private authService: AuthService) {
    addIcons({
      thumbsDown,
      thumbsUp,
      search,
    });
  }

  async vote(factId: number, rating: boolean) {
    if (rating == this.fact.user_rating) return;

    try {
      const response = await fetch(`${this.baseURL}/api/createFactVote`, {
        method: 'POST',
        headers: this.authService.getAuthHeaders(),
        body: JSON.stringify({
          fact_id: factId,
          user_id: this.authService.getUser().user_id,
          rating: rating,
        }),
      });

      if (!response.ok) {
        alert('Failed to vote');
        return;
      }

      const data = await response.json();
      const weight = data.fact_vote.weight;
      const trueCountry = data.top_countries.true;
      const falseCountry = data.top_countries.false;

      if (
        this.fact.user_rating === null ||
        this.fact.user_rating === undefined
      ) {
        if (rating) {
          this.fact.true_ratings += weight;
        } else {
          this.fact.false_ratings += weight;
        }
      } else {
        if (rating) {
          this.fact.true_ratings += weight;
          this.fact.false_ratings -= weight;
        } else {
          this.fact.true_ratings -= weight;
          this.fact.false_ratings += weight;
        }
      }

      this.fact.true_country = trueCountry;
      this.fact.false_country = falseCountry;

      this.fact.user_rating = rating ? 1 : 0;
    } catch (error) {
      console.error('Vote error:', error);
      alert('Error submitting vote');
    }
  }

  toggleFlip() {
    this.flipped = !this.flipped;
    if (this.flipped) {
      this.loading = true;
      this.getFactDetails(this.fact.fact_id);
    }
  }

  async getFactDetails(factId: number) {
    try {
      const response = await fetch(
        `${this.baseURL}/api/getFactDetails/${factId}`,
        {
          headers: this.authService.getAuthHeaders(),
        }
      );
      if (response.ok) {
        const data = await response.json();
        const detailedFact = data.fact;

        this.fact.true_countries = detailedFact.true_countries || [];
        this.fact.false_countries = detailedFact.false_countries || [];
        console.log(this.fact.true_countries);
      } else {
        alert('Failed to fetch fact details');
      }
    } catch (error) {
      console.error('Error fetching fact details:', error);
      alert('Error fetching fact details');
    } finally {
      this.loading = false;
    }
  }
}
