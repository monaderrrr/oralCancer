type Listener = () => void;

let loadingCount = 0;
const listeners = new Set<Listener>();

const emit = () => {
  listeners.forEach((listener) => listener());
};

export const loadingController = {
  start() {
    loadingCount += 1;
    emit();
  },
  stop() {
    loadingCount = Math.max(0, loadingCount - 1);
    emit();
  },
  getSnapshot() {
    return loadingCount > 0;
  },
  subscribe(listener: Listener) {
    listeners.add(listener);

    return () => {
      listeners.delete(listener);
    };
  },
};
