import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoicetrackerComponent } from './invoicetracker.component';

describe('InvoicetrackerComponent', () => {
  let component: InvoicetrackerComponent;
  let fixture: ComponentFixture<InvoicetrackerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InvoicetrackerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InvoicetrackerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
