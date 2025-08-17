import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { FactComponent } from '../../components/fact/fact.component';
import { BlurTextDirective } from '../../directives/blur.directive';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-narratives',
  templateUrl: './narratives.page.html',
  styleUrls: ['./narratives.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, FactComponent, BlurTextDirective],
})
export class NarrativesPage implements OnInit {
  facts: any[] = [];
  checkedFacts: Set<number> = new Set();
  aiSummary: string | null = null;
  baseURL = 'http://localhost:8000';

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.loadFacts();
  }

  async loadFacts() {
    try {
      const response = await fetch(`${this.baseURL}/api/getAllFacts`, {
        headers: this.authService.getAuthHeaders(),
      });
      const data = await response.json();
      this.facts = data.facts || [];
    } catch (error) {
      console.error('Error fetching facts:', error);
    }
  }

  toggleFactChecked(factId: number) {
    if (this.checkedFacts.has(factId)) {
      this.checkedFacts.delete(factId);
    } else {
      this.checkedFacts.add(factId);
    }
  }

  async seeAISummary() {
    const selectedFactsTexts = this.facts
      .filter((fact) => this.checkedFacts.has(fact.fact_id))
      .map((fact) => fact.text);

    const payload = {
      facts: selectedFactsTexts,
    };

    console.log('Payload for AI summary:', payload);

    try {
      const response = await fetch(`${this.baseURL}/api/testAi`, {
        method: 'POST',
        headers: this.authService.getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        this.aiSummary = data.response || 'No summary received.';
      } else {
        alert('Failed to get AI summary');
      }
    } catch (error) {
      console.error('Error fetching AI summary:', error);
      alert('Error fetching AI summary');
    }
  }
}
