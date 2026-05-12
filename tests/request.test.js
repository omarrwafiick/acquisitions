import { CONSTANTS } from '#src/services/constants.service.js';
import { mockedCalls } from './helpers/mocked.calls.js';

const { mockCreate, mockFindOne, mockUpdateOne, mockExecute } = mockedCalls;

const { submitRequestService } = await import('#src/services/request.service.js');
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