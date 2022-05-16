import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Constants } from 'src/assets/util/Constants';
import { environment } from 'src/environments/environment';
import { StatusService } from './status.service';
import { NbToastrService } from '@nebular/theme';
import { InvoiceService } from '../modules/invoice/services/invoice.service';
import { CommonService } from './common.service';

const POC_REPORT_ENDED =
  { Id: -1, CmdType: Constants.CommandType.POC_REPORT } as Constants.CommandDescriptor;

@Injectable({
  providedIn: 'root'
})
export class UtilityService {
  CommandEnded: BehaviorSubject<Constants.CommandDescriptor | undefined> =
    new BehaviorSubject<Constants.CommandDescriptor | undefined>(undefined);

  constructor(
    private invS: InvoiceService,
    private sts: StatusService,
    private toastrService: NbToastrService,
    private cs: CommonService) { }

  private HandleError(err: any): void {
    this.cs.HandleError(err);
    this.sts.pushProcessStatus(Constants.BlankProcessStatus);
  }

  public execute(
    commandType: Constants.CommandType,
    fileType: Constants.FileExtensions = Constants.FileExtensions.UNKNOWN,
    params: Constants.Dct = {}, obs?: Observable<any>): void {
    switch (commandType) {
      case Constants.CommandType.PRINT_INVOICE:
        switch (params['data_operation'] as Constants.DataOperation) {
          case Constants.DataOperation.PRINT_BLOB:
            this.print(fileType, this.invS.GetReport(params), params);
            break;
          case Constants.DataOperation.DOWNLOAD_BLOB:
            this.download(this.invS.GetReport(params));
            break;
        }
        break;
      case Constants.CommandType.POC_REPORT:
        switch (params['data_operation'] as Constants.DataOperation) {
          case Constants.DataOperation.PRINT_BLOB:
            this.print(fileType, this.invS.GetReport(params), params);
            break;
          case Constants.DataOperation.DOWNLOAD_BLOB:
            this.download(this.invS.GetReport(params));
            break;
        }
        break;
      case Constants.CommandType.PRINT_POC_GRADES:
        switch (params['data_operation'] as Constants.DataOperation) {
          case Constants.DataOperation.PRINT_BLOB:
            this.print(fileType, this.invS.GetGradesReport(params), params);
            break;
          case Constants.DataOperation.DOWNLOAD_BLOB:
            this.download(this.invS.GetGradesReport(params));
            break;
        }
        break;
    }
  }

  private print(fileType: Constants.FileExtensions, res: Observable<any>, params: Constants.Dct = {}): void {
    this.sts.pushProcessStatus(Constants.PrintReportStatuses[Constants.PrintReportProcessPhases.GENERATING]);
    switch (fileType) {
      case Constants.FileExtensions.PDF:
        if (environment.electron) {
          this.sendPdfToElectron(res);
        } else {
          this.printPdfFromResponse(res);
        }
        break;
    }
  }

  private sendPdfToElectron(resData: Observable<any>, params: Constants.Dct = {}): void {
    resData.subscribe({
      next: res => {
        this.sts.pushProcessStatus(Constants.PrintReportStatuses[Constants.PrintReportProcessPhases.PROC_RESP]);
        var blob = new Blob([res], { type: 'application/pdf' });
        var blobURL = URL.createObjectURL(blob);

        // Read blob data as binary string
        const reader = new FileReader();
        const stS = this.sts;
        const handleError = this.HandleError;
        const commandEnded = this.CommandEnded;
        reader.onload = function () {
          try {
            const event = new CustomEvent('print-pdf', { detail: { bloburl: blobURL, buffer: this.result, copies: params['copies'] } });
            document.dispatchEvent(event);
            stS.pushProcessStatus(Constants.BlankProcessStatus);
            commandEnded.next(POC_REPORT_ENDED);
          } catch (error) {
            handleError(error)
            commandEnded.next(POC_REPORT_ENDED);
          }
        };
        reader.readAsBinaryString(blob);
        stS.pushProcessStatus(Constants.PrintReportStatuses[Constants.PrintReportProcessPhases.SEND_TO_PRINTER]);
      },
      error: err => {
        this.HandleError(err);
        this.CommandEnded.next(POC_REPORT_ENDED);
      }
    });
  }

  private printPdfFromResponse(resData: Observable<any>, params: Constants.Dct = {}): void {
    resData.subscribe({
      next: res => {
        this.sts.pushProcessStatus(Constants.PrintReportStatuses[Constants.PrintReportProcessPhases.PROC_RESP]);
        var blob = new Blob([res], { type: 'application/pdf' });
        var blobURL = URL.createObjectURL(blob);

        // Load content in an iframe to print later
        let iframe = document.createElement('iframe');
        document.body.appendChild(iframe);

        iframe.style.display = 'none';
        iframe.src = blobURL;

        const stS = this.sts;
        const commandEnded = this.CommandEnded;
        iframe.onload = () => {
          this.sts.pushProcessStatus(Constants.PrintReportStatuses[Constants.PrintReportProcessPhases.SEND_TO_PRINTER]);
          // Print
          setTimeout(function () {
            iframe.focus();
            iframe.contentWindow!.print();
            stS.pushProcessStatus(Constants.BlankProcessStatus);
            commandEnded.next(POC_REPORT_ENDED);
          }, 1);
          // Waiting 10 minute to make sure printing is done, then removing the iframe
          setTimeout(function () {
            document.body.removeChild(iframe);
          }, 600000);
        };
      },
      error: err => {
        this.HandleError(err);
        this.CommandEnded.next(POC_REPORT_ENDED);
      }
    });
  }

  private download(resData: Observable<any>): void {
    this.sts.pushProcessStatus(Constants.DownloadReportStatuses[Constants.DownloadReportProcessPhases.GENERATING]);
    this.downloadBlobFromResponse(resData);
  }

  private downloadBlobFromResponse(resData: Observable<any>): void {
    resData.subscribe({
      next: res => {
        this.sts.pushProcessStatus(Constants.DownloadReportStatuses[Constants.DownloadReportProcessPhases.PROC_RESP]);
        var blob = new Blob([res], { type: 'application/pdf' });
        var blobURL = URL.createObjectURL(blob);

        let a = document.createElement('a');

        document.body.appendChild(a);
        a.setAttribute('style', 'display: none');
        a.href = blobURL;
        a.download = res.filename;

        a.click();

        URL.revokeObjectURL(blobURL);
        a.remove();
        this.sts.pushProcessStatus(Constants.BlankProcessStatus);
        this.CommandEnded.next(POC_REPORT_ENDED);
      },
      error: err => {
        this.HandleError(err);
        this.CommandEnded.next(POC_REPORT_ENDED);
      }
    });
  }
}
