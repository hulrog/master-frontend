import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from 'src/app/services/auth.service';

interface Tag {
  id: number;
  name: string;
  weight: number;
  users: number[];
  similarity?: number;
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

  getTagColor(tag: Tag): string {
    if (this.isSelected(tag)) {
      return 'var(--ion-color-text)'; // selected tag
    } else if (tag.similarity !== undefined && tag.similarity > 0) {
      const intensity = 0.2 + 0.8 * tag.similarity; // 0.2 = slabo siva, 1 = crna
      const grayLevel = Math.floor(255 * (1 - intensity));
      return `rgb(${grayLevel}, ${grayLevel}, ${grayLevel})`;
    } else {
      return 'rgb(220, 220, 220)'; // default slabo siva boja
    }
  }

  selectTag(tag: Tag) {
    if (this.selectedTag?.id === tag.id) {
      this.selectedTag = null;
      this.tags.forEach((t) => (t.similarity = 0));
    } else {
      this.selectedTag = tag;
      this.computeSimilarities(tag);
    }
    this.tagSelected.emit(this.selectedTag);
  }

  isSelected(tag: Tag): boolean {
    return this.selectedTag?.id === tag.id;
  }

  isSimilar(tag: Tag): boolean {
    return (
      tag.similarity !== undefined &&
      tag.similarity > 0 &&
      !this.isSelected(tag)
    );
  }

  private computeSimilarities(selectedTag: Tag) {
    const selectedUsers = new Set(selectedTag.users);
    this.tags.forEach((tag) => {
      if (tag.id === selectedTag.id) {
        tag.similarity = 1;
      } else {
        const common = tag.users.filter((u) => selectedUsers.has(u));
        tag.similarity =
          common.length / Math.max(tag.users.length, selectedUsers.size);
      }
    });
  }
}
