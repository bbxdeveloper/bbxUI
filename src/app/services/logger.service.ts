import { Injectable } from '@angular/core';
import { HelperFunctions } from 'src/assets/util/HelperFunctions';
import { environment } from 'src/environments/environment';
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

  info(msg: string, environmentFlag: string = ''): void {
    this.logWith(LogLevel.Info, msg, environmentFlag)
  }

  warn(msg: string, environmentFlag: string = ''): void {
    this.logWith(LogLevel.Warn, msg, environmentFlag)
  }

  error(msg: string, environmentFlag: string = ''): void {
    this.logWith(LogLevel.Error, msg, environmentFlag)
  }

  trace(msg: string, environmentFlag: string = ''): void {
    this.logWith(LogLevel.Trace, msg, environmentFlag)
  }

  /**
   * 
   * @param msg 
   * @param environmentFlag 
   */
  console_log(message?: any, ...optionalParams: any[]): void {
    if (environment.production) {
      return
    }

    if (Object.keys(environment).includes('consoleLogsWrapperLogs') && !(environment as any)['consoleLogsWrapperLogs']) {
      return
    }

    console.log(message, optionalParams)
  }

  private logWith(level: any, msg: string, environmentFlag: string = ''): void {
    if (environment.production) {
      return
    }

    if (Object.keys(environment).includes(environmentFlag) && !(environment as any)[environmentFlag]) {
      return
    }

    var logLevel: string = 'None'
    var date: string = new Date().toISOString()

    var dateAndMsg = `TimeStamp: ${date} Message: ${msg}`

    switch (level) {
      case LogLevel.None:
        return console.log(dateAndMsg)
      case LogLevel.Info:
        logLevel = 'Info'
        return console.info('ℹ️ %c' + dateAndMsg, 'color: #6495ED')
      case LogLevel.Warn:
        logLevel = 'Warn'
        return console.warn('⚠️ %c' + dateAndMsg, 'color: #6495ED')
      case LogLevel.Error:
        logLevel = 'Error'
        return console.error('🛑 %c' + dateAndMsg, 'background: #222; color: #bada55')
      case LogLevel.Trace:
        logLevel = 'Trace'
        return console.trace('📄 %c' + dateAndMsg, 'color: #6495ED')
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