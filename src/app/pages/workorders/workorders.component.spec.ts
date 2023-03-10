import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkordersComponent } from './workorders.component';

describe('WorkordersComponent', () => {
  let component: WorkordersComponent;
  let fixture: ComponentFixture<WorkordersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkordersComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkordersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
