import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'removeWhitespaces'
})
export class RemoveWhitespacesPipe implements PipeTransform {

  transform(value: any, ...args: unknown[]): any {
    if (Number.isNaN(value)) {
      return 0.0
    }
    if (value === undefined) {
      return 'undefined';
    } else {
      return (value + '').replace(/\s/g, '');
    }
  }

}
