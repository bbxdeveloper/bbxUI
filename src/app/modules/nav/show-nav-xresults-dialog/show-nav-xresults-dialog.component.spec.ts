import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowNavXResultsDialogComponent } from './show-nav-xresults-dialog.component';

describe('ShowNavXResultsDialogComponent', () => {
  let component: ShowNavXResultsDialogComponent;
  let fixture: ComponentFixture<ShowNavXResultsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShowNavXResultsDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ShowNavXResultsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
