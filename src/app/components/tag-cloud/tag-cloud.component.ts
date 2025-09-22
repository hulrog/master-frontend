import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
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
  @Output() tagSelected = new EventEmitter<Tag | null>();

  tags: Tag[] = [];
  selectedTag: Tag | null = null;
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
    } catch (error) {
      console.error('Error fetching tag cloud:', error);
    }
    this.loading = false;
  }

  getFontSize(weight: number): string {
    if (!this.tags.length) return '14px';
    const minSize = 12;
    const maxSize = 36;
    const maxWeight = Math.max(...this.tags.map((t) => t.weight), 1);
    return `${minSize + (weight / maxWeight) * (maxSize - minSize)}px`;
  }

  selectTag(tag: Tag) {
    if (this.selectedTag?.id === tag.id) {
      this.selectedTag = null; // deselect
    } else {
      this.selectedTag = tag;
    }
    this.tagSelected.emit(this.selectedTag);
  }

  isSelected(tag: Tag): boolean {
    return this.selectedTag?.id === tag.id;
  }
}
