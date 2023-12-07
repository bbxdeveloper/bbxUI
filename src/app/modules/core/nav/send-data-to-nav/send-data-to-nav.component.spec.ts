import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SendDataToNavComponent } from './send-data-to-nav.component';

describe('SendDataToNavComponent', () => {
  let component: SendDataToNavComponent;
  let fixture: ComponentFixture<SendDataToNavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SendDataToNavComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SendDataToNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
