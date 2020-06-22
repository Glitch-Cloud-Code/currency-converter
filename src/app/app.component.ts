import { Component } from '@angular/core';
import { Tabs } from './components/top-bar/top-bar.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'currency-converter';

  public selectedTab = Tabs.RC;
  tabs = Tabs;

  public onTabChanged(tab) {
    this.selectedTab = tab;
  }
}
