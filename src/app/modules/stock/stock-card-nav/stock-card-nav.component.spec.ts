import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockCardNavComponent } from './stock-card-nav.component';

describe('StockCardCardNavComponent', () => {
  let component: StockCardNavComponent;
  let fixture: ComponentFixture<StockCardNavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StockCardNavComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StockCardNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
