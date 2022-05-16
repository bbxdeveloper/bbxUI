import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'replace'
})
export class ReplacePipe implements PipeTransform {

  transform(value: unknown, replaceThis: string, withThis: string): string {
    let tmp = value + '';
    return tmp.replace(replaceThis, withThis);
  }

}
