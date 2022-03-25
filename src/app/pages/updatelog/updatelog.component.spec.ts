import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdatelogComponent } from './updatelog.component';

describe('UpdatelogComponent', () => {
  let component: UpdatelogComponent;
  let fixture: ComponentFixture<UpdatelogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpdatelogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdatelogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
