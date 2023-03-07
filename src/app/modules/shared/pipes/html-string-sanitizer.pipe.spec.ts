import { DomSanitizer } from '@angular/platform-browser';
import { HtmlStringSanitizerPipe } from './html-string-sanitizer.pipe';

describe('HtmlStringSanitizerPipe', () => {
  it('create an instance', () => {
    const pipe = new HtmlStringSanitizerPipe({} as DomSanitizer);
    expect(pipe).toBeTruthy();
  });
});
