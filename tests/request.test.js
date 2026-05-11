// Happy path
// requester creates request
// → request persisted
// → status = pending
// → approval workflow created
// → audit log created

// Verify:

// request exists
// status = pending
// request items exist
// audit log exists


// Authorization

// A non-requester must not create requests.

// Validation

// Bad payload