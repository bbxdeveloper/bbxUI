import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LocationSideBarFormComponent } from './location-side-bar-form.component';

describe('LocationSideBarFormComponent', () => {
  let component: LocationSideBarFormComponent;
  let fixture: ComponentFixture<LocationSideBarFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LocationSideBarFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LocationSideBarFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
