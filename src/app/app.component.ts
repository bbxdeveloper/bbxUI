import { Component, OnInit } from '@angular/core';
import { NbSidebarService } from '@nebular/theme';
import { ElectronService } from 'ngx-electron';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  headerTitle = 'BBX';

  constructor(private es: ElectronService, private sidebarService: NbSidebarService) { }

  ngOnInit() {
    setTimeout(() => {
      this.sidebarService.collapse();
    }, 200);
    environment.electron = this.es.isElectronApp;
    environment.electron ?
      this.headerTitle += " (desktop)" : this.headerTitle += " (web)";
  }
}
