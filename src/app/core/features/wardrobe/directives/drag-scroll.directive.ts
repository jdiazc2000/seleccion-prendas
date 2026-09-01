import { Directive, ElementRef, HostListener, inject } from '@angular/core';

@Directive({
  selector: '[appDragScroll]',
  standalone: true,
})
export class DragScrollDirective {
  private readonly el = inject(ElementRef<HTMLElement>).nativeElement;

  private isDragging = false;
  private dragged = false;
  private startX = 0;
  private startScrollLeft = 0;
  private wheelSnapTimeout?: ReturnType<typeof setTimeout>;

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent): void {
    this.isDragging = true;
    this.dragged = false;
    this.startX = event.pageX;
    this.startScrollLeft = this.el.scrollLeft;
    this.el.classList.add('dragging');
  }

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (!this.isDragging) return;

    const delta = event.pageX - this.startX;
    if (Math.abs(delta) > 4) this.dragged = true;

    this.el.scrollLeft = this.startScrollLeft - delta;
  }

  @HostListener('window:mouseup')
  onMouseUp(): void {
    if (!this.isDragging) return;
    this.isDragging = false;
    this.el.classList.remove('dragging');

    if (this.dragged) this.snapToNearest();
  }

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent): void {
    if (!this.dragged) return;
    event.preventDefault();
    event.stopPropagation();
    this.dragged = false;
  }

  @HostListener('wheel', ['$event'])
  onWheel(event: WheelEvent): void {
    if (this.el.scrollWidth <= this.el.clientWidth) return;

    event.preventDefault();
    this.el.scrollLeft += event.deltaY;

    clearTimeout(this.wheelSnapTimeout);
    this.wheelSnapTimeout = setTimeout(() => this.snapToNearest(), 120);
  }

  private snapToNearest(): void {
    const children = Array.from(this.el.children) as HTMLElement[];
    if (!children.length) return;

    const containerRect = this.el.getBoundingClientRect();
    const containerCenter = containerRect.left + containerRect.width / 2;

    let closest = children[0];
    let minDistance = Infinity;

    for (const child of children) {
      const rect = child.getBoundingClientRect();
      const childCenter = rect.left + rect.width / 2;
      const distance = Math.abs(childCenter - containerCenter);

      if (distance < minDistance) {
        minDistance = distance;
        closest = child;
      }
    }

    closest.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }
}
