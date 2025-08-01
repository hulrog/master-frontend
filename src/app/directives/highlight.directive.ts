import { Directive, ElementRef, HostListener, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appHighlight]',
  standalone: true,
})
export class HighlightDirective {
  constructor(private el: ElementRef, private renderer: Renderer2) {
    this.renderer.setStyle(
      this.el.nativeElement,
      'transition',
      'all 0.2s ease'
    );
  }

  @HostListener('mouseenter') onMouseEnter() {
    this.renderer.setStyle(
      this.el.nativeElement,
      'background-color',
      'rgba(var(--ion-color-primary-rgb), 0.2)'
    );
    this.renderer.setStyle(this.el.nativeElement, 'padding-top', '2%');
    this.renderer.setStyle(this.el.nativeElement, 'padding-bottom', '2%');
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.renderer.removeStyle(this.el.nativeElement, 'background-color');
    this.renderer.removeStyle(this.el.nativeElement, 'padding-top');
    this.renderer.removeStyle(this.el.nativeElement, 'padding-bottom');
  }
}
