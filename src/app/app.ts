import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { ToastNotification } from './shared/components/toast-notification/toast-notification';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastNotification],
  template: `
    <router-outlet></router-outlet>
    <app-toast-notification />
  `,
})
export class App {}
