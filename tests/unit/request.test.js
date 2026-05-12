import { CONSTANTS } from '#src/services/constants.service.js';
import { mockedCalls } from '../helpers/mocked.calls.js';
import { jest } from '@jest/globals';

const {
  mockCreate,
  mockFindOne,
  mockCreateMany
} = mockedCalls;

jest.unstable_mockModule('#src/services/user.service.js', () => ({
  isUserLinkedToOrganizationService: jest.fn()
}));

const { isUserLinkedToOrganizationService } =
  await import('#src/services/user.service.js');

const { submitRequestService } =
  await import('#src/services/request.service.js');

const CREATE_REQUEST_PAYLOAD = {
  title: 'New Laptop',
  reason: 'Need a new laptop for work',
  items: [
    {
      name: 'MacBook Pro',
      quantity: 1,
      estimated_price: 2000
    }
  ],
  org_id: 1,
  user_id: 6
};

describe('Request Service', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should submit request and create audit log', async () => {

    isUserLinkedToOrganizationService.mockResolvedValue({
      id: 5,
      role: CONSTANTS.ROLES.REQUESTER
    });

    mockFindOne.mockResolvedValueOnce(null);

    mockCreate
      .mockResolvedValueOnce({
        id: 1,
        ...CREATE_REQUEST_PAYLOAD,
        status: CONSTANTS.REQUEST.STATUS.SUBMITTED
      })
      .mockResolvedValueOnce({
        id: 1,
        action: 'submitted'
      });

    mockCreateMany.mockResolvedValue([]);

    const result = await submitRequestService(CREATE_REQUEST_PAYLOAD);

    expect(result.id).toBe(1);
    expect(result.status).toBe(CONSTANTS.REQUEST.STATUS.SUBMITTED);

    expect(mockFindOne).toHaveBeenCalledTimes(1);
    expect(mockCreate).toHaveBeenCalledTimes(2);
    expect(mockCreateMany).toHaveBeenCalledTimes(1);
  });

  it('should reject non-requester role', async () => {

    isUserLinkedToOrganizationService.mockResolvedValue({
      id: 6,
      role: CONSTANTS.ROLES.APPROVER
    });

    await expect(
      submitRequestService(CREATE_REQUEST_PAYLOAD)
    ).rejects.toThrow('User is not in a requester role.');

    expect(mockCreate).not.toHaveBeenCalled();
    expect(mockCreateMany).not.toHaveBeenCalled();
  });

  it('should reject duplicate request', async () => {

    isUserLinkedToOrganizationService.mockResolvedValue({
      id: 5,
      role: CONSTANTS.ROLES.REQUESTER
    });

    mockFindOne.mockResolvedValueOnce({
      id: 10,
      title: CREATE_REQUEST_PAYLOAD.title
    });

    await expect(
      submitRequestService(CREATE_REQUEST_PAYLOAD)
    ).rejects.toThrow('A request with the same title already exists.');

    expect(mockCreate).not.toHaveBeenCalled();
    expect(mockCreateMany).not.toHaveBeenCalled();
  });

  it('should throw if user not found', async () => {

    isUserLinkedToOrganizationService.mockRejectedValue(
      new Error('user was not found with organization passed.')
    );

    await expect(
      submitRequestService(CREATE_REQUEST_PAYLOAD)
    ).rejects.toThrow('user was not found with organization passed.');

    expect(mockCreate).not.toHaveBeenCalled();
    expect(mockCreateMany).not.toHaveBeenCalled();
  });
});