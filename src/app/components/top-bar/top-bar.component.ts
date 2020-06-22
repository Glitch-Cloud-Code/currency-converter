import { Component, OnInit, Output, EventEmitter } from '@angular/core';

export enum Tabs {
  RC = "ratesConverter",
  ROT =  "ratesOverTime"
}

@Component({
  selector: 'app-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.scss']
})

export class TopBarComponent implements OnInit {

  @Output() tabChanged = new EventEmitter<String>();

  tabs = Tabs;
  selectedTab: Tabs = Tabs.RC;

  constructor() { }

  ngOnInit(): void {
  }

  public selectTab(tab: Tabs) {
    if (this.selectedTab === tab) {
      return;
    }
    this.selectedTab = tab;
    this.tabChanged.emit(tab);
  }

  public isTabSelected(tab: Tabs) {
    return this.selectedTab === tab;
  }

}
