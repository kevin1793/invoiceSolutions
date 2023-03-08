import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarkpavingComponent } from './markpaving.component';

describe('MarkpavingComponent', () => {
  let component: MarkpavingComponent;
  let fixture: ComponentFixture<MarkpavingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MarkpavingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MarkpavingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
