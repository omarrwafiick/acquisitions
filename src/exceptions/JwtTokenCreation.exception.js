export class JwtTokenCreationException extends Error {
    constructor(
        message = "Failed to create JWT token",
        cause = 'Unknown' 
    ) {
        super(message, { cause });

        this.name = "JwtTokenCreationException";

        Object.setPrototypeOf(this, new.target.prototype);
    }
}