import { db } from "#config/database.js";
import { sql } from "drizzle-orm";

export const getDashboardSummaryService = async (role, org_id, user_id) => {
    if(role === 'moderator'){
        return await handleModeratorInfo(org_id);
    } else if(role === 'requester'){
        return await handleRequesterInfo(org_id, user_id);
    } else if(role === 'approver'){
        return await handleApproverInfo(org_id, user_id);
    } else{
        return await handleDefaultInfo();
    }
};

const handleModeratorInfo = async (org_id) => {
    const query = `
        With pos_stats AS (
            SELECT
                COUNT(*) FILTER(
                    WHERE status = 'approved',
                ) AS approved,

                COUNT(*) FILTER(
                    WHERE status = 'awaiting',
                ) AS awaiting,

                COUNT(*) FILTER(
                    WHERE status = 'sent',
                ) AS sent,

                COUNT(*) FILTER(
                    WHERE status = 'completed',
                ) AS completed, 

                AVG(
                    EXTRACT(
                        EPOCH FROM (
                            created_at - requests_approved_at
                        )
                    )/3600
                ) AS average_creation_time,
                
                COALESCE(
                    SUM(total_amount),
                    0
                ) AS total_spent 

            FROM purchase_orders
            WHERE org_id = ${org_id}
        ),

        vendors_stats AS (
            SELECT 
                COUNT(DISTICT vendor_id) AS active_vendors
            FROM purchase_orders 
            WHERE org_id = ${org_id}
        ),

        SELECT * FROM pos_stats, vendor_stats
    `;

    const result = (await db.execute(sql`${query}`)).rows[0];

    return {
        procurements: {
            purchaseOrders:{
                approved: Number(result.approved),
                awaiting: Number(result.awaiting),
                sent: Number(result.sent),
                completed: Number(result.completed),
                averageCreationTime: Number(result.average_creation_time),
            },
            totalSpent: Number(result.total_spent),
            activeVendors: Number(result.active_vendors),
        }
    }
};

const handleRequesterInfo = async (org_id, user_id) => {
    const query = `
        SELECT 
            COUNT(*) AS total,

            COUNT(*) FILTER(
                WHERE status = 'submitted'
            ) AS awaiting,

            COUNT(*) FILTER(
                WHERE status = 'approved'
            ) AS approved,
            
            COUNT(*) FILTER(
                WHERE status = 'rejected'
            ) AS rejected,

            COUNT(*) FILTER(
                WHERE status = 'completed'
            ) AS completed,

        FROM requests
        WHERE org_id = ${org_id}
        AND created_by = ${user_id}
    `;

    const result = (await db.execute(sql`${query}`)).rows[0];

    return {
        requests: {
            total: Number(result.total),
            awaiting: Number(result.awaiting),
            approved: Number(result.approved),
            rejected: Number(result.rejected),
            completed: Number(result.completed),
        }
    }
};

const handleApproverInfo = async (org_id, user_id) => {
    const query = `
        SELECT
            COUNT(*) FILTER(
                WHERE status = 'pending'
            ) AS pending,

            COUNT(*) FILTER(
                WHERE status = 'approved'
            ) AS approved,

            COUNT(*) FILTER(
                WHERE status = 'rejected'
            ) AS rejected,

            AVG(
                EXTRACT(
                    EPOCH FROM (
                        decided_at - created_at
                    )
                )/3600
            ) AS average_approved_time,

            COUNT(*) FILTER(
                WHERE status = 'pending'
                AND
                NOW() - created_at 
                > INTERVAL '72 hours'
            ) AS overdue,

        FROM approvals
        WHERE org_id = ${org_id}
        AND approver_id = ${user_id}            
    `;

    const result = (await db.execute(sql`${query}`)).rows[0];
    
    return {
        approves: {
            pending: Number(result.pending),
            approved: Number(result.approved),
            rejected: Number(result.rejected),
            averageApprovedTime: Number(result.average_approved_time),
            overdue: Number(result.overdue),
        }
    }
};

const handleDefaultInfo = async () => {
    const query = `
        WITH org_stats AS (
            SELECT COUNT(*) AS organizations
            FROM organizations            
        ),

        user_stats AS(
            SELECT COUNT(*) AS users
            FROM users 
        ),

        audit_stats AS(
            SELECT COUNT(*) AS actions
            FROM audit_logs  
        ),

        po_avg AS(
            SELECT AVG(total_amount) AS purchase_orders
            FROM purchase_orders
        ),

        request_avg AS(
            SELECT AVG(total_estimated_amount) AS requests
            FROM requests
        ),

        approval_avg AS(
            SELECT AVG(
                EXTRACT(
                    EPOCH FROM(
                        decided_at - created_at
                    )
                )/3600
            ) AS approves
            FROM approvals
        )

        SELECT *
        FROM 
            org_stats,
            user_stats,
            audit_stats,
            po_avg,
            request_avg,
            approval_avg
    `;

    const result = (await db.execute(sql`${query}`)).rows[0];

    return {
        stats:{
            total:{
                organizations: Number(result.organizations),
                users: Number(result.users),
                actions: Number(result.actions),
            },
            averge:{
                perMonth:{
                    purchaseOrders: Number(result.purchase_orders),
                    requests: Number(result.requests),
                    approves: Number(result.approves),
                }
            }
        }
    }
};
