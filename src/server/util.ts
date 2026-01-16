
export function whenError(fn: () => void, onError: (err: unknown) => void) {
    try {
        fn();
    } catch (err) {
        onError(err);
    }
}