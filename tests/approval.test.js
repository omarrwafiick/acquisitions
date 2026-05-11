import { changeRequestStateService } from '#src/services/approval.service.js';
import { getAuditLogsByEntityIdService } from '#src/services/auditLog.service.js';
import { CONSTANTS } from '#src/services/constants.service.js';
import { getRequestByIdService, submitRequestService } from '#src/services/request.service.js';
import { getUserByEmailService } from '#src/services/user.service.js';
// Happy path
// approver approves pending request
// → approval created
// → request status changes
// → audit log created
let DEFAULT_MODERATOR;

let DEFAULT_APPROVER;

let DEFAULT_REQUESTER;

beforeAll(async () => {
  DEFAULT_REQUESTER = await getUserByEmailService({
    email: 'user2@example.com'
  });

  DEFAULT_APPROVER = await getUserByEmailService({
    email: 'user1@example.com'
  });
});

describe('Approval Process', () => {
  it('should allow approver to approve a pending request', async () => {
    // Setup: create a pending request and an approver
    const requester = DEFAULT_REQUESTER;
    const newRequest = await submitRequestService({
        title: `Test Request ${Date.now()}`,
        reason: 'Test Reason',
        items: [
            {
                name: 'Item 1',
                quantity: 2,
                estimatedPrice: 100
            },
            {
                name: 'Item 2',
                quantity: 1,
                estimatedPrice: 50
            }
        ],
        org_id: requester.org_id,
        user_id: requester.id
    });

    expect(newRequest).toHaveProperty('id');
    expect(newRequest).toHaveProperty('status', CONSTANTS.REQUEST.STATUS.SUBMITTED);
    expect(newRequest).toHaveProperty('created_by', requester.id);

    // Action: approver approves the request
    const approver = DEFAULT_APPROVER;
    const updatedRequest = await changeRequestStateService({
        requestId: newRequest.id,
        approverId: approver.id,
        org_id: approver.org_id,
        newStatus: CONSTANTS.REQUEST.STATUS.APPROVED,
        updateReason: 'Request approved'
    });

    expect(updatedRequest).toHaveProperty('id', newRequest.id);
    expect(updatedRequest).toHaveProperty('status', CONSTANTS.REQUEST.STATUS.APPROVED);

    // Verify: approval row exists, request status updated, timestamps set
    const fetchUpdatedRequest = await getRequestByIdService({
        id: newRequest.id,
        org_id: newRequest.org_id
    });

    expect(fetchUpdatedRequest).toHaveProperty('id', newRequest.id);
    expect(fetchUpdatedRequest).toHaveProperty('status', CONSTANTS.REQUEST.STATUS.APPROVED);
    expect(fetchUpdatedRequest).toHaveProperty('approver_id', approver.id);

    //Verify: audit log created
    const auditLogs = await getAuditLogsByEntityIdService({ entity_id: newRequest.id, org_id: newRequest.org_id });

    expect(auditLogs).toBeDefined();
    expect(auditLogs[0].action).toBe(CONSTANTS.REQUEST.STATUS.SUBMITTED);
    expect(auditLogs[1].action).toBe(`change_state_${CONSTANTS.REQUEST.STATUS.APPROVED}`);
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