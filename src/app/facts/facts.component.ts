import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FactComponent } from '../fact/fact.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-facts',
  templateUrl: './facts.component.html',
  styleUrls: ['./facts.component.scss'],
  standalone: true,
  imports: [IonicModule, FactComponent, FormsModule],
})
export class FactsComponent implements OnInit {
  facts: any[] = [];
  baseURL = 'http://localhost:8000';
  selectedTab: 'list' | 'contribute' = 'list';

  newFact = {
    text: '',
    source: '',
    user_id: 2, // Zakucan ID
    topic_id: 2, // Zakucan ID
  };

  constructor() {}

  ngOnInit() {
    this.loadFacts();
  }

  async loadFacts() {
    try {
      const response = await fetch(`${this.baseURL}/api/getAllFacts`);
      const data = await response.json();
      this.facts = (data.facts || []).sort(
        (a: any, b: any) =>
          new Date(b.date_entered).getTime() -
          new Date(a.date_entered).getTime()
      );
    } catch (error) {
      console.error('Error fetching facts:', error);
    }
  }

  async submitFact() {
    try {
      const response = await fetch(`${this.baseURL}/api/createFact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.newFact),
      });
      if (response.ok) {
        this.newFact.text = '';
        this.newFact.source = '';
        this.selectedTab = 'list';
        await this.loadFacts();
      } else {
        alert('Failed to submit fact');
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('Error submitting fact');
    }
  }
}
