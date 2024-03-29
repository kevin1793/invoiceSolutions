import { Component, ElementRef, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { UntypedFormControl } from '@angular/forms';
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
  title = 'Omni Web';
  email = new UntypedFormControl('');
  password = new UntypedFormControl('');
  loginMessage = 'Login below to get started';
  

  ngOnInit(): void {
    
  }

  login(){
    const auth = getAuth();
    console.log('AUTH before',auth);
    var email =this.email.value;
    var pass = this.password.value;
    signInWithEmailAndPassword(auth, email, pass)
      .then((userCredential) => {
        // Signed in 
        const user = userCredential.user;
        this.loggedIn = true;
        var userData = {email:email};
        localStorage.setItem('user',JSON.stringify(userData))
        this.router.navigate(['/dashboard'], { state: { loggedIn: true  } });
        this.elementRef.nativeElement.parent.destroy();
        // ...
        
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        this.loginMessage = 'Incorrect credentials'
      });
  }

}
