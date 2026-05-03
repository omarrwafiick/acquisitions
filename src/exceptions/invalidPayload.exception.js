export class InvalidPayloadException extends Error {
    constructor(
        message = "Payload is invalid to pass.",
        cause = 'Unknown' 
    ) {
        super(message, { cause });

        this.name = "InvalidPayloadException";
        this.status = 400;

        Object.setPrototypeOf(this, new.target.prototype);
    }
}