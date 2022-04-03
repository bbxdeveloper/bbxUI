import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectTableDialogComponent } from './select-table-dialog.component';

describe('SelectTableDialogComponent', () => {
  let component: SelectTableDialogComponent;
  let fixture: ComponentFixture<SelectTableDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SelectTableDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectTableDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
