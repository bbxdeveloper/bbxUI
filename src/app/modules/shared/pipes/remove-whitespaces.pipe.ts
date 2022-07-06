import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'removeWhitespaces'
})
export class RemoveWhitespacesPipe implements PipeTransform {

  transform(value: any, ...args: unknown[]): any {
    if (value === undefined) {
      return 'undefined';
    } else {
      return (value + '').replace(/\s/g, '');
    }
  }

}
