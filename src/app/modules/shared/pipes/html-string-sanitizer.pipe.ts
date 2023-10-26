import { Pipe, PipeTransform, SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
  name: 'htmlStringSanitizer'
})
export class HtmlStringSanitizerPipe implements PipeTransform {
  constructor(protected sanitizer: DomSanitizer) { }

  /**
   * Sanitize raw HTML, CSS string.
   * @param htmlCode HTML code to sanitize
   * @param inlineCssCode CSS code to inject into 'body'
   * @returns Sanitized HTML string.
   */
  transform(htmlCode: string, inlineCssCode: string = '', delay: number = 0): string {
    return this.sanitizer.sanitize(SecurityContext.HTML, this.injectCss(htmlCode, inlineCssCode)) ?? ''
  }

  private injectCss(htmlCode: string, inlineCssCode: string) {
    const sanitizedCss = this.sanitizer.sanitize(SecurityContext.STYLE, inlineCssCode)
    const styledHtmlCode = htmlCode.replace('body', 'body ' + sanitizedCss)
    return styledHtmlCode
  }
}