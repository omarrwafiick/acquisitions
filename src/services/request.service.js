import NotFoundException from '#exceptions/notFound.exception.js';
import { requests } from '#models/request.model.js';
import { users } from '#models/user.model.js';
import {
  create,
  findMany,
  findManyWithJoin,
  findOne,
} from '#repositories/main.repository.js';
import { and, eq } from 'drizzle-orm';
import { isUserLinkedToOrganizationService } from './user.service.js';
import { request_items } from '#models/request_item.model.js';
import { sql } from 'drizzle-orm';
import { db } from '#config/database.js';
import logger, { logEventObj } from '#config/logger.js';


export const listRequestsService = async (query = {}, payload) => {
  const { org_id } = payload;

  const result = await db.execute(sql`
        SELECT
            r.id,
            r.org_id,
            r.created_by,
            r.approver_id,
            r.updated_at,
            r.update_reason,
            r.title,
            r.reason,
            r.status,
            r.created_at,

            COALESCE(
                json_agg(
                    json_build_object(
                        'id', ri.id,
                        'request_id', ri.request_id,
                        'name', ri.name,
                        'quantity', ri.quantity,
                        'estimated_price',
                        ri.estimated_price
                    )
                ) FILTER (
                    WHERE ri.id IS NOT NULL
                ),
                '[]'
            ) AS items

        FROM requests r

        LEFT JOIN request_items ri
        ON ri.request_id = r.id

        WHERE r.org_id = ${org_id}

        GROUP BY r.id

        ORDER BY r.created_at DESC

        LIMIT ${query.end ?? 20}
        OFFSET ${query.start ?? 0}
    `);

  return result.rows;
};

export const getRequestByIdService = async payload => {
  const { id, org_id } = payload;
  return await findOne(
    requests,
    and(eq(requests.id, id), eq(requests.org_id, org_id))
  );
};

export const submitRequestService = async payload => {
  const { title, reason, items, org_id, user_id } = payload;

  await isUserLinkedToOrganizationService(org_id, user_id);

  return await db.transaction(async trx => {
    const [request] = await trx.insert(requests).values({
      org_id,
      created_by: user_id,
      title,
      reason,
      status: CONSTANTS.REQUEST.STATUS.SUBMITTED,
    });

    await trx.insert(request_items).values(
      items.map(item => ({
        request_id: request.id,
        name: item.name,
        quantity: item.quantity,
        estimated_price: item.estimatedPrice,
      }))
    );

    await trx.execute(sql`
        INSERT INTO audit_logs (
            org_id,
            actor_id,
            entity_type,
            entity_id,
            action
        )
        VALUES (
            ${org_id},
            ${user_id},
            ${'request'},
            ${request.id},
            'submit'
        )
    `);

    logger.info(logEventObj(
        "Create request",
        user_id,
        org_id,
        "Request",
        request.id,
        {
          "request": request
        }
      )
    );
    return request;
  });
};
