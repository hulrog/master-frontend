import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { FactComponent } from '../fact/fact.component';

@Component({
  selector: 'app-narratives',
  templateUrl: './narratives.component.html',
  styleUrls: ['./narratives.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, FactComponent],
})
export class NarrativesComponent implements OnInit {
  facts: any[] = [];
  checkedFacts: Set<number> = new Set();
  aiSummary: string | null = null;
  baseURL = 'http://localhost:8000';

  ngOnInit() {
    this.loadFacts();
  }

  async loadFacts() {
    try {
      const response = await fetch(`${this.baseURL}/api/getAllFacts`);
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
        headers: { 'Content-Type': 'application/json' },
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
