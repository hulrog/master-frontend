import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

type Axis = 'economic' | 'authority' | 'social';
// economy   - left  + right
// authoirty - lib   + auth
// social    - trad  + prog

@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.page.html',
  styleUrls: ['./quiz.page.scss'],
  imports: [IonicModule, FormsModule, CommonModule],
})
export class QuizPage implements OnInit {
  facts: any[] = [];
  baseURL = 'http://localhost:8000';

  questions: { text: string; axis: Axis; weight: number }[] = [
    {
      text: 'Equality of opportunity, not of outcome.',
      axis: 'economic',
      weight: 1,
    },
    {
      text: 'A strong leader is needed to control society.',
      axis: 'authority',
      weight: 1,
    },
    {
      text: 'Modern way of life threatens family values.',
      axis: 'social',
      weight: -1,
    },
    {
      text: 'People should be able to live however they want, as long as that freedom does not threaten someone else.',
      axis: 'social',
      weight: 1,
    },
    {
      text: 'Morality can only be objective, and is best reached by following religion.',
      axis: 'social',
      weight: -1,
    },
    {
      text: 'Capitalism is the best way of lifting people out of poverty.',
      axis: 'economic',
      weight: 1,
    },
    {
      text: 'A strong society is protected by strong armies - military service should be mandatory.',
      axis: 'authority',
      weight: 1,
    },
    {
      text: 'Billionaires should pay their fair share, through a robust progressive tax system.',
      axis: 'economic',
      weight: -1,
    },
    {
      text: 'When injustice becomes law, resistence becomes duty.',
      axis: 'authority',
      weight: -1,
    },
    {
      text: 'Nationality, race, gender, sexuality and confession are all socially constructed and should be critically examined.',
      axis: 'social',
      weight: 1,
    },
    {
      text: 'The death penalty is a just punishment for the most serious crimes.',
      axis: 'authority',
      weight: 1,
    },
    {
      text: 'Businesses should be owned by those who create value - the workers.',
      axis: 'economic',
      weight: -1,
    },
  ];

  answers: number[] = [];

  results: Record<'economic' | 'authority' | 'social', number> = {
    economic: 0,
    authority: 0,
    social: 0,
  };

  // 8 je ekstremna vrednost jer ima 4 pitanja, sa max pomerajem za 2
  extremeValue: number = 8;

  currentQuestionIndex = 0;

  currentUser: any = null;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.currentUser = this.authService.getUser();
  }

  answerQuestion(value: number) {
    const question = this.questions[this.currentQuestionIndex];
    this.results[question.axis] += value * question.weight;
    this.currentQuestionIndex++;

    if (this.currentQuestionIndex >= this.questions.length) {
      this.submitQuiz();
    }
  }

  async submitQuiz() {
    if (!this.currentUser) {
      alert('No logged-in user!');
      return;
    }
    console.log(this.currentUser);

    const payload = {
      user_id: this.currentUser.user_id,
      authorityValue: this.normalize(this.results.authority),
      economicValue: this.normalize(this.results.economic),
      socialValue: this.normalize(this.results.social),
    };

    try {
      const response = await fetch(`${this.baseURL}/api/createIdeology`, {
        method: 'POST',
        headers: this.authService.getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Ideology saved:', data);
        // Update local storage varijable
        const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
        userData.ideology = data.ideology;
        localStorage.setItem('user_data', JSON.stringify(userData));
      } else {
        const err = await response.json();
        console.error('API error:', err);
        alert(err.message || 'Failed to save ideology');
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('Error submitting quiz');
    }
  }

  // Na vrednosti od -3 do 3
  normalize(value: number): number {
    return (value / this.extremeValue) * 3;
  }

  returnToProfile() {
    this.router.navigate(['/profile']);
  }
}
