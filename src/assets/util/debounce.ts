export function debounce(timeout: number) {
    let timeoutRef: any = null;

    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const original = descriptor.value;

        descriptor.value = function debounce(...args: any[]) {
            clearTimeout(timeoutRef);

            timeoutRef = setTimeout(() => {
                original.apply(this, args);
            }, timeout);
        }

        return descriptor;
    }
}
