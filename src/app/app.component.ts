import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { Router, ActivatedRoute, ParamMap } from '@angular/router';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(private router:Router){} 
}
