import { Component, OnInit, Input } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'standalone-spinner',
  templateUrl: './loading-spinner.component.html',
  styleUrls: ['./loading-spinner.component.scss'],
  standalone: true,
  imports: [IonicModule],
})
export class LoadingSpinnerComponent implements OnInit {
  @Input() message: string = 'Loading...';
  constructor() {}

  ngOnInit() {}
}
