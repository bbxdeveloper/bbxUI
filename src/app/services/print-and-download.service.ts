import { Injectable, Optional } from '@angular/core';
import { BehaviorSubject, lastValueFrom, Observable, of } from 'rxjs';
import { Constants } from 'src/assets/util/Constants';
import { environment } from 'src/environments/environment';
import { StatusService } from './status.service';
import { NbDialogService, NbToastrService } from '@nebular/theme';
import { InvoiceService } from '../modules/invoice/services/invoice.service';
import { CommonService } from './common.service';
import { OfferService } from '../modules/offer/services/offer.service';
import { BbxToastrService } from './bbx-toastr-service.service';
import { HelperFunctions } from 'src/assets/util/HelperFunctions';
import { OneTextInputDialogComponent } from '../modules/shared/one-text-input-dialog/one-text-input-dialog.component';

const REPORT_ENDED =
  { Id: -1, ResultCmdType: Constants.CommandType.PRINT_REPORT } as Constants.CommandDescriptor;

const REPORT_ENDED_WITH_ERROR =
  { Id: -1, ResultCmdType: Constants.CommandType.PRINT_REPORT, State: Constants.CommandType.ERROR } as Constants.CommandDescriptor;

const BLOB_DOWNLOAD_ENDED =
  { Id: -1, ResultCmdType: Constants.CommandType.DOWNLOAD_BLOB } as Constants.CommandDescriptor;

const BLOB_DOWNLOAD_WITH_ERROR =
  { Id: -1, ResultCmdType: Constants.CommandType.DOWNLOAD_BLOB, State: Constants.CommandType.ERROR } as Constants.CommandDescriptor;

export const KEY_REPORT_PARAMS: string = "report_params"
export const KEY_COPIES: string = 'copies'
export const KEY_DATA_OPERATION: string = 'data_operation';
export const KEY_IGNORE_ELECTRON: string = 'ignore_electron';

export class PrintDialogRequest {
  Reset: (() => void) | (() => Promise<void>) = () => { }

  ReportParams: Constants.Dct = {}

  Obs: Constants.ServiceFunctionGenericParams = (p: Constants.Dct) => { return of(p) }

  DialogTitle: string = ''
  DialogInputLabel: string = 'Példányszám'
  DefaultCopies: number = 1

  MsgError: string = ''
  MsgCancel: string = ''
  MsgFinish: string = ''
}

@Injectable({
  providedIn: 'root'
})
export class PrintAndDownloadService {
  CommandEnded: BehaviorSubject<Constants.CommandDescriptor | undefined> =
    new BehaviorSubject<Constants.CommandDescriptor | undefined>(undefined);

  constructor(
    @Optional() private dialogService: NbDialogService,
    private invS: InvoiceService,
    private offerService: OfferService,
    private sts: StatusService,
    private simpleToastrService: NbToastrService,
    private bbxToastrService: BbxToastrService,
    private toastrService: NbToastrService,
    private cs: CommonService) { }
  
  public async printPreview(request: PrintDialogRequest): Promise<void> {
    let commandEndedSubscription = this.CommandEnded.subscribe({
      next: cmdEnded => {
        console.log(`CommandEnded received: ${cmdEnded?.ResultCmdType}`);

        if (cmdEnded?.ResultCmdType === Constants.CommandType.PRINT_REPORT) {
          this.simpleToastrService.show(
            `Az árajánlat riport elkészítve.`,
            Constants.TITLE_INFO,
            Constants.TOASTR_SUCCESS_5_SEC
          );
          commandEndedSubscription.unsubscribe();
        }
      },
      error: cmdEnded => {
        console.log(`CommandEnded error received: ${cmdEnded?.CmdType}`);

        commandEndedSubscription.unsubscribe();
        this.bbxToastrService.show(
          `Az árajánlat riport készítése közben hiba történt.`,
          Constants.TITLE_ERROR,
          Constants.TOASTR_ERROR
        );
      }
    });
    
    if (request.ReportParams[KEY_COPIES] !== undefined) {
      request.ReportParams[KEY_COPIES] = HelperFunctions.ToInt(request.ReportParams[KEY_COPIES]);
    }
    await this.printReport(request.ReportParams, request.Obs);
  }

