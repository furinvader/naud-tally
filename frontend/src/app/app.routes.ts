import { Routes } from '@angular/router';

import { HostAdmin } from './features/host-admin';
import { OrderEntry } from './features/order-entry';

export const routes: Routes = [
  {
    path: '',
    component: OrderEntry,
  },
  {
    path: 'host',
    component: HostAdmin,
  },
  {
    path: '**',
    redirectTo: '',
  },
];
