import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NarrativesPage } from './narratives.page';

describe('NarrativesPage', () => {
  let component: NarrativesPage;
  let fixture: ComponentFixture<NarrativesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(NarrativesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
