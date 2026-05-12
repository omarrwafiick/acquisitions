import { CONSTANTS } from '#src/services/constants.service.js';
import { mockedCalls } from '../helpers/mocked.calls.js';
import { jest } from '@jest/globals';

const { mockFindOne } = mockedCalls;

const { isUserLinkedToOrganizationService } =
  await import('#src/services/user.service.js');

describe('User Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should check if user is linked to organization', async () => {
    mockFindOne.mockResolvedValue({
      id: 5,
      role: CONSTANTS.ROLES.REQUESTER,
    });

    const result = await isUserLinkedToOrganizationService(6, 1);

    expect(result).toEqual({
      id: 5,
      role: CONSTANTS.ROLES.REQUESTER,
    });
  });

  it('should throw not found exception if user is not linked to organization', async () => {
    mockFindOne.mockResolvedValue(null);

    await expect(isUserLinkedToOrganizationService(6, 1)).rejects.toThrow(
      'user was not found with organization passed.'
    );
  });
});
