import { inject, Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'safeHtml',
  standalone: true,
})
export class SafeHtmlPipe implements PipeTransform {
  private sanitizer = inject(DomSanitizer);

  transform(value: string): SafeHtml {
    const trimmedValue = SafeHtmlPipe.trimEnd(value);
    return this.sanitizer.bypassSecurityTrustHtml(trimmedValue);
  }

  private static trimEnd(str: string): string {
    const regex = /(\s*<p>&nbsp;<\/p>\s*|\s+)$/;
    while (regex.test(str)) {
      str = str.replace(regex, '');
    }
    return str;
  }
}
