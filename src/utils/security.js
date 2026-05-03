import jwt from 'jsonwebtoken';
import logger from '#config/logger.js';
import JwtTokenCreationException from '#exceptions/JwtTokenCreation.exception.js';
import JwtTokenAuthenticationException from '#exceptions/JwtTokenAuthentication.exception.js';

export const jwtToken = {
    sign: (payload) => {
        const secret = process.env.JWT_SECRET || 'none';
        const expiresIn = process.env.JWT_EXPIRES_IN || '1d';
        try {
            return jwt.sign(payload, secret, { expiresIn: expiresIn });
        } catch (error) {
            logger.error(error);
            throw new JwtTokenCreationException();
        }
    },
    verify: (token) => {
        const secret = process.env.JWT_SECRET || 'none';
        try {
            return jwt.verify(token, secret);
        } catch (error) {
            logger.error(error);
            throw new JwtTokenAuthenticationException();
        }
    },
}