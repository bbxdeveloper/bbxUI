import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WareHouseManagerComponent } from './ware-house-manager.component';

describe('WareHouseManagerComponent', () => {
  let component: WareHouseManagerComponent;
  let fixture: ComponentFixture<WareHouseManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WareHouseManagerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WareHouseManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
