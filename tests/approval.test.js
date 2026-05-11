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

const { changeRequestStateService } = await import('#src/services/approval.service.js');

describe('Approval Service', () => {

   it('should approve request', async () => {

    mockFindOne
      .mockResolvedValueOnce({
        id: 10,
        status: 'submitted',
        org_id: 1
      })
      .mockResolvedValueOnce({
        id: 5,
        role: 'approver'
      });

    mockExecute.mockResolvedValue({
      rows: [
        {
          id: 10,
          status: 'submitted',
          org_id: 1
        }
      ]
    });

    const result =
      await changeRequestStateService({
        requestId: 10,
        approverId: 5,
        org_id: 1,
        newStatus: 'approved',
        updateReason: 'ok'
      });

    expect(result.status)
      .toBe('approved');

    expect(mockUpdateOne)
      .toHaveBeenCalled();

    expect(mockCreate)
      .toHaveBeenCalled();
  });

  
  it('should allow approver to reject a pending request', async () => {
    // Setup: create a pending request and an approver 

    // Action: approver rejects the request
    
    // Verify: status = rejected, reason stored, audit logged
  });

  it('should prevent approving an already approved request', async () => {
    // Setup: create an approved request

    // Action: try to approve the already approved request

    // Expected: 409 Conflict
  });

  it('should prevent wrong state transitions', async () => {
    // Setup: create a rejected request and a completed request

    // Action: try to approve the rejected request
    // Action: try to approve the completed request

    // Expected: appropriate error responses
  });

  it('should prevent requester from approving their own request', async () => {
    // Setup: create a pending request with a requester

    // Action: requester tries to approve their own request

    // Expected: appropriate error response (e.g., 403 Forbidden)
  });
});

// Verify:

// approval row exists
// request status updated
// timestamps set


// Reject path
// approver rejects request

// Verify:

// status = rejected
// reason stored
// audit logged


// Double approval protection

// Very important.

// Test:

// approve already approved request

// Expected:

// 409 Conflict

// This prevents duplicate spending.


// Wrong state transition

// Test:

// approve rejected request
// approve completed request


// Authorization

// Requester must not approve.

// Test:

// requester tries approve