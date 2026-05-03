export class JwtTokenAuthenticationException extends Error {
    constructor(
        message = "Failed to authenticate JWT token",
        cause = 'Unknown' 
    ) {
        super(message, { cause });

        this.name = "JwtTokenAuthenticationException";

        Object.setPrototypeOf(this, new.target.prototype);
    }
}