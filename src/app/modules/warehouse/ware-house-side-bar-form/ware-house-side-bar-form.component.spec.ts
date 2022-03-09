import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WareHouseSideBarFormComponent } from './ware-house-side-bar-form.component';

describe('WareHouseSideBarFormComponent', () => {
  let component: WareHouseSideBarFormComponent;
  let fixture: ComponentFixture<WareHouseSideBarFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WareHouseSideBarFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WareHouseSideBarFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
