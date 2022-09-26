import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InlineEditableTableComponent } from './inline-editable-table.component';

describe('InlineEditableTableComponent', () => {
  let component: InlineEditableTableComponent;
  let fixture: ComponentFixture<InlineEditableTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InlineEditableTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InlineEditableTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
