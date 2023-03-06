import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-updatelog',
  templateUrl: './updatelog.component.html',
  styleUrls: ['./updatelog.component.css']
})
export class UpdatelogComponent implements OnInit {

  constructor(
    private router:Router
    ) { }

  dashboard = true;
  dashboardData = 'Y';

  ngOnInit(): void {
    var userAuth = localStorage.getItem('user');
    if(!userAuth){
      this.router.navigate(['/login']);
    }
  }

}
