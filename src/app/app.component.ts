import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  mailOutline,
  mailSharp,
  paperPlaneOutline,
  paperPlaneSharp,
  heartOutline,
  heartSharp,
  archiveOutline,
  archiveSharp,
  trashOutline,
  trashSharp,
  warningOutline,
  warningSharp,
  bookmarkOutline,
  bookmarkSharp,
  personOutline,
  personSharp,
  homeOutline,
  homeSharp,
  bookOutline,
  bookSharp,
  logOutOutline,
  logOutSharp,
} from 'ionicons/icons';
import { FormsModule } from '@angular/forms';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  imports: [RouterLink, RouterLinkActive, FormsModule, IonicModule],
})
export class AppComponent {
  public appPages = [
    { title: 'Home', url: '/', icon: 'home' },
    { title: 'Profile', url: '/profile', icon: 'person' },
    { title: 'Narratives', url: '/narratives', icon: 'book' },
  ];

  constructor(private authService: AuthService, private router: Router) {
    addIcons({
      mailOutline,
      mailSharp,
      paperPlaneOutline,
      paperPlaneSharp,
      heartOutline,
      heartSharp,
      archiveOutline,
      archiveSharp,
      trashOutline,
      trashSharp,
      warningOutline,
      warningSharp,
      bookmarkOutline,
      bookmarkSharp,
      personOutline,
      personSharp,
      homeOutline,
      homeSharp,
      bookOutline,
      bookSharp,
      logOutOutline,
      logOutSharp,
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
