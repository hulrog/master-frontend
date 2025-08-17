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
  IonSelect,
  IonSelectOption,
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
    IonSelect,
    IonSelectOption,
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
    gender: '',
    country_id: '',
    date_of_birth: '',
  };
  countries: any[] = [];
  errorMessage = '';
  genders = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
  ];

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/']);
      return;
    }
    this.loadCountries();
  }

  async loadCountries() {
    try {
      const response = await fetch(
        'http://localhost:8000/api/getAllCountries',
        {
          headers: this.authService.getAuthHeaders(),
        }
      );
      const data = await response.json();
      this.countries = data.countries || [];
    } catch (error) {
      console.error('Error loading countries:', error);
      this.errorMessage = 'Error loading countries';
    }
  }

  async register() {
    this.errorMessage = '';
    if (
      !this.userData.name ||
      !this.userData.email ||
      !this.userData.password ||
      !this.userData.password_confirmation ||
      !this.userData.gender ||
      !this.userData.country_id ||
      !this.userData.date_of_birth
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
        this.userData.gender,
        this.userData.country_id,
        this.userData.date_of_birth
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
