import { Injectable } from '@angular/core';
import { PrintAndDownloadService } from './print-and-download.service';

export enum LogLevel {
  None = 0,
  Info = 1,
  Verbose = 2,
  Warn = 3,
  Error = 4,
  Trace = 5,
}

export class LogModel {
  Id: string = ''
  Level: string = ''
  TimeStamp: string = new Date().toISOString()
  Message: string = ''
}

@Injectable({
  providedIn: 'root'
})
export class LoggerService {

  stackLimit: number = 5
  logStack: LogModel[] = []
  logLevel: LogLevel = LogLevel.None

  constructor() { }

  info(msg: string): void {
    this.logWith(LogLevel.Info, msg)
  }

  warn(msg: string): void {
    this.logWith(LogLevel.Warn, msg)
  }

  error(msg: string): void {
    this.logWith(LogLevel.Error, msg)
  }

  trace(msg: string): void {
    this.logWith(LogLevel.Trace, msg)
  }

  private logWith(level: any, msg: string): void {
    var logLevel: string = 'None'
    var date: string = new Date().toISOString()

    var dateAndMsg = `TimeStamp: ${date} Message: ${msg}`

    switch (level) {
      case LogLevel.None:
        return console.log(dateAndMsg)
      case LogLevel.Info:
        logLevel = 'Info'
        return console.info('%c' + dateAndMsg, 'color: #6495ED')
      case LogLevel.Warn:
        logLevel = 'Warn'
        return console.warn('%c' + dateAndMsg, 'color: #FF8C00')
      case LogLevel.Error:
        logLevel = 'Error'
        return console.error('%c' + dateAndMsg, 'color: #DC143C')
      case LogLevel.Trace:
        logLevel = 'Trace'
        return console.trace('%c' + dateAndMsg, 'color: #DC143C')
      default:
        console.debug(msg)
    }

    this.saveToStack(logLevel, msg, date)
  }

  private saveToStack(logLevel: string, msg: string, date: string, stackLimit?: number): void {
    if (stackLimit === undefined || stackLimit <= 0) {
      stackLimit = this.stackLimit;
    }

    const l = new LogModel()
    l.Id = window.btoa(unescape(encodeURIComponent(logLevel + date + msg)))
    l.Level = logLevel
    l.Message = msg
    l.TimeStamp = date

    this.logStack.push(l)
    
    if (this.logStack.length > stackLimit) {
      this.logStack.splice(0, 1)
    }
  }

  public downloadLogStackCSS(): void {
    PrintAndDownloadService.exportToCsv(`logs-${new Date().toISOString()}.css`, this.logStack)
  }
}