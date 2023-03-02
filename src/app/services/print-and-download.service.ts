import { Injectable } from '@angular/core';
import { BehaviorSubject, lastValueFrom, Observable } from 'rxjs';
import { Constants } from 'src/assets/util/Constants';
import { environment } from 'src/environments/environment';
import { StatusService } from './status.service';
import { NbToastrService } from '@nebular/theme';
import { InvoiceService } from '../modules/invoice/services/invoice.service';
import { CommonService } from './common.service';
import { OfferService } from '../modules/offer/services/offer.service';

const REPORT_ENDED =
  { Id: -1, ResultCmdType: Constants.CommandType.PRINT_REPORT } as Constants.CommandDescriptor;

const REPORT_ENDED_WITH_ERROR =
  { Id: -1, ResultCmdType: Constants.CommandType.PRINT_REPORT, State: Constants.CommandType.ERROR } as Constants.CommandDescriptor;

const BLOB_DOWNLOAD_ENDED =
  { Id: -1, ResultCmdType: Constants.CommandType.DOWNLOAD_BLOB } as Constants.CommandDescriptor;

const BLOB_DOWNLOAD_WITH_ERROR =
  { Id: -1, ResultCmdType: Constants.CommandType.DOWNLOAD_BLOB, State: Constants.CommandType.ERROR } as Constants.CommandDescriptor;

@Injectable({
  providedIn: 'root'
})
export class PrintAndDownloadService {
  CommandEnded: BehaviorSubject<Constants.CommandDescriptor | undefined> =
    new BehaviorSubject<Constants.CommandDescriptor | undefined>(undefined);

  constructor(
    private invS: InvoiceService,
    private offerService: OfferService,
    private sts: StatusService,
    private toastrService: NbToastrService,
    private cs: CommonService) { }

  private HandleError(err: any): void {
    this.cs.HandleError(err);
    this.sts.pushProcessStatus(Constants.BlankProcessStatus);
  }

  public async download_csv(params: Constants.Dct = {}, obs: Constants.ServiceFunctionGenericParams): Promise<void> {
    await this.download(obs(params["report_params"]), 'text/csv');
  }

  public async print_pdf(params: Constants.Dct = {}, obs: Constants.ServiceFunctionGenericParams): Promise<void> {
    switch (params['data_operation'] as Constants.DataOperation) {
      case Constants.DataOperation.PRINT_BLOB:
        await this.print(Constants.FileExtensions.PDF, obs(params["report_params"]), params);
        break;
      case Constants.DataOperation.DOWNLOAD_BLOB:
        await this.downloadReportPDF(obs(params["report_params"]));
        break;
    }
  }

  private async print(fileType: Constants.FileExtensions, res: Observable<any>, params: Constants.Dct = {}): Promise<void> {
    this.sts.pushProcessStatus(Constants.PrintReportStatuses[Constants.PrintReportProcessPhases.GENERATING]);
    const checkElectron = params['ignore_electron'] === undefined || (params['ignore_electron'] !== undefined && !params['ignore_electron']);
    console.log(`Print: ${fileType}`);
    switch (fileType) {
      case Constants.FileExtensions.PDF:
        if (checkElectron && environment.electron) {
          await this.sendPdfToElectron(res);
        } else {
          await this.printPdfFromResponse(res);
        }
        break;
    }
  }

