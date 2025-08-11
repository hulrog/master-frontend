import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { DateFormatPipe } from '../../pipes/date-format.pipe';
import { HighlightDirective } from '../../directives/highlight.directive';

@Component({
  selector: 'standalone-fact',
  standalone: true,
  imports: [CommonModule, IonicModule, DateFormatPipe, HighlightDirective],
  templateUrl: './fact.component.html',
  styleUrls: ['./fact.component.scss'],
})
export class FactComponent {
  @Input() fact: any;
}
