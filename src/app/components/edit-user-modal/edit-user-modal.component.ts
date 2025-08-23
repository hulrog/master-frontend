import { Component, Input } from '@angular/core';
import { ModalController, IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'edit-user-modal',
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule],
  templateUrl: './edit-user-modal.component.html',
  styleUrls: ['./edit-user-modal.component.scss'],
})
export class EditUserModal {
  @Input() user: any;
  userData: any = {};
  baseURL = 'http://localhost:8000'; // Laravel server

  countries: any[] = [];
  errorMessage = '';
  genders = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
  ];

  constructor(
    private modalCtrl: ModalController,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Kloniranje podataka kako ne bi menjao input parametar
    this.userData = { ...this.user };
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

  dismiss() {
    this.modalCtrl.dismiss();
  }

  async submitForm() {
    try {
      const response = await fetch(
        `${this.baseURL}/api/updateUser/${this.user.user_id}`,
        {
          method: 'PUT',
          headers: this.authService.getAuthHeaders(),
          body: JSON.stringify({
            name: this.userData.name,
            email: this.userData.email,
            gender: this.userData.gender,
            country_id: this.userData.country_id,
          }),
        }
      );

      if (!response.ok) throw new Error('Failed to update user');

      const result = await response.json();
      console.log(result);
      this.modalCtrl.dismiss(result.user); // Updatovani user
    } catch (error) {
      console.error(error);
      alert('Failed to update user');
    }
  }
}
