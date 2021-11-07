export default function sendEvent(
  eventCategory: string,
  eventAction: string,
  eventLabel: string,
  eventValue?: number
) {
  if ('ga' in window) {
    try {
      // @ts-ignore
      const tracker = globalThis.ga.getAll()[0];
      if (tracker) {
        tracker.send('event', {
          eventCategory,
          eventAction,
          eventLabel,
          ...(eventValue != null && { eventValue }),
        });
      }
    } catch (err) {
      console.error('Failed sending ga event', err);
    }
  }
}
