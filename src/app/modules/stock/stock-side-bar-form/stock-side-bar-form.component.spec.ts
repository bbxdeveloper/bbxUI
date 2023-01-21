import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockSideBarFormComponent } from './stock-side-bar-form.component';

describe('StockSideBarFormComponent', () => {
  let component: StockSideBarFormComponent;
  let fixture: ComponentFixture<StockSideBarFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StockSideBarFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StockSideBarFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
