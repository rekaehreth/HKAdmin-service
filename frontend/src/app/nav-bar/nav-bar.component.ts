import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent implements OnInit {

  constructor() { }
  currentlyActive = -1;
  menuItems = [ 
    {
      title : "Training",
      routerLink : '/training',
    },
    {
      title : "Finances",
      routerLink : '/finance',
    },
    {
      title : "My Profile",
      routerLink : '/profile',
    },
    {
      title : "Settings",
      routerLink : '/settings',
    },
    {
      title : "Login",
      routerLink : '/registration',
    },
  ];
  ngOnInit(): void {
    
  }
}
