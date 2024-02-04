import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FunctionRowComponent } from './function-row.component';

describe('FunctionRowComponent', () => {
  let component: FunctionRowComponent;
  let fixture: ComponentFixture<FunctionRowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FunctionRowComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FunctionRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
