import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BaseSideBarFormComponent } from './base-side-bar-form.component';

describe('BaseSideBarFormComponent', () => {
  let component: BaseSideBarFormComponent;
  let fixture: ComponentFixture<BaseSideBarFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BaseSideBarFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BaseSideBarFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
