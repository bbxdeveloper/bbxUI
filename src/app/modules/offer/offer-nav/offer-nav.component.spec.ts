import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OfferNavComponent } from './offer-nav.component';

describe('OfferNavComponent', () => {
  let component: OfferNavComponent;
  let fixture: ComponentFixture<OfferNavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OfferNavComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OfferNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
