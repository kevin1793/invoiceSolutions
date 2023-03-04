import { Component, Input, Output, EventEmitter, ViewChild, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { ClickService } from './services/click.service';
import { SidemenuComponent } from './components/sidemenu/sidemenu.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
  @Input() message: string = '';
  @Output() messageEvent = new EventEmitter<string>();

  @ViewChild(SidemenuComponent, { static: false })
  childComponent!: SidemenuComponent;

  constructor(private router: Router, private click: ClickService) { }

  ngAfterViewInit() {
    console.log(this.childComponent);
  }

  ngOnInit(): void {}

  sendMessage(e: any) {
    console.log('click from app main',e.srcElement.className);
    if(typeof e.srcElement.className == 'string' && (!e.srcElement.className.includes('openedMenu') || !e.srcElement.className.includes('menuBtnCont')) ){
      this.click.closeMenu();
    }
  }
}