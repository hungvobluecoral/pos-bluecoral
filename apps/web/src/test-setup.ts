import '@testing-library/jest-dom';

// React 19 calls new FormData(formElement) internally on form submit events,
// but JSDOM 26's HTMLFormElement conversion fails. Override to handle gracefully.
const NativeFormData = global.FormData;
class PatchedFormData extends NativeFormData {
  constructor(form?: HTMLFormElement, submitter?: HTMLElement | null) {
    try {
      super(form, submitter);
    } catch {
      super();
    }
  }
}
Object.defineProperty(global, 'FormData', { value: PatchedFormData, writable: true, configurable: true });
