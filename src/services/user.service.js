import { findMany } from '#repositories/main.repository.js';
import { users } from '#models/user.model.js';

export const listUsersService = async (query) => {
    //TODOS:
    //query can be extended for search as controller pass req.options sent from clients
    return await findMany(users);
};