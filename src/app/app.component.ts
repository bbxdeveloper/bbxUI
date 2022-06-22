import { Component, OnInit } from '@angular/core';
import { NbSidebarService } from '@nebular/theme';
import { ElectronService } from 'ngx-electron';
import { Title } from '@angular/platform-browser';
import { environment } from 'src/environments/environment';
import packageJson from '../../package.json';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  headerTitle: string = 'BBX';
  version: string = '';
  devVersion: boolean = false;
  buildType: string = 'unknown';

  constructor(private es: ElectronService, private sidebarService: NbSidebarService, private title: Title) { }

  ngOnInit() {
    setTimeout(() => {
      this.sidebarService.collapse();
    }, 200);
    
    environment.electron = this.es.isElectronApp;
    
    this.devVersion = !environment.production;
    this.version = packageJson.version;

    this.buildType = environment.buildType;

    this.title.setTitle('BBX v' + this.version);
  }
}
