import express from 'express';
import authRoutes from './auth.routes.js';
import organizationRoutes from './organization.routes.js';
import userRoutes from './user.routes.js';
import requestRoutes from './request.routes.js';
import approvalRoutes from './approval.routes.js';
import vendorRoutes from './vendor.routes.js';
import purchaseOrderRoutes from './purchase_order.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import auditLogRoutes from './audit_log.routes.js';
import healthRoutes from './health.routes.js';

const router = express.Router();

router.use('/auth', authRoutes);

router.use('/organizations', organizationRoutes);

router.use('/users', userRoutes);

router.use('/requests', requestRoutes);

router.use('/approvals', approvalRoutes);

router.use('/vendors', vendorRoutes);

router.use('/purchase-orders', purchaseOrderRoutes);

router.use('/dashboard', dashboardRoutes);

router.use('/audit-logs', auditLogRoutes);

export { router,  healthRoutes };
