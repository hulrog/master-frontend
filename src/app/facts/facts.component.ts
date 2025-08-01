import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FactComponent } from '../fact/fact.component';
import { FormsModule } from '@angular/forms';
import { LoadingSpinnerComponent } from '../shared/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-facts',
  templateUrl: './facts.component.html',
  styleUrls: ['./facts.component.scss'],
  standalone: true,
  imports: [IonicModule, FactComponent, FormsModule, LoadingSpinnerComponent],
})
export class FactsComponent implements OnInit {
  facts: any[] = [];
  baseURL = 'http://localhost:8000';
  selectedTab: 'list' | 'contribute' = 'list';

  newFact = {
    text: '',
    source: '',
    user_id: 2, // Zakucan ID
    topic_id: '',
  };

  topicSearch = '';
  topics: any[] = [];
  selectedTopic: any = null;

  loading = true;

  constructor() {}

  ngOnInit() {
    this.loadFacts();
  }

  async loadFacts() {
    try {
      const response = await fetch(`${this.baseURL}/api/getAllFacts`);
      const data = await response.json();
      this.loading = false;
      this.facts = (data.facts || []).sort(
        (a: any, b: any) => Number(b.fact_id) - Number(a.fact_id)
      );
    } catch (error) {
      console.error('Error fetching facts:', error);
    }
  }

  // Search topics by query
  async searchTopics(query: string) {
    if (!query) {
      this.topics = [];
      return;
    }
    try {
      const response = await fetch(
        `${this.baseURL}/api/getAllTopicsContainingLetters/${encodeURIComponent(
          query
        )}`
      );
      const data = await response.json();
      this.topics = data.topics || [];
    } catch (error) {
      console.error('Error searching topics:', error);
      this.topics = [];
    }
  }

  selectTopic(topic: any) {
    this.selectedTopic = topic;
    this.newFact.topic_id = topic.topic_id;
    this.topicSearch = topic.name;
    this.topics = [];
  }

  handleTopicInputClick() {
    if (this.selectedTopic) {
      this.selectedTopic = null;
      this.topicSearch = '';
    }
  }

  async submitFact() {
    if (!this.selectedTopic) {
      alert('Please select a topic.');
      return;
    }
    try {
      const response = await fetch(`${this.baseURL}/api/createFact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.newFact),
      });
      if (response.ok) {
        this.newFact.text = '';
        this.newFact.source = '';
        this.selectedTopic = null;
        this.topicSearch = '';
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
