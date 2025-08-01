import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { FactsComponent } from './facts.component';
import { FactComponent } from '../fact/fact.component';

describe('FactsComponent', () => {
  let component: FactsComponent;
  let fixture: ComponentFixture<FactsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), FactsComponent, FactComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FactsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should show facts', async () => {
    spyOn(window, 'fetch').and.returnValue(
      Promise.resolve({
        json: () =>
          Promise.resolve({
            facts: [
              { fact_id: 1, text: 'Fact 1', topic_id: 2 },
              { fact_id: 2, text: 'Fact 2', topic_id: 2 },
            ],
          }),
      } as any)
    );
    await component.loadFacts();
    expect(component.facts.length).toBe(2);
    expect(component.facts[0].text).toBe('Fact 2');
    expect(component.facts[1].text).toBe('Fact 1');
  });

  it('should create a fact with topic_id locked to 2', async () => {
    component.newFact = {
      text: 'Nemanja Fact',
      source: 'Source',
      user_id: 2,
      topic_id: '2',
    };
    component.selectedTopic = { topic_id: 2, name: 'Stefan Nemanja' };
    spyOn(window, 'fetch').and.callFake((url, options) => {
      if (typeof url === 'string' && url.includes('/api/createFact')) {
        expect(JSON.parse((options as any).body).topic_id).toBe('2');
        return Promise.resolve({ ok: true } as any);
      }
      return Promise.resolve({
        json: () => Promise.resolve({ facts: [] }),
      } as any);
    });
    await component.submitFact();
    expect(component.newFact.text).toBe('');
    expect(component.selectedTopic).toBeNull();
    expect(component.topicSearch).toBe('');
  });
});
