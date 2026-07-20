import { Router } from 'express';
import { authenticate, authorize } from '../auth/auth.service.js';
import { districtRoutes } from './districts/district.routes.js';
import { areaRoutes } from './areas/area.routes.js';
import { categoryRoutes } from './categories/category.routes.js';
import { vendorAdminRoutes } from './vendors/vendor.routes.js';
import { settingsRoutes } from './settings/settings.routes.js';
import { marketingRoutes } from './marketing/marketing.routes.js';
import { analyticsRoutes, customersAdminRoutes, notificationsAdminRoutes, staticPagesRoutes } from './analytics/analytics.routes.js';
import { vendorRequestAdminRoutes } from '../vendor-request/vendor-request.admin.routes.js';
import { productApprovalAdminRoutes, offerApprovalAdminRoutes } from './product-approvals/product-approval.routes.js';

import { dashboardRoutes } from './dashboard/dashboard.routes.js';

export const adminRoutes = Router();

adminRoutes.use(authenticate, authorize('SUPER_ADMIN'));

adminRoutes.use('/dashboard', dashboardRoutes);
adminRoutes.use('/districts', districtRoutes);
adminRoutes.use('/areas', areaRoutes);
adminRoutes.use('/categories', categoryRoutes);
adminRoutes.use('/subcategories', categoryRoutes);
adminRoutes.use('/vendors', vendorAdminRoutes);
adminRoutes.use('/settings', settingsRoutes);
adminRoutes.use('/', marketingRoutes);
adminRoutes.use('/analytics', analyticsRoutes);
adminRoutes.use('/customers', customersAdminRoutes);
adminRoutes.use('/notifications', notificationsAdminRoutes);
adminRoutes.use('/pages', staticPagesRoutes);
adminRoutes.use('/vendor-requests', vendorRequestAdminRoutes);
adminRoutes.use('/product-approvals', productApprovalAdminRoutes);
adminRoutes.use('/offer-approvals', offerApprovalAdminRoutes);

