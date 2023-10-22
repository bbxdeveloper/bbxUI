import { ChangeDetectorRef, Pipe, PipeTransform, SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
  name: 'htmlStringSanitizer',
  pure: false
})
export class HtmlStringSanitizerPipe implements PipeTransform {
  constructor(protected sanitizer: DomSanitizer, private _ref: ChangeDetectorRef) { }

  result: string = ''

  /**
   * Sanitize raw HTML, CSS string.
   * @param htmlCode HTML code to sanitize
   * @param inlineCssCode CSS code to inject into 'body'
   * @param delay - sanitize delay, only needed for iframe
   * @returns Sanitized HTML string.
   */
  transform(htmlCode: string, inlineCssCode: string = '', delay: number = 0): string {
    setTimeout(() => {
      this.result = this.sanitizer.sanitize(SecurityContext.HTML, this.injectCss(htmlCode, inlineCssCode)) ?? ''
      this._ref.markForCheck()
    }, delay)

    return this.result
  }

  private injectCss(htmlCode: string, inlineCssCode: string) {
    const sanitizedCss = this.sanitizer.sanitize(SecurityContext.STYLE, inlineCssCode)
    const styledHtmlCode = htmlCode.replace('body', 'body ' + sanitizedCss)
    return styledHtmlCode
  }
}