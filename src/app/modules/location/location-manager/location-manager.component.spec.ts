import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LocationManagerComponent } from './location-manager.component';

describe('LocationManagerComponent', () => {
  let component: LocationManagerComponent;
  let fixture: ComponentFixture<LocationManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LocationManagerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LocationManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
