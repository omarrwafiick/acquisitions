export class DuplicateException extends Error {
    constructor(
        message = "Duplicates are not allowed.",
        cause = 'Unknown' 
    ) {
        super(message, { cause });

        this.name = "DuplicateException";
        this.status = 400;

        Object.setPrototypeOf(this, new.target.prototype);
    }
}