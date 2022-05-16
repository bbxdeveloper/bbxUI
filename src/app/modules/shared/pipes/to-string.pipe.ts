import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'toString'
})
export class ToStringPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): string {
    let tmp = value ?? '';
    return tmp + '';
  }

}
