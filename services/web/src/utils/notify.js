import { toast } from 'sonner';

/**
 * Notification shim backed by sonner, with a Mantine-compatible signature so
 * migrated call sites can swap `notifications.show(...)` / `showNotification(...)`
 * for `notify(...)` with minimal churn. `<Notifications/>` (Mantine) stays
 * mounted until every call site is migrated (plan §6.1, teardown in §6).
 *
 *   notify({ title, message, color })   // color: red|green|orange|blue|…
 */
export function notify({ title, message, color } = {}) {
  const heading = title || message;
  const description = title && message ? message : undefined;
  const opts = description ? { description } : undefined;

  switch (color) {
    case 'red':
    case 'error':
      return toast.error(heading, opts);
    case 'green':
    case 'teal':
    case 'success':
      return toast.success(heading, opts);
    case 'yellow':
    case 'orange':
    case 'warning':
      return toast.warning(heading, opts);
    case 'blue':
    case 'info':
      return toast.info(heading, opts);
    default:
      return toast(heading, opts);
  }
}

export const notifySuccess = (params) => notify({ ...params, color: 'green' });
export const notifyError = (params) => notify({ ...params, color: 'red' });
