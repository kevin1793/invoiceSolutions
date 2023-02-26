import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.css']
})
export class InventoryComponent implements OnInit {

  dashboard = true;
  dashboardData = 'Y';
  showAddInvoiceBox = false;
  cachedData = true;

  constructor() { }

  ngOnInit(): void {
  }

  refreshClicked(){
    
  }

}
