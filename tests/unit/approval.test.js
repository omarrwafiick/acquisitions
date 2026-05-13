import { jest } from '@jest/globals';
import { mockedCalls } from '../helpers/mocked.calls.js';
import { CONSTANTS } from '#src/services/constants.service.js';

const { mockCreate, mockFindOne, mockUpdateOne, mockExecute } = mockedCalls;

const { changeRequestStateService } =
  await import('#src/services/approval.service.js');

describe('Approval Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should approve request and create audit log', async () => {
    await sharedChangeRequestStateTests(
      CONSTANTS.REQUEST.STATUS.APPROVED,
      CONSTANTS.REQUEST.STATUS.SUBMITTED
    );
  });

  it('should reject request and create audit log', async () => {
    await sharedChangeRequestStateTests(
      CONSTANTS.REQUEST.STATUS.REJECTED,
      CONSTANTS.REQUEST.STATUS.SUBMITTED
    );
  });

  it('should prevent approving an already approved request', async () => {
    mockFindOne.mockResolvedValueOnce({
      id: 5,
      role: 'approver',
    });

    mockExecute.mockResolvedValue({
      rows: [
        {
          id: 10,
          status: CONSTANTS.REQUEST.STATUS.APPROVED,
          org_id: 1,
        },
      ],
    });

    await expect(
      changeRequestStateService({
        requestId: 10,
        approverId: 5,
        org_id: 1,
        newStatus: CONSTANTS.REQUEST.STATUS.APPROVED,
        updateReason: 'we can afford it',
      })
    ).rejects.toThrow(
      `Invalid status change from ${CONSTANTS.REQUEST.STATUS.APPROVED} to ${CONSTANTS.REQUEST.STATUS.APPROVED}.`
    );

    expect(mockUpdateOne).not.toHaveBeenCalled();
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it.each([
    ['submitted', 'completed'],
    ['rejected', 'approved'],
    ['completed', 'approved'],
    ['approved', 'approved'],
  ])('should reject transition from %s to %s', async (fromStatus, toStatus) => {
    mockFindOne.mockResolvedValueOnce({
      id: 5,
      role: 'approver',
    });

    mockExecute.mockResolvedValue({
      rows: [
        {
          id: 10,
          status: fromStatus,
          org_id: 1,
        },
      ],
    });

    await expect(
      changeRequestStateService({
        requestId: 10,
        approverId: 5,
        org_id: 1,
        newStatus: toStatus,
      })
    ).rejects.toThrow(
      `Invalid status change from ${fromStatus} to ${toStatus}.`
    );

    expect(mockUpdateOne).not.toHaveBeenCalled();
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('should throw not found error if request does not exist', async () => {
    mockFindOne.mockResolvedValueOnce({
      id: 5,
      role: 'approver',
    });

    mockExecute.mockResolvedValue({
      rows: [],
    });

    await expect(
      changeRequestStateService({
        requestId: 10,
        approverId: 5,
        org_id: 1,
        newStatus: CONSTANTS.REQUEST.STATUS.APPROVED,
      })
    ).rejects.toThrow('Entities was not found using ids you provided.');

    expect(mockUpdateOne).not.toHaveBeenCalled();
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('should throw forbidden error if user is not an approver', async () => {
    mockFindOne.mockResolvedValueOnce({
      id: 5,
      role: 'requester',
    });

    mockExecute.mockResolvedValue({
      rows: [
        {
          id: 10,
          status: CONSTANTS.REQUEST.STATUS.SUBMITTED,
          org_id: 1,
        },
      ],
    });

    await expect(
      changeRequestStateService({
        requestId: 10,
        approverId: 5,
        org_id: 1,
        newStatus: CONSTANTS.REQUEST.STATUS.APPROVED,
      })
    ).rejects.toThrow('User is not in role.');

    expect(mockUpdateOne).not.toHaveBeenCalled();
    expect(mockCreate).not.toHaveBeenCalled();
  });
});

const sharedChangeRequestStateTests = async (newStatus, requestStatus) => {
  mockFindOne.mockResolvedValueOnce({
    id: 5,
    role: 'approver',
  });

  mockExecute.mockResolvedValue({
    rows: [
      {
        id: 10,
        status: requestStatus,
        org_id: 1,
      },
    ],
  });

  const result = await changeRequestStateService({
    requestId: 10,
    approverId: 5,
    org_id: 1,
    newStatus,
    updateReason: 'we can afford it',
  });

  expect(result).toEqual({
    id: 10,
    status: newStatus,
  });

  expect(mockUpdateOne).toHaveBeenCalledTimes(1);

  expect(mockUpdateOne).toHaveBeenCalledWith(
    expect.anything(),
    expect.objectContaining({
      status: newStatus,
      approver_id: 5,
      update_reason: 'we can afford it',
    }),
    expect.anything()
  );

  expect(mockCreate).toHaveBeenCalledTimes(1);

  expect(mockCreate).toHaveBeenCalledWith(expect.anything(), {
    org_id: 1,
    actor_id: 5,
    entity_type: 'request',
    entity_id: 10,
    action: `change_state_${newStatus}`,
    metadata: {},
  });
};
