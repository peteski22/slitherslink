import { describe, it, expect, vi, beforeEach } from 'vitest';
import { listenForUpdates } from './updater';

describe('listenForUpdates', () => {
  const listeners: Record<string, Function[]> = {};
  const swListeners: Record<string, Function[]> = {};
  const mockUpdate = vi.fn(() => Promise.resolve());

  beforeEach(() => {
    vi.restoreAllMocks();
    for (const k of Object.keys(listeners)) delete listeners[k];
    for (const k of Object.keys(swListeners)) delete swListeners[k];

    vi.stubGlobal('document', {
      visibilityState: 'visible',
      addEventListener: (evt: string, fn: Function) => {
        (listeners[evt] ??= []).push(fn);
      },
    });

    vi.stubGlobal('navigator', {
      serviceWorker: {
        ready: Promise.resolve({ update: mockUpdate }),
        addEventListener: (evt: string, fn: Function) => {
          (swListeners[evt] ??= []).push(fn);
        },
      },
    });
  });

  it('triggers SW update check when document becomes visible', async () => {
    listenForUpdates(vi.fn());
    listeners['visibilitychange']?.[0]?.();
    await new Promise((r) => setTimeout(r, 0));
    expect(mockUpdate).toHaveBeenCalled();
  });

  it('calls the callback on controllerchange', () => {
    const cb = vi.fn();
    listenForUpdates(cb);
    swListeners['controllerchange']?.[0]?.();
    expect(cb).toHaveBeenCalledWith('New version loaded, restarting...');
  });

  it('does nothing when serviceWorker is unavailable', () => {
    vi.stubGlobal('navigator', {});
    const cb = vi.fn();
    listenForUpdates(cb);
    expect(Object.keys(listeners)).toHaveLength(0);
  });
});
