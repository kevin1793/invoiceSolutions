import { Component, OnInit,Input } from '@angular/core';
import { NavbarComponent } from 'src/app/components/navbar/navbar.component';
import { SidemenuComponent } from 'src/app/components/sidemenu/sidemenu.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  dashboard = true;
  dashboardData = 'Y';
  constructor() { }


  ngOnInit(): void {
    console.log('DASHBOARD PAGE',history.state);
  }

}
