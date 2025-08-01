// blur-text.directive.ts
import { Directive, HostBinding, HostListener } from '@angular/core';

@Directive({
  selector: '[appBlurText]',
  standalone: true,
})
export class BlurTextDirective {
  @HostBinding('style.filter') filter = 'blur(5px)';
  @HostBinding('style.cursor') cursor = 'pointer';

  private isBlurred = true;

  @HostListener('click')
  toggleBlur() {
    this.isBlurred = !this.isBlurred;
    this.filter = this.isBlurred ? 'blur(2px)' : 'none';
  }
}
