import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OfferUpdateDialogComponent } from './offer-update-dialog.component';

describe('OfferUpdateDialogComponent', () => {
  let component: OfferUpdateDialogComponent;
  let fixture: ComponentFixture<OfferUpdateDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OfferUpdateDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OfferUpdateDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