  private async sendPdfToElectron(resData: Observable<any>, params: Constants.Dct = {}): Promise<void> {
    console.log(`Preparing electron print. Waiting for print data.`);

    await lastValueFrom(resData)
      .then(res => {
        if (res) {
          console.log(`Print data acquired.`);

          this.sts.pushProcessStatus(Constants.PrintReportStatuses[Constants.PrintReportProcessPhases.PROC_RESP]);
          var blob = new Blob([res], { type: 'application/pdf' });
          var blobURL = URL.createObjectURL(blob);

          console.log(`Processing blob...`);

          // Read blob data as binary string
          const reader = new FileReader();
          const stS = this.sts;
          const handleError = this.HandleError;
          const commandEnded = this.CommandEnded;

          reader.onload = function () {
            console.log(`Sending for printer...`);

            try {
              const event = new CustomEvent('print-pdf', { detail: { bloburl: blobURL, buffer: this.result, copies: params['copies'] } });
              document.dispatchEvent(event);

              console.log(`Printing is in progress...`);

              stS.pushProcessStatus(Constants.BlankProcessStatus);
              commandEnded.next(REPORT_ENDED);
            } catch (error) {
              handleError(error)
              commandEnded.error(REPORT_ENDED_WITH_ERROR);
            }
          };
          reader.readAsBinaryString(blob);
          stS.pushProcessStatus(Constants.PrintReportStatuses[Constants.PrintReportProcessPhases.SEND_TO_PRINTER]);
        } else {
          console.log(`Error while receiving print data.`);
          this.sts.pushProcessStatus(Constants.BlankProcessStatus);
          this.CommandEnded.error(REPORT_ENDED_WITH_ERROR);
        }
      })
      .catch(err => {
        this.cs.HandleError(err);
        this.sts.pushProcessStatus(Constants.BlankProcessStatus);
        this.CommandEnded.error(REPORT_ENDED_WITH_ERROR);
      });
  }

  private async printPdfFromResponse(resData: Observable<any>, params: Constants.Dct = {}): Promise<void> {
    console.log(`Preparing web print. Waiting for print data.`);

    await lastValueFrom(resData)
      .then(res => {
        if (res) {
          console.log(`Print data acquired.`);

          this.sts.pushProcessStatus(Constants.PrintReportStatuses[Constants.PrintReportProcessPhases.PROC_RESP]);
          var blob = new Blob([res], { type: 'application/pdf' });
          var blobURL = URL.createObjectURL(blob);

          console.log(`Processing blob...`);

          // Load content in an iframe to print later
          let iframe = document.createElement('iframe');
          document.body.appendChild(iframe);

          console.log(`Loading data...`);

          iframe.style.display = 'none';
          iframe.src = blobURL;

          const stS = this.sts;
          const commandEnded = this.CommandEnded;

          iframe.onload = () => {
            console.log(`Sending for printer...`);

            this.sts.pushProcessStatus(Constants.PrintReportStatuses[Constants.PrintReportProcessPhases.SEND_TO_PRINTER]);
            // Print
            setTimeout(function () {
              console.log(`Start printing...`);

              iframe.focus();
              iframe.contentWindow!.print();

              console.log(`Printing is in progress...`);
              stS.pushProcessStatus(Constants.BlankProcessStatus);
              commandEnded.next(REPORT_ENDED);
            }, 1);

            // Waiting 10 minute to make sure printing is done, then removing the iframe
            setTimeout(function () {
              document.body.removeChild(iframe);
            }, 600000);
          };
        } else {
          console.log(`Error while receiving print data.`);
          this.CommandEnded.error(REPORT_ENDED_WITH_ERROR);
          this.sts.pushProcessStatus(Constants.BlankProcessStatus);
        }
      })
      .catch(err => {
        this.cs.HandleError(err);
        this.CommandEnded.error(REPORT_ENDED_WITH_ERROR);
        this.sts.pushProcessStatus(Constants.BlankProcessStatus);
      });
  }

  private printPdfFromResponseWithPrintData(printData: any, params: Constants.Dct = {}): void {
    console.log(`Preparing web print. Waiting for print data.`);

    console.log(`Print data acquired.`);

    this.sts.pushProcessStatus(Constants.PrintReportStatuses[Constants.PrintReportProcessPhases.PROC_RESP]);
    var blob = new Blob([printData], { type: 'application/pdf' });
    var blobURL = URL.createObjectURL(blob);

    console.log(`Processing blob...`);

    // Load content in an iframe to print later
    let iframe = document.createElement('iframe');
    document.body.appendChild(iframe);

    console.log(`Loading data...`);

    iframe.style.display = 'none';
    iframe.src = blobURL;

    const stS = this.sts;
    const commandEnded = this.CommandEnded;

    iframe.onload = () => {
      console.log(`Sending for printer...`);

      this.sts.pushProcessStatus(Constants.PrintReportStatuses[Constants.PrintReportProcessPhases.SEND_TO_PRINTER]);
      // Print
      setTimeout(function () {
        console.log(`Start printing...`);

        iframe.focus();
        iframe.contentWindow!.print();

        console.log(`Printing is in progress...`);
        stS.pushProcessStatus(Constants.BlankProcessStatus);
        commandEnded.next(REPORT_ENDED);
      }, 1);

      // Waiting 10 minute to make sure printing is done, then removing the iframe
      setTimeout(function () {
        document.body.removeChild(iframe);
      }, 600000);
    };
  }

