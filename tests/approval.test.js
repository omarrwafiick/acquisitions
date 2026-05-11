// Happy path
// approver approves pending request
// → approval created
// → request status changes
// → audit log created

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