import { jest } from '@jest/globals';

const mockCreate = jest.fn();
const mockFindOne = jest.fn();
const mockFindMany = jest.fn();
const mockUpdateOne = jest.fn();

const mockExecute = jest.fn();

jest.unstable_mockModule(
  '#repositories/main.repository.js',
  () => ({
    create: mockCreate,
    findOne: mockFindOne,
    findMany: mockFindMany,
    updateOne: mockUpdateOne,
  })
);

jest.unstable_mockModule(
  '#config/database.js',
  () => ({
    db: {
      execute: mockExecute,
    }
  })
);

export const mockedCalls = {
    mockCreate,
    mockFindOne,
    mockFindMany,
    mockUpdateOne,
    mockExecute
};