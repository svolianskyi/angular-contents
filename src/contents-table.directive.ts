import {
  Directive,
  ElementRef,
  HostListener,
  HostBinding,
  Input,
  OnInit,
  OnChanges,
  OnDestroy,
} from '@angular/core';

import { getAbsoluteHeight } from './html-utils';

@Directive({
  selector: '[contentsTable]',
  exportAs: 'contentsTable',
})
export class ContentsTableDirective implements OnInit, OnChanges, OnDestroy {
  @Input() scrollingView: HTMLElement;
  @HostBinding('class.sticky') sticky = false;
  @HostBinding('style.margin-top') marginTop = '0px';

  private scrollFun: EventListenerOrEventListenerObject = (event: Event) => this.updateStickiness();

  constructor(
    private elementRef: ElementRef,
  ) { }

  ngOnInit() {
    this.updateStickiness();
    this.unsubscribeScrollEventListener();
    this.subscribeScrollEventListener();
  }

  ngOnChanges() {
    this.unsubscribeScrollEventListener();
    this.subscribeScrollEventListener();
  }

  ngOnDestroy() {
    this.unsubscribeScrollEventListener();
  }

  // Subscribe to scrollingView scroll events. Sections will detectChanges() on scroll changes.
  subscribeScrollEventListener() {
    (this.scrollingView || document).addEventListener('scroll', this.scrollFun, false);
  }

  unsubscribeScrollEventListener() {
    (this.scrollingView || document).removeEventListener('scroll', this.scrollFun, false);
  }

  /**
   * Check whether the Table of Contents should be a sticky, to keep itself visible while the user
   * scrolls.
   */
  updateStickiness() {
    const pageOffset: number = window.pageYOffset;
    const parentElement: HTMLElement = this.elementRef.nativeElement.parentNode;
    const parentOffset: number = parentElement.offsetTop;
    const parentHeight: number = getAbsoluteHeight(parentElement);
    const element = this.elementRef.nativeElement;
    const elementInnerHeight: number = element.offsetHeight;

    if (pageOffset + elementInnerHeight > parentOffset + parentHeight) {
      // Use a fixed margin-top instead when scrolling past the parent container.
      this.sticky = false;
      this.marginTop = `${parentHeight - elementInnerHeight}px`;
    } else {
      // Use CSS sticky when scrolling into the parent container.
      this.marginTop = '0px';
      this.sticky = pageOffset > parentOffset;
    }
  }

  getHeight(target: HTMLElement): number {
    const element: HTMLElement = this.elementRef.nativeElement;
    const styles = window.getComputedStyle(element);
    const margin = parseFloat(styles.marginTop || '0') +
                   parseFloat(styles.marginBottom || '0');

    return Math.ceil(element.offsetHeight + margin);
  }
}
