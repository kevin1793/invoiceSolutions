import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClickService {

  constructor() { }

  private isMenuOpenSubject = new BehaviorSubject<boolean>(false);
  isMenuOpen$ = this.isMenuOpenSubject.asObservable();

  closeMenu() {
    this.isMenuOpenSubject.next(false);
  }
}
