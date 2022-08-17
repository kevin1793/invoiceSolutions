import { Component, OnInit } from '@angular/core';

import { NavbarComponent } from 'src/app/components/navbar/navbar.component';
import { SidemenuComponent } from 'src/app/components/sidemenu/sidemenu.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(private router:Router) { }

  ngOnInit(): void {
  }

}
