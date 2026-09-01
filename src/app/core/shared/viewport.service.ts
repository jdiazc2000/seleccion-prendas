import { Injectable, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { BreakpointObserver } from '@angular/cdk/layout';
import { map } from 'rxjs';

const GRID_BREAKPOINT = '(min-width: 900px)';

@Injectable({ providedIn: 'root' })
export class ViewportService {
  private readonly breakpointObserver = inject(BreakpointObserver);

  readonly isGridMode = toSignal(
    this.breakpointObserver.observe(GRID_BREAKPOINT).pipe(map((state) => state.matches)),
    { initialValue: true },
  );
}
