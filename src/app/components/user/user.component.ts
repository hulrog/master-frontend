import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { HighlightDirective } from '../../directives/highlight.directive';

@Component({
  selector: 'standalone-user',
  standalone: true,
  imports: [CommonModule, IonicModule, HighlightDirective],
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss'],
})
export class UserComponent {
  @Input() user: any;
}
