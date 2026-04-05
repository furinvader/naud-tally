import { Routes } from '@angular/router';

import { HostAdmin } from './features/admin/host-admin/host-admin';
import { DrinkTally } from './features/tally/drink-tally/drink-tally';

export const routes: Routes = [
  {
    path: '',
    component: DrinkTally,
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
