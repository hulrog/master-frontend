import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'standalone-fact',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './fact.component.html',
})
export class FactComponent {
  @Input() fact: any;
}