  public async printAfterConfirm(request: PrintDialogRequest): Promise<void> {
    HelperFunctions.confirmAsync(this.dialogService, Constants.MSG_CONFIRMATION_PRINT, async () => {
      
      let commandEndedSubscription = this.CommandEnded.subscribe({
        next: cmdEnded => {
          console.log(`CommandEnded received: ${cmdEnded?.ResultCmdType}`);

          if (cmdEnded?.ResultCmdType === Constants.CommandType.PRINT_REPORT) {
            this.simpleToastrService.show(
              request.MsgFinish,
              Constants.TITLE_INFO,
              Constants.TOASTR_SUCCESS_5_SEC
            );
            commandEndedSubscription.unsubscribe();
          }
          this.sts.pushProcessStatus(Constants.BlankProcessStatus);
        },
        error: cmdEnded => {
          console.log(`CommandEnded error received: ${cmdEnded?.CmdType}`);

          commandEndedSubscription.unsubscribe();
          this.bbxToastrService.show(
            request.MsgError,
            Constants.TITLE_ERROR,
            Constants.TOASTR_ERROR
          );
          this.sts.pushProcessStatus(Constants.BlankProcessStatus);
        }
      });
      if (request.ReportParams[KEY_COPIES] !== undefined) {
        request.ReportParams[KEY_COPIES] = HelperFunctions.ToInt(request.ReportParams[KEY_COPIES]);
      }
      await this.printReport(request.ReportParams, request.Obs, true);
    }, async () => {
      this.simpleToastrService.show(
        request.MsgCancel,
        Constants.TITLE_INFO,
        Constants.TOASTR_SUCCESS_5_SEC
      );
    });
  }
  
  public async openPrintDialog(request: PrintDialogRequest): Promise<void> {
    this.sts.pushProcessStatus(Constants.BlankProcessStatus);

    const dialogRef = this.dialogService.open(OneTextInputDialogComponent, {
      context: {
        title: request.DialogTitle,
        inputLabel: request.DialogInputLabel,
        defaultValue: request.DefaultCopies
      }
    });
    dialogRef.onClose.subscribe({
      next: async res => {
        console.log("OneTextInputDialogComponent: ", res);
        if (res && res.answer && HelperFunctions.ToInt(res.value) > 0) {
          let commandEndedSubscription = this.CommandEnded.subscribe({
            next: cmdEnded => {
              console.log(`CommandEnded received: ${cmdEnded?.ResultCmdType}`);

              if (cmdEnded?.ResultCmdType === Constants.CommandType.PRINT_REPORT) {
                request.Reset();

                this.simpleToastrService.show(
                  request.MsgFinish,
                  Constants.TITLE_INFO,
                  Constants.TOASTR_SUCCESS_5_SEC
                );
                commandEndedSubscription.unsubscribe();
              }
            },
            error: cmdEnded => {
              console.log(`CommandEnded error received: ${cmdEnded?.CmdType}`);

              this.bbxToastrService.show(
                request.MsgError,
                Constants.TITLE_ERROR,
                Constants.TOASTR_ERROR
              );

              commandEndedSubscription.unsubscribe();

              this.sts.pushProcessStatus(Constants.BlankProcessStatus);
              request.Reset();
            }
          });

          request.ReportParams[KEY_COPIES] = HelperFunctions.ToInt(res.value);
          await this.printReport(request.ReportParams, request.Obs);
        } else {
          this.simpleToastrService.show(
            request.MsgCancel,
            Constants.TITLE_INFO,
            Constants.TOASTR_SUCCESS_5_SEC
          );
          this.sts.pushProcessStatus(Constants.BlankProcessStatus);
          request.Reset();
        }
      },
      error: err => {
        this.cs.HandleError(err);
        this.sts.pushProcessStatus(Constants.BlankProcessStatus);
        request.Reset();
      }
    });
  }

