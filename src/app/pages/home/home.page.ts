import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { LoadingSpinnerComponent } from 'src/app/components/loading-spinner/loading-spinner.component';
import { FactComponent } from 'src/app/components/fact/fact.component';
import { AuthService } from 'src/app/services/auth.service';
import { TagCloudComponent } from 'src/app/components/tag-cloud/tag-cloud.component';
import { addIcons } from 'ionicons';
import { chevronUpOutline, chevronDownOutline } from 'ionicons/icons';

addIcons({
  chevronUpOutline,
  chevronDownOutline,
});

interface Tag {
  id: number;
  name: string;
  weight: number;
}

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
    TagCloudComponent,
  ],
})
export class HomePage implements OnInit {
  selectedTab: 'list' | 'contribute' = 'list';
  baseURL = 'http://localhost:8000';
  facts: any[] = [];

  // Tag Cloud
  selectedTag: Tag | null = null;
  drawerOpen = false;

  // Contribute tab
  storedUser = localStorage.getItem('user_data');
  userId = this.storedUser ? JSON.parse(this.storedUser).user_id : '';
  newFact: any = {
    text: '',
    source: '',
    area_id: null,
    topic_id: null,
    new_area_name: '',
    new_topic_name: '',
  };
  topicSearch = '';
  areas: any[] = [];
  topics: any[] = [];
  selectedTopic: any = null;

  loading = true;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.loadAreas();
  }

  ionViewWillEnter() {
    this.loadFacts();
  }

  async loadFacts() {
    try {
      const response = await fetch(`${this.baseURL}/api/getInterestingFacts`, {
        headers: this.authService.getAuthHeaders(),
      });
      const data = await response.json();
      this.facts = (data.facts || []).sort(
        (a: any, b: any) => Number(b.fact_id) - Number(a.fact_id)
      );
      this.loading = false;
      console.log(this.facts);
    } catch (error) {
      console.error('Error fetching facts:', error);
    }
  }

  // Tag Cloud kao filter
  onTagSelected(tag: Tag | null) {
    this.selectedTag = tag;
  }

  get filteredFacts() {
    if (!this.selectedTag) return this.facts;
    return this.facts.filter((f) => f.topic_id === this.selectedTag?.id);
  }

  // Contribute tab

  async loadAreas() {
    try {
      const response = await fetch(`${this.baseURL}/api/getAllAreas`, {
        headers: this.authService.getAuthHeaders(),
      });
      const data = await response.json();
      this.areas = (data.areas || []).sort(
        (a: any, b: any) => Number(b.area_id) - Number(a.area_id)
      );
      console.log(this.areas);
    } catch (error) {
      console.error('Error fetching areas:', error);
    }
  }

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

  clearTopic() {
    this.selectedTopic = null;
    this.topicSearch = '';
    this.newFact.area_name = null;
    this.newFact.area_id = null;
  }

  selectTopic(topic: any) {
    this.selectedTopic = topic;
    this.newFact.topic_id = topic.topic_id;
    this.topicSearch = topic.name;

    // Auto fill area
    if (topic.area_name) {
      this.newFact.area_id = topic.area.area_id;
      this.newFact.area_name = topic.area.name;
    }
    console.log(this.selectedTopic);
    this.topics = [];
  }

  handleTopicInputClick() {
    if (this.selectedTopic) {
      this.selectedTopic = null;
      this.topicSearch = '';
      this.newFact.area_name = null;
      this.newFact.area_id = null;
    }
  }

  async submitFact() {
    // Validate text and source
    if (!this.newFact.text || !this.newFact.source) {
      alert('Please fill in text and source.');
      return;
    }

    const payload: any = {
      text: this.newFact.text,
      source: this.newFact.source,
      user_id: this.authService.getUser().user_id,
    };

    if (this.selectedTopic) {
      // Existing topic selected
      payload.topic_id = this.selectedTopic.topic_id;
    } else if (this.topicSearch) {
      // New topic typed
      payload.new_topic_name = this.topicSearch;

      // Area selection for new topic
      if (this.newFact.area_id) {
        payload.area_id = this.newFact.area_id;
      } else if (this.newFact.new_area_name) {
        payload.new_area_name = this.newFact.new_area_name;
      } else {
        alert('Please select or enter an area for the new topic.');
        return;
      }
    } else {
      alert('Please select or enter a topic.');
      return;
    }

    try {
      const response = await fetch(`${this.baseURL}/api/createFact`, {
        method: 'POST',
        headers: this.authService.getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        this.newFact = {
          text: '',
          source: '',
          area_id: null,
          topic_id: null,
          new_area_name: '',
          new_topic_name: '',
        };
        this.topicSearch = '';
        this.selectedTopic = null;
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
