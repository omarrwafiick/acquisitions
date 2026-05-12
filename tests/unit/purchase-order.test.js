import { CONSTANTS } from '#src/services/constants.service.js';
import { jest } from '@jest/globals';

const { mockedCalls } =
  await import('../helpers/mocked.calls.js');

const {
  mockCreate,
  mockFindOne,
  mockFindMany,
  mockUpdateOne
} = mockedCalls;


jest.unstable_mockModule(
  '#src/services/user.service.js',
  () => ({
    isUserLinkedToOrganizationService: jest.fn()
  })
);

jest.unstable_mockModule(
  '#src/services/email.service.js',
  () => ({
    sendEmailService: jest.fn(),
    vendorEmailBodyBuilder: jest.fn()
  })
);


const {
  isUserLinkedToOrganizationService
} =
  await import('#src/services/user.service.js');


const {
  sendEmailService,
  vendorEmailBodyBuilder
} =
  await import('#src/services/email.service.js');


const {
  createPurchaseOrderService,
  sendPurchaseOrderService,
  completePurchaseOrderService
} =
  await import(
    '#src/services/purchaseOrder.service.js'
  );

describe('Purchase Order Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });


  it(
    'should create purchase order',
    async () => {

      isUserLinkedToOrganizationService
        .mockResolvedValue({
          id: 7,
          role: CONSTANTS.ROLES.MODERATOR
        });


      mockFindOne
        .mockResolvedValueOnce({
          id: 3,
          status:
            CONSTANTS.REQUEST.STATUS.APPROVED,
          org_id: 1
        })
        .mockResolvedValueOnce({
          id: 1,
          email: 'vendor@test.com'
        })
        .mockResolvedValueOnce(null);

      mockFindMany
        .mockResolvedValue([
          {
            quantity: 1,
            estimated_price: 5000
          }
        ]);


      mockCreate
        .mockResolvedValueOnce({
          id: 10,
          request_id: 3,
          vendor_id: 1,
          created_by: 7,
          total_amount: 5000,
          status:
            CONSTANTS
              .PURCHASE_ORDER
              .STATUS
              .AWAITING
        })

        .mockResolvedValueOnce({
          id: 1
        });


      const result =
        await createPurchaseOrderService({
          org_id: 1,
          user_id: 7,
          request_id: 3,
          vendor_id: 1,
          total_amount: 5000
        });


      expect(result.id).toBe(10);

      expect(mockCreate)
        .toHaveBeenCalledTimes(2);
    }
  );


  it(
    'should reject non approved request',
    async () => {

      isUserLinkedToOrganizationService
        .mockResolvedValue({
          id: 7
        });


      mockFindOne
        .mockResolvedValueOnce({
          id: 3,
          status:
            CONSTANTS.REQUEST.STATUS.SUBMITTED
        });


      await expect(
        createPurchaseOrderService({
          org_id: 1,
          user_id: 7,
          request_id: 3,
          vendor_id: 1,
          total_amount: 5000
        })
      )
        .rejects
        .toThrow(
          'Request was not approved or found'
        );
    }
  );


  it(
    'should reject duplicate purchase order',
    async () => {

      isUserLinkedToOrganizationService
        .mockResolvedValue({
          id: 7
        });


      mockFindOne

        .mockResolvedValueOnce({
          id: 3,
          status:
            CONSTANTS.REQUEST.STATUS.APPROVED
        })

        .mockResolvedValueOnce({
          id: 1
        })

        .mockResolvedValueOnce({
          id: 99
        });


      await expect(
        createPurchaseOrderService({
          org_id: 1,
          user_id: 7,
          request_id: 3,
          vendor_id: 1,
          total_amount: 5000
        })
      )
        .rejects
        .toThrow(
          'Purchase order already exists'
        );
    }
  );


  it(
    'should require reason for lower amount',
    async () => {

      isUserLinkedToOrganizationService
        .mockResolvedValue({
          id: 7
        });


      mockFindOne

        .mockResolvedValueOnce({
          id: 3,
          status:
            CONSTANTS.REQUEST.STATUS.APPROVED
        })

        .mockResolvedValueOnce({
          id: 1
        })

        .mockResolvedValueOnce(null);


      mockFindMany
        .mockResolvedValue([
          {
            quantity: 1,
            estimated_price: 5000
          }
        ]);


      await expect(
        createPurchaseOrderService({
          org_id: 1,
          user_id: 7,
          request_id: 3,
          vendor_id: 1,
          total_amount: 4000
        })
      )
        .rejects
        .toThrow(
          'A reason is required'
        );
    }
  );


  it(
    'should send purchase order',
    async () => {

      await sharedStateTest(
        CONSTANTS
          .PURCHASE_ORDER
          .STATUS
          .AWAITING,

        CONSTANTS
          .PURCHASE_ORDER
          .STATUS
          .SENT
      );

    }
  );


  it(
    'should complete purchase order',
    async () => {

      await sharedStateTest(
        CONSTANTS
          .PURCHASE_ORDER
          .STATUS
          .SENT,

        CONSTANTS
          .PURCHASE_ORDER
          .STATUS
          .COMPLETED
      );

    }
  );

});



const sharedStateTest =
  async (
    oldStatus,
    expectedStatus
  ) => {

    isUserLinkedToOrganizationService
      .mockResolvedValue({
        id: 7
      });


    mockFindOne
      .mockResolvedValueOnce({
        id: 10,
        request_id: 3,
        vendor_id: 1,
        created_by: 7,
        status: oldStatus
      })
      .mockResolvedValueOnce({
        id: 3,
        org_id: 1
      })
      .mockResolvedValueOnce({
        id: 7,
        email: 'buyer@test.com',
        org_id: 1
      })
      .mockResolvedValueOnce({
        id: 1,
        email: 'vendor@test.com'
      });


    vendorEmailBodyBuilder
      .mockReturnValue(
        'email body'
      );


    sendEmailService
      .mockResolvedValue(true);


    const result =
      expectedStatus ===
      CONSTANTS
        .PURCHASE_ORDER
        .STATUS
        .SENT

        ? await sendPurchaseOrderService({
            org_id: 1,
            user_id: 7,
            purchase_order_id: 10
          })

        : await completePurchaseOrderService({
            org_id: 1,
            user_id: 7,
            purchase_order_id: 10
          });


    expect(result.status)
      .toBe(expectedStatus);

    expect(mockUpdateOne)
      .toHaveBeenCalledTimes(1);
  };