import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { LoadingSpinnerComponent } from 'src/app/components/loading-spinner/loading-spinner.component';
import { FactComponent } from 'src/app/components/fact/fact.component';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LoadingSpinnerComponent,
    FactComponent,
  ],
})
export class HomePage implements OnInit {
  facts: any[] = [];
  baseURL = 'http://localhost:8000';
  selectedTab: 'list' | 'contribute' = 'list';

  newFact = {
    text: '',
    source: '',
    user_id: localStorage.getItem('user_data')
      ? JSON.parse(localStorage.getItem('user_data')!).user_id
      : '',
    topic_id: '',
  };

  topicSearch = '';
  topics: any[] = [];
  selectedTopic: any = null;

  loading = true;

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
        )}`,
        {
          headers: this.authService.getAuthHeaders(),
        }
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
        headers: this.authService.getAuthHeaders(),
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
