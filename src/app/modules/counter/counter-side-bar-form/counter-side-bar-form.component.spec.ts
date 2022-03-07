import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CounterSideBarFormComponent } from './counter-side-bar-form.component';

describe('CounterSideBarFormComponent', () => {
  let component: CounterSideBarFormComponent;
  let fixture: ComponentFixture<CounterSideBarFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CounterSideBarFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CounterSideBarFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
