import { HtmlStringSanitizerPipe } from './html-string-sanitizer.pipe';

describe('HtmlStringSanitizerPipe', () => {
  it('create an instance', () => {
    const pipe = new HtmlStringSanitizerPipe();
    expect(pipe).toBeTruthy();
  });
});
