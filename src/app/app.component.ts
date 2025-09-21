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
    { title: 'Test', url: '/test', icon: 'mail' },
    { title: 'Analytics', url: '/analytics', icon: 'mail' },
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

  async logout() {
    await this.authService.logout();
    document.body.classList.add('fade-out');
    this.router.navigate(['/login']);

    setTimeout(() => {
      document.body.classList.remove('fade-out');
    }, 300);
  }

  isAuthPage() {
    return ['/login', '/register'].includes(this.router.url);
  }
}
