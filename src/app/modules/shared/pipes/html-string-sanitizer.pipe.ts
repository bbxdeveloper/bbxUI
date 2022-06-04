import { Pipe, PipeTransform, SecurityContext } from '@angular/core';
import { DomSanitizer, SafeHtml, SafeResourceUrl, SafeScript, SafeStyle, SafeUrl } from '@angular/platform-browser';

@Pipe({
  name: 'htmlStringSanitizer'
})
export class HtmlStringSanitizerPipe implements PipeTransform {
  constructor(protected sanitizer: DomSanitizer) { }

  transform(htmlCode: string): string {
    return this.sanitizer.sanitize(SecurityContext.HTML, htmlCode) ?? '';
  }

}