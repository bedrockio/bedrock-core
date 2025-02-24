// Needed for insecure contexts as often
// this pages most useful on local dev.
export function copyToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    // Use Clipboard API
    return navigator.clipboard.writeText(text);
  } else {
    // Fallback for non-HTTPS
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed'; // Prevent scrolling
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    try {
      document.execCommand('copy');
    } catch {
      alert('Copy failed');
    }
    document.body.removeChild(textarea);
    return Promise.resolve();
  }
}
