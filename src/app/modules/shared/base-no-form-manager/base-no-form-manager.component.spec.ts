import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BaseNoFormManagerComponent } from './base-no-form-manager.component';

describe('BaseNoFormManagerComponent', () => {
  let component: BaseNoFormManagerComponent;
  let fixture: ComponentFixture<BaseNoFormManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BaseNoFormManagerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BaseNoFormManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
