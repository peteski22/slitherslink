type UpdateCallback = (message: string) => void;

export function listenForUpdates(onUpdate: UpdateCallback): void {
  if (!('serviceWorker' in navigator)) return;

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      navigator.serviceWorker.ready.then((reg) => reg.update()).catch(() => {});
    }
  });

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    onUpdate('New version loaded, restarting...');
  });
}
