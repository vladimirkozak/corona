import { Component, OnInit, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit, AfterViewInit {

  public showMobileMenu: boolean = false;

  // tslint:disable-next-line: no-empty
  constructor() {}

  // tslint:disable-next-line: no-empty
  public ngOnInit(): void {}

  // tslint:disable-next-line: no-empty
  public ngAfterViewInit(): void {}

}
