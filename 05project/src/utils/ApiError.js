class ApiError extends Error {
    constructor(
        statusCode,
        messages = "Something went wrong",
        errors = [],
        stack = ""
    ) {
        super(messages)
        this.statusCode = statusCode,
        this.data = null,
        this.messages = messages,
        this.success = false;
        this.errors = errors

        if (stack) {
            this.stack = stack
        } else {
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

export { ApiError }