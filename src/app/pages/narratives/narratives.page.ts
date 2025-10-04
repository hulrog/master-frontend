import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { AuthService } from 'src/app/services/auth.service';
import { LoadingSpinnerComponent } from 'src/app/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-narratives',
  templateUrl: './narratives.page.html',
  styleUrls: ['./narratives.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, LoadingSpinnerComponent],
})
export class NarrativesPage implements OnInit {
  baseURL: string = 'http://localhost:8000';
  aiSummary: string = '';
  sources: string[] = [];
  factsForAI: [] = [];

  topicSearch = '';
  selectedTopic: any = null;
  topics: any[] = [];

  selectedCountries: number[] = [];
  selectedGenders: string[] = [];
  countries: { country_id: number; name: string; code: string }[] = [];
  genders: string[] = ['male', 'female', 'other'];
  ageRanges = [
    { label: '18-25', min: 18, max: 25 },
    { label: '26-35', min: 26, max: 35 },
    { label: '36-50', min: 36, max: 50 },
    { label: '51+', min: 51, max: 150 },
  ];
  selectedAgeRange: any = null;
  selectedVerified: boolean | null = null;
  economicValue: string | null = 'neutral';
  authorityValue: string | null = 'neutral';
  socialValue: string | null = 'neutral';

  loading: boolean = false;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.loadCountries();
  }

  async loadCountries() {
    try {
      const response = await fetch(
        'http://localhost:8000/api/getAllCountries',
        {
          headers: this.authService.getAuthHeaders(),
        }
      );
      const data = await response.json();
      this.countries = data.countries || [];
    } catch (error) {
      console.error('Error loading countries:', error);
    }
  }

  // === Topics ===
  async searchTopics(query: string) {
    this.topicSearch = query;
    if (!query) {
      this.topics = [];
      return;
    }

    try {
      const res = await fetch(
        `${this.baseURL}/api/getAllTopicsContainingLetters/${encodeURIComponent(
          query
        )}`,
        {
          headers: this.authService.getAuthHeaders(),
        }
      );
      const data = await res.json();
      this.topics = data.topics || [];
    } catch (err) {
      console.error('Error searching topics', err);
      this.topics = [];
    }
  }

  selectTopic(topic: any) {
    this.selectedTopic = topic;
    this.topicSearch = topic.name;
    this.topics = [];
  }

  clearTopic() {
    this.selectedTopic = null;
    this.topicSearch = '';
  }

  // === Facts search i AI poziv ===

  async getFactsForAI() {
    if (!this.selectedTopic) {
      alert('Please select a topic');
      return;
    }

    const payload: any = { topic_id: this.selectedTopic.topic_id };
    if (this.selectedCountries.length)
      payload.countries = this.selectedCountries;
    if (this.selectedGenders.length) payload.genders = this.selectedGenders;

    if (this.selectedAgeRange && this.selectedAgeRange.length) {
      payload.age_ranges = this.selectedAgeRange.map((r: any) => ({
        min: r.min,
        max: r.max,
      }));
    }
    if (this.selectedVerified !== null) {
      payload.verified = this.selectedVerified;
    }
    if (this.economicValue) payload.economicValue = this.economicValue;
    if (this.authorityValue) payload.authorityValue = this.authorityValue;
    if (this.socialValue) payload.socialValue = this.socialValue;
    console.log(payload);
    try {
      const response = await fetch(
        `${this.baseURL}/api/getAllFactsThatMeetRequirements`,
        {
          method: 'POST',
          headers: this.authService.getAuthHeaders(),
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        const data = await response.json();
        this.factsForAI = data.facts || [];
        console.log(this.factsForAI);
      } else {
        const err = await response.json();
        console.error(err);
        alert(err.message || 'Failed to fetch facts');
      }
    } catch (err) {
      console.error('Error fetching facts', err);
    }
  }

  async seeAISummary() {
    this.loading = true;

    await this.getFactsForAI();

    const payload = {
      facts: this.factsForAI.map((f: any) => f.text),
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
        this.sources = this.factsForAI
          .map((f: any) => f.source)
          .filter((s) => s);
      } else {
        alert('Failed to get AI summary');
      }
    } catch (error) {
      console.error('Error fetching AI summary:', error);
      alert('Error fetching AI summary');
    } finally {
      this.loading = false;
    }
  }

  clearNarrative() {
    this.aiSummary = '';
    this.sources = [];
    this.topicSearch = '';
    this.selectedTopic = null;
    this.topics = [];
    this.selectedCountries = [];
    this.selectedGenders = [];
  }
}
