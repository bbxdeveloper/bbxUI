import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockCardSideBarFormComponent } from './stock-card-side-bar-form.component';

describe('StockCardSideBarFormComponent', () => {
  let component: StockCardSideBarFormComponent;
  let fixture: ComponentFixture<StockCardSideBarFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StockCardSideBarFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StockCardSideBarFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
