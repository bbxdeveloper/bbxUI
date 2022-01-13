import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FooterCommandInfo } from 'src/assets/model/FooterCommandInfo';

@Injectable({
  providedIn: 'root'
})
export class FooterService {
  readonly default: FooterCommandInfo[] = [
    { key: 'F1', value: '', disabled: false },
    { key: 'F2', value: '', disabled: false },
    { key: 'F3', value: '', disabled: false },
    { key: 'F4', value: '', disabled: false },
    { key: 'F5', value: '', disabled: false },
    { key: 'F6', value: '', disabled: false },
    { key: 'F7', value: '', disabled: false },
    { key: 'F8', value: '', disabled: false },
    { key: 'F9', value: '', disabled: false },
    { key: 'F10', value: '', disabled: false },
  ];

  commands: BehaviorSubject<FooterCommandInfo[]>;

  constructor() {
    this.commands = new BehaviorSubject<FooterCommandInfo[]>(this.default);
  }

  pushCommands(cmds: FooterCommandInfo[]): void {
    this.commands.next(cmds);
  }

  pushEmptyList(): void {
    this.commands.next(this.default);
  }
}
