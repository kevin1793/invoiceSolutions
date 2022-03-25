import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-updatelog',
  templateUrl: './updatelog.component.html',
  styleUrls: ['./updatelog.component.css']
})
export class UpdatelogComponent implements OnInit {

  constructor() { }

  dashboard = true;
  dashboardData = 'Y';

  ngOnInit(): void {
  }

}