  private async printReport(reportParams: any, obs: Constants.ServiceFunctionGenericParams, ignoreElectron: boolean = false): Promise<void> {
    this.sts.pushProcessStatus(Constants.PrintReportStatuses[Constants.PrintReportProcessPhases.PROC_CMD]);
    await this.print_pdf(
      {
        "report_params": reportParams,
        "data_operation": Constants.DataOperation.PRINT_BLOB,
        "ignore_electron": ignoreElectron
      } as Constants.Dct,
      obs
    );
  }

  private HandleError(err: any): void {
    this.cs.HandleError(err);
    this.sts.pushProcessStatus(Constants.BlankProcessStatus);
  }

  public async download_csv(params: Constants.Dct = {}, obs: Constants.ServiceFunctionGenericParams): Promise<void> {
    await this.download(obs, params, 'text/csv');
  }

  public async print_pdf(params: Constants.Dct = {}, obs: Constants.ServiceFunctionGenericParams): Promise<void> {
    switch (params[KEY_DATA_OPERATION] as Constants.DataOperation) {
      case Constants.DataOperation.PRINT_BLOB:
        await this.print(Constants.FileExtensions.PDF, obs, params);
        break;
      case Constants.DataOperation.DOWNLOAD_BLOB:
        await this.downloadReportPDF(obs, params);
        break;
    }
  }

  private async print(fileType: Constants.FileExtensions, res: Constants.ServiceFunctionGenericParams, params: Constants.Dct = {}): Promise<void> {
    this.sts.pushProcessStatus(Constants.PrintReportStatuses[Constants.PrintReportProcessPhases.GENERATING]);
    const checkElectron = params[KEY_IGNORE_ELECTRON] === undefined || (params[KEY_IGNORE_ELECTRON] !== undefined && !params[KEY_IGNORE_ELECTRON]);
    console.log(`Print: ${fileType}`);
    switch (fileType) {
      case Constants.FileExtensions.PDF:
        if (checkElectron && environment.electron) {
          await this.sendPdfToElectron(res, params);
        } else {
          await this.printPdfFromResponse(res, params);
        }
        break;
    }
  }

  private async sendPdfToElectron(resData: Constants.ServiceFunctionGenericParams, params: Constants.Dct = {}): Promise<void> {
    console.log(`Preparing electron print. Waiting for print data.`);

    await lastValueFrom(resData(params[KEY_REPORT_PARAMS]))
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

  private async printPdfFromResponse(resData: Constants.ServiceFunctionGenericParams, params: Constants.Dct = {}): Promise<void> {
    console.log(`Preparing web print. Waiting for print data.`);

    await lastValueFrom(resData(params[KEY_REPORT_PARAMS]))
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

  private async downloadReportPDF(resData: Constants.ServiceFunctionGenericParams, params: Constants.Dct): Promise<void> {
    this.sts.pushProcessStatus(Constants.DownloadReportStatuses[Constants.DownloadReportProcessPhases.GENERATING]);
    await this.downloadReportPDFBlobFromResponse(resData, params);
  }

  private async downloadReportPDFBlobFromResponse(resData: Constants.ServiceFunctionGenericParams, params: Constants.Dct): Promise<void> {
    console.log(`Download blob from response. Waiting for data.`);

    await lastValueFrom(resData(params[KEY_REPORT_PARAMS]))
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

  private async download(resData: Constants.ServiceFunctionGenericParams, params: Constants.Dct, mimeType: string): Promise<void> {
    this.sts.pushProcessStatus(Constants.DownloadStatuses[Constants.DownloadProcessPhases.GENERATING]);
    await this.downloadBlobFromResponse(resData, params, mimeType);
  }

  private async downloadBlobFromResponse(resData: Constants.ServiceFunctionGenericParams, params: Constants.Dct, mimeType: string): Promise<void> {
    console.log(`Download blob from response. Waiting for data.`);

    await lastValueFrom(resData(params[KEY_REPORT_PARAMS]))
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
