import 'reflect-metadata'
import { Component, HostListener, OnInit } from '@angular/core';
import { NbSidebarService } from '@nebular/theme';
import { Title } from '@angular/platform-browser';
import { environment } from 'src/environments/environment';
import packageJson from '../../package.json';
import { StatusService } from './services/status.service';

declare function JsonIgnore(target?: Object, propertyKey?: string, descriptor?: PropertyDescriptor): any

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

  constructor(private sidebarService: NbSidebarService, private title: Title, private status: StatusService) { }

  ngOnInit() {
    setTimeout(() => {
      this.sidebarService.collapse();
    }, 200);
    
    environment.electron = !!window.navigator.userAgent.match(/Electron/);
    
    this.devVersion = !environment.production;
    this.version = packageJson.version;

    this.buildType = environment.buildType;

    this.title.setTitle('BBX v' + this.version);
  }

  @HostListener('document:keydown', ['$event']) onKeyDown(event: KeyboardEvent) {
    if (this.status.InProgress) {
      event.preventDefault();
      event.stopImmediatePropagation();
      event.stopPropagation();
      return;
    }
  }
}
