import { Routes } from '@angular/router';

import { HostAdmin } from './features/host-admin';
import { HostWorkspace } from './features/host-workspace';

export const routes: Routes = [
  {
    path: '',
    component: HostWorkspace,
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