  private async downloadReportPDF(resData: Observable<any>): Promise<void> {
    this.sts.pushProcessStatus(Constants.DownloadReportStatuses[Constants.DownloadReportProcessPhases.GENERATING]);
    await this.downloadReportPDFBlobFromResponse(resData);
  }

  private async downloadReportPDFBlobFromResponse(resData: Observable<any>): Promise<void> {
    console.log(`Download blob from response. Waiting for data.`);

    await lastValueFrom(resData)
      .then(res => {
        if (res) {
          console.log(`Data acquired.`);

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
          this.CommandEnded.next(REPORT_ENDED);
        } else {
          console.log(`Error while receiving print data.`);
          this.CommandEnded.error(REPORT_ENDED_WITH_ERROR);
          this.sts.pushProcessStatus(Constants.BlankProcessStatus);
        }
      })
      .catch(err => {
        this.cs.HandleError(err);
        this.CommandEnded.error(REPORT_ENDED_WITH_ERROR);
        this.sts.pushProcessStatus(Constants.BlankProcessStatus);
      });
  }

  private async download(resData: Observable<any>, mimeType: string): Promise<void> {
    this.sts.pushProcessStatus(Constants.DownloadStatuses[Constants.DownloadProcessPhases.GENERATING]);
    await this.downloadBlobFromResponse(resData, mimeType);
  }

  private async downloadBlobFromResponse(resData: Observable<any>, mimeType: string): Promise<void> {
    console.log(`Download blob from response. Waiting for data.`);

    await lastValueFrom(resData)
      .then(res => {
        if (res) {
          console.log(`Data acquired.`);

          this.sts.pushProcessStatus(Constants.DownloadStatuses[Constants.DownloadProcessPhases.PROC_RESP]);
          var blob = new Blob([res.body], { type: mimeType });
          var blobURL = URL.createObjectURL(blob);

          let a = document.createElement('a');

          document.body.appendChild(a);
          a.setAttribute('style', 'display: none');
          a.href = blobURL;

          let fileName = PrintAndDownloadService.GetFileNameFromHeaders(res) ?? res.filename ?? res.fileName ?? '';
          a.download = fileName;

          a.click();

          URL.revokeObjectURL(blobURL);
          a.remove();
          this.sts.pushProcessStatus(Constants.BlankProcessStatus);
          this.CommandEnded.next(BLOB_DOWNLOAD_ENDED);
        } else {
          console.log(`Error while blob data.`);
          this.CommandEnded.error(BLOB_DOWNLOAD_WITH_ERROR);
          this.sts.pushProcessStatus(Constants.BlankProcessStatus);
        }
      })
      .catch(err => {
        this.cs.HandleError(err);
        this.CommandEnded.error(BLOB_DOWNLOAD_WITH_ERROR);
        this.sts.pushProcessStatus(Constants.BlankProcessStatus);
      });
  }

  public static GetFileNameFromHeaders(res: any): string | undefined {
    let headerParts = res.headers.get('content-disposition').split(';');
    if (environment.utilityLogs) {
      console.log(`[GetFileNameFromHeaders] content-disposition header: ${res.headers.get('content-disposition')}`);
    }
    if (headerParts.length > 0) {
      let fileNameSection = headerParts[1].split('filename');
      if (fileNameSection.length > 0) {
        let fileNameSectionParts = fileNameSection[1].split('=');
        if (fileNameSectionParts.length > 0) {
          let fileName = fileNameSectionParts[1].trim();
          if (environment.utilityLogs) {
            console.log(`[GetFileNameFromHeaders] fileName: ${fileName}`);
          }
          return fileName;
        }
      }
    }
    if (environment.utilityLogs) {
      console.log(`[GetFileNameFromHeaders] no filename was found`);
    }
    return undefined;
  }
}
