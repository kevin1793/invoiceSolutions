import { Component, OnInit,Output ,Input } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  dashboard = true;
  currentFeature = '';
  loggedIn = false;
  dashboardData = 'Y';
  constructor() { }


  ngOnInit(): void {
    console.log('DASHBOARD PAGE',history.state);
    
  }

  test(){
    console.log(this.currentFeature);
  }

  currentFeatureChanged(x:any){
    console.log('currentFeatureChange parent',x);
    this.currentFeature = x;
  }
}
