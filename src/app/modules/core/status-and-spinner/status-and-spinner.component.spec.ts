import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatusAndSpinnerComponent } from './status-and-spinner.component';

describe('StatusAndSpinnerComponent', () => {
  let component: StatusAndSpinnerComponent;
  let fixture: ComponentFixture<StatusAndSpinnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StatusAndSpinnerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StatusAndSpinnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
