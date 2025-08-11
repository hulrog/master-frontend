import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { DateFormatPipe } from '../../pipes/date-format.pipe';
import { HighlightDirective } from '../../directives/highlight.directive';

@Component({
  selector: 'standalone-user',
  standalone: true,
  imports: [CommonModule, IonicModule, DateFormatPipe, HighlightDirective],
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss'],
})
export class UserComponent {
  @Input() user: any;

  expandedUser: boolean | null = false;

  toggleDetails() {
    this.expandedUser = !this.expandedUser;
  }
}
