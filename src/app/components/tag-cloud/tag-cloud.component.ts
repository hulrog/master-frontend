import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from 'src/app/services/auth.service';

interface Tag {
  id: number;
  name: string;
  weight: number;
}

@Component({
  selector: 'standalone-tag-cloud',
  templateUrl: './tag-cloud.component.html',
  styleUrls: ['./tag-cloud.component.scss'],
  imports: [CommonModule],
})
export class TagCloudComponent implements OnInit {
  @Input() baseURL = 'http://localhost:8000';
  tags: Tag[] = [];
  loading = true;

  constructor(private authService: AuthService) {}

  async ngOnInit() {
    await this.loadTags();
  }

  async loadTags() {
    try {
      const response = await fetch(`${this.baseURL}/api/getTagCloud`, {
        headers: this.authService.getAuthHeaders(),
      });

      const data = await response.json();
      this.tags = data.tags || [];
      console.log('Tag cloud:', this.tags);
    } catch (error) {
      console.error('Error fetching tag cloud:', error);
    }
    this.loading = false;
  }

  getFontSize(weight: number): string {
    if (!this.tags.length) return '14px';

    const minSize = 12;
    const maxSize = 40;
    const maxWeight = Math.max(...this.tags.map((t) => t.weight), 1);
    const size = minSize + (weight / maxWeight) * (maxSize - minSize);
    return `${size}px`;
  }
}
