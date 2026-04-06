import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { routes } from '../../../app.routes';
import { HostWorkspace } from './host-workspace';

describe('HostWorkspace', () => {
  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [HostWorkspace],
      providers: [provideRouter(routes)],
    }).compileComponents();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create the host workspace feature', () => {
    const fixture = TestBed.createComponent(HostWorkspace);
    const component = fixture.componentInstance;

    expect(component).toBeTruthy();
  });

  it('should compose the current drink tally screen while the migration continues', async () => {
    const fixture = TestBed.createComponent(HostWorkspace);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('nt-drink-tally')).not.toBeNull();
  });
});
