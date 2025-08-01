import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FactComponent } from '../fact/fact.component';

@Component({
  selector: 'app-facts',
  templateUrl: './facts.component.html',
  styleUrls: ['./facts.component.scss'],
  imports: [IonicModule, FactComponent],
})
export class FactsComponent implements OnInit {
  facts: any[] = [];
  baseURL: string = 'http://localhost:8000'; // or use environment.ts

  constructor() {}

  ngOnInit(): void {
    this.loadFacts();
  }

  async loadFacts() {
    try {
      const response = await fetch('http://localhost:8000/api/getAllFacts');
      const data = await response.json();
      this.facts = data.facts || [];
    } catch (error) {
      console.error('Error fetching facts:', error);
    }
  }
}
