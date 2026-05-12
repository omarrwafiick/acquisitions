import { jest } from '@jest/globals';

const mockCreate = jest.fn();
const mockFindOne = jest.fn();
const mockFindMany = jest.fn();
const mockFindManyWithJoin = jest.fn();
const mockUpdateOne = jest.fn();
const mockCreateMany = jest.fn();
const mockExecute = jest.fn();
const mockFindOneWithJoin = jest.fn();

jest.unstable_mockModule('#repositories/main.repository.js', () => ({
  create: mockCreate,
  findOne: mockFindOne,
  findMany: mockFindMany,
  findManyWithJoin: mockFindManyWithJoin,
  findOneWithJoin: mockFindOneWithJoin,
  updateOne: mockUpdateOne,
  createMany: mockCreateMany,
}));

jest.unstable_mockModule('#config/database.js', () => ({
  db: {
    execute: mockExecute,
  },
}));

export const mockedCalls = {
  mockCreate,
  mockFindOne,
  mockFindMany,
  mockFindManyWithJoin,
  mockUpdateOne,
  mockCreateMany,
  mockExecute,
  mockFindOneWithJoin,
};
