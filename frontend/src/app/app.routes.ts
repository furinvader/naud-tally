import { Routes } from '@angular/router';

import { HostAdmin } from './features/admin/host-admin/host-admin';
import { HostWorkspace } from './features/host-workspace/host-workspace/host-workspace';

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
