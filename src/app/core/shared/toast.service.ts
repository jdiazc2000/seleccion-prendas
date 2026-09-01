import { Injectable, inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private readonly toastr = inject(ToastrService);

  success(message: string): void {
    this.toastr.success(message, '¡Listo!');
  }

  error(message: string): void {
    this.toastr.error(message, 'Ups...');
  }

  info(message: string): void {
    this.toastr.info(message, 'Aviso');
  }
}
