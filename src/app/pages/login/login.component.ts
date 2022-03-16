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
    console.log('LOGIN PAGE',this.elementRef.nativeElement);
  }

  login(){

    const auth = getAuth();
    var email =this.email.value;
    var pass = this.password.value;
    console.log(this.email,this.password);
    signInWithEmailAndPassword(auth, email, pass)
      .then((userCredential) => {
        // Signed in 
        const user = userCredential.user;
        console.log('Login Successful');
        this.router.navigate(['/dashboard']);
        this.elementRef.nativeElement.parent.destroy();
        // ...
        this.loggedIn = true;
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log('Login Failed');
        this.loginMessage = 'Incorrect credentials'
      });
  }

}
