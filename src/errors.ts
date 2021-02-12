/**
 * {@link NoTypeError} is thrown when {@link parse} encounters an item with no
 * type.
 */
export class NoTypeError extends Error {
    /**
     * Create a new {@link NoTypeError} object.
     *
     * @param message - A human-readable description of the error.
     */
    constructor(message?: string) {
        super(message);

        this.name = "NoTypeError";
    }
}

/**
 * {@link MultiTypeError} is thrown when {@link parse} encounters an item with more
 * than one type.
 */
export class MultiTypeError extends Error {
    /**
     * Create a new {@link MultiTypeError} object.
     *
     * @param message - A human-readable description of the error.
     */
    constructor(message?: string) {
        super(message);

        this.name = "MultiTypeError";
    }
}