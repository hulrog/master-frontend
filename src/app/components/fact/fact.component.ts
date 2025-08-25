import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { DateFormatPipe } from '../../pipes/date-format.pipe';
import { HighlightDirective } from '../../directives/highlight.directive';
import { AuthService } from 'src/app/services/auth.service';
import { thumbsDown, thumbsUp } from 'ionicons/icons';
import { addIcons } from 'ionicons';

@Component({
  selector: 'standalone-fact',
  standalone: true,
  imports: [CommonModule, IonicModule, DateFormatPipe, HighlightDirective],
  templateUrl: './fact.component.html',
  styleUrls: ['./fact.component.scss'],
})
export class FactComponent {
  @Input() fact: any;

  baseURL = 'http://localhost:8000';

  constructor(private authService: AuthService) {
    addIcons({
      thumbsDown,
      thumbsUp,
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

      this.fact.user_rating = rating ? 1 : 0;
    } catch (error) {
      console.error('Vote error:', error);
      alert('Error submitting vote');
    }
  }
}
