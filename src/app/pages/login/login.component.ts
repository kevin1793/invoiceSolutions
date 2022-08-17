import { Component, ElementRef, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { FormControl } from '@angular/forms';
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loggedIn:boolean = false;
  constructor(private router:Router,
    private elementRef: ElementRef
    ){} 
  title = 'markPaving';
  email = new FormControl('');
  password = new FormControl('');
  loginMessage = 'Login below to get started';
  

  ngOnInit(): void {
  }

  login(){
    const auth = getAuth();
    var email =this.email.value;
    var pass = this.password.value;
    signInWithEmailAndPassword(auth, email, pass)
      .then((userCredential) => {
        // Signed in 
        const user = userCredential.user;
        this.router.navigate(['/dashboard'], { state: { loggedIn: true  } });
        this.elementRef.nativeElement.parent.destroy();
        // ...
        this.loggedIn = true;
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        this.loginMessage = 'Incorrect credentials'
      });
  }

}
