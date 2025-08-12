import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonText,
} from '@ionic/angular/standalone';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonText,
    CommonModule,
    FormsModule,
  ],
})
export class RegisterPage implements OnInit {
  userData = {
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  };
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/']);
    }
  }

  async register() {
    this.errorMessage = '';
    if (
      !this.userData.name ||
      !this.userData.email ||
      !this.userData.password ||
      !this.userData.password_confirmation
    ) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    if (this.userData.password !== this.userData.password_confirmation) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    try {
      const success = await this.authService.register(
        this.userData.name,
        this.userData.email,
        this.userData.password,
        this.userData.password_confirmation
      );
      if (success) {
        this.router.navigate(['/']);
      } else {
        this.errorMessage = 'Registration failed';
      }
    } catch (error) {
      console.error('Registration error:', error);
      this.errorMessage = 'An error occurred during registration';
    }
  }
}
