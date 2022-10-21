import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateinvoiceloadComponent } from './createinvoiceload.component';

describe('CreateinvoiceComponent', () => {
  let component: CreateinvoiceloadComponent;
  let fixture: ComponentFixture<CreateinvoiceloadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateinvoiceloadComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateinvoiceloadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
