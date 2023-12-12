import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavTechnicalCancelDialogComponent } from './nav-technical-cancel-dialog.component';

describe('NavTechnicalCancelDialogComponent', () => {
  let component: NavTechnicalCancelDialogComponent;
  let fixture: ComponentFixture<NavTechnicalCancelDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NavTechnicalCancelDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NavTechnicalCancelDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
