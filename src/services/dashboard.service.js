import { db } from "#config/database.js";
import { sql } from "drizzle-orm";
import { CONSTANTS } from "./constants.service.js";

export const getDashboardSummaryService = async (role, org_id, user_id) => {
    console.log("role", role)
    if(role === CONSTANTS.ROLES.MODERATOR){
        return await handleModeratorInfo(org_id);
    } else if(role === CONSTANTS.ROLES.REQUESTER){
        return await handleRequesterInfo(org_id, user_id);
    } else if(role === CONSTANTS.ROLES.APPROVER){
        return await handleApproverInfo(org_id, user_id);
    } else{
        return await handleDefaultInfo();
    }
};

const handleModeratorInfo = async (org_id) => {
    const query = `
    WITH pos_stats AS (
        SELECT
            COUNT(*) FILTER (
                WHERE po.status = 'approved'
            ) AS approved,

            COUNT(*) FILTER (
                WHERE po.status = 'awaiting'
            ) AS awaiting,

            COUNT(*) FILTER (
                WHERE po.status = 'sent'
            ) AS sent,

            COUNT(*) FILTER (
                WHERE po.status = 'completed'
            ) AS completed,

            COALESCE(
                SUM(po.total_amount),
                0
            ) AS total_spent

        FROM purchase_orders po
        INNER JOIN requests r
            ON po.request_id = r.id

        WHERE r.org_id = ${org_id}
    ),

    vendors_stats AS (
        SELECT
            COUNT(DISTINCT po.vendor_id) AS active_vendors

        FROM purchase_orders po
        INNER JOIN requests r
            ON po.request_id = r.id

        WHERE r.org_id = ${org_id}
    )

    SELECT *
    FROM pos_stats, vendors_stats
    `;

    const result = (await db.execute(sql.raw(query))).rows[0];

    return {
        procurements: {
            purchaseOrders:{
                approved: Number(result.approved || 0),
                awaiting: Number(result.awaiting || 0),
                sent: Number(result.sent || 0),
                completed: Number(result.completed || 0),
                averageCreationTime: Number(result.average_creation_time || 0),
            },
            totalSpent: Number(result.total_spent || 0),
            activeVendors: Number(result.active_vendors || 0),
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
            ) AS completed

        FROM requests
        WHERE org_id = ${org_id}
        AND created_by = ${user_id}
    `;

    const result = (await db.execute(sql.raw(query))).rows[0];

    return {
        requests: {
            total: Number(result.total || 0),
            awaiting: Number(result.awaiting || 0),
            approved: Number(result.approved || 0),
            rejected: Number(result.rejected || 0),
            completed: Number(result.completed || 0),
        }
    }
};

const handleApproverInfo = async (org_id, user_id) => {
    const query = `
        WITH pos_stats AS (
            SELECT
                COUNT(*) FILTER (WHERE po.status = 'approved') AS approved,
                COUNT(*) FILTER (WHERE po.status = 'awaiting') AS awaiting,
                COUNT(*) FILTER (WHERE po.status = 'sent') AS sent,
                COUNT(*) FILTER (WHERE po.status = 'completed') AS completed,
                COALESCE(SUM(po.total_amount), 0) AS total_spent
            FROM purchase_orders po
            INNER JOIN requests r ON po.request_id = r.id
            WHERE r.org_id = ${org_id}
        ),

        vendors_stats AS (
            SELECT
                COUNT(DISTINCT po.vendor_id) AS active_vendors
            FROM purchase_orders po
            INNER JOIN requests r ON po.request_id = r.id
            WHERE r.org_id = ${org_id}
        )

        SELECT *
        FROM pos_stats
        CROSS JOIN vendors_stats
        `;

    const result = (await db.execute(sql.raw(query))).rows[0];
    
    return {
        approves: {
            pending: Number(result.pending || 0),
            approved: Number(result.approved || 0),
            rejected: Number(result.rejected || 0),
            averageApprovedTime: Number(result.average_approved_time || 0),
            overdue: Number(result.overdue || 0),
        }
    }
};

const handleDefaultInfo = async () => {
    const query = `
        WITH org_stats AS (
            SELECT COUNT(*) AS organizations
            FROM organizations
        ),

        user_stats AS (
            SELECT COUNT(*) AS users
            FROM users
        ),

        audit_stats AS (
            SELECT COUNT(*) AS actions
            FROM audit_logs
        ),

        po_avg AS (
            SELECT COALESCE(AVG(total_amount), 0) AS purchase_orders
            FROM purchase_orders
        )

        SELECT *
        FROM org_stats
        CROSS JOIN user_stats
        CROSS JOIN audit_stats
        CROSS JOIN po_avg
        `;
    const result = (await db.execute(sql.raw(query))).rows[0];

    return {
        stats:{
            total:{
                organizations: Number(result.organizations || 0),
                users: Number(result.users || 0),
                actions: Number(result.actions || 0),
                purchaseOrders: Number(result.purchase_orders || 0),
            },
        }
    }
};
