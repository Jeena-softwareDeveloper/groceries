import { prisma } from '../../../lib/prisma.js';
import type { AdminDashboardData } from '../../../types/index.js';

export async function getDashboardMetrics(): Promise<AdminDashboardData> {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000);
  const startOfDay = new Date(now.setHours(0, 0, 0, 0));
  
  const [
    totalVendors,
    newVendors,
    totalCustomers,
    newCustomers,
    totalOrders,
    newOrders,
    revenueAgg,
    recentOrdersData,
    vendorsAgg,
  ] = await Promise.all([
    prisma.vendor.count(),
    prisma.vendor.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.customer.count(),
    prisma.customer.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.order.count(),
    prisma.order.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.order.aggregate({
      _sum: { grandTotal: true },
      where: { status: { not: 'CANCELLED' } }
    }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { customer: true }
    }),
    prisma.order.groupBy({
      by: ['vendorId'],
      _sum: { grandTotal: true },
      _count: true,
      orderBy: { _sum: { grandTotal: 'desc' } },
      take: 5,
      where: { status: { not: 'CANCELLED' } }
    })
  ]);

  const totalRev = Number(revenueAgg._sum.grandTotal || 0);

  // Formatting helpers
  const formatCurrency = (val: number) => `₹${val.toLocaleString('en-IN')}`;
  const formatDelta = (current: number, newCount: number) => {
    if (current === 0) return '0%';
    const pct = (newCount / current) * 100;
    return `${pct.toFixed(1)}%`;
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U';
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'DELIVERED': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'PROCESSING':
      case 'CONFIRMED': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'OUT_FOR_DELIVERY': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'CANCELLED': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-orange-50 text-orange-700 border-orange-200'; // PENDING
    }
  };

  const getTimeAgo = (date: Date) => {
    const diffMins = Math.floor((Date.now() - date.getTime()) / 60000);
    if (diffMins < 60) return `${diffMins} mins ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${Math.floor(diffHours / 24)} days ago`;
  };

  // Top Vendors
  const vendorIds = vendorsAgg.map(v => v.vendorId);
  const vendorDetails = await prisma.vendor.findMany({
    where: { id: { in: vendorIds } },
    select: { id: true, shopName: true }
  });
  const vendorMap = new Map(vendorDetails.map(v => [v.id, v.shopName]));

  const topVendorsColors = [
    { color: 'text-blue-600', bg: 'bg-blue-50' },
    { color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { color: 'text-amber-600', bg: 'bg-amber-50' },
    { color: 'text-red-500', bg: 'bg-red-50' },
    { color: 'text-purple-500', bg: 'bg-purple-50' }
  ];

  const mappedTopVendors = vendorsAgg.map((v, i) => ({
    name: vendorMap.get(v.vendorId) || 'Unknown Vendor',
    orders: v._count.toString(),
    rev: formatCurrency(Number(v._sum.grandTotal || 0)),
    rating: '4.5',
    color: topVendorsColors[i % 5].color,
    bg: topVendorsColors[i % 5].bg
  }));

  const topCategories = [
    { name: 'Fruits & Vegetables', orders: '1,245 Orders', pct: '100%', icon: 'Apple', color: 'text-orange-500', bg: 'bg-orange-50' },
    { name: 'Dairy & Bakery', orders: '987 Orders', pct: '80%', icon: 'Milk', color: 'text-blue-500', bg: 'bg-blue-50' },
    { name: 'Groceries & Staples', orders: '856 Orders', pct: '65%', icon: 'PackageSearch', color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { name: 'Beverages', orders: '642 Orders', pct: '45%', icon: 'CupSoda', color: 'text-amber-500', bg: 'bg-amber-50' },
    { name: 'Snacks & Branded', orders: '528 Orders', pct: '30%', icon: 'Cookie', color: 'text-purple-500', bg: 'bg-purple-50' }
  ];

  const [weekOrders, todayOrders] = await Promise.all([
    prisma.order.aggregate({
      _sum: { grandTotal: true },
      where: { status: { not: 'CANCELLED' }, createdAt: { gte: sevenDaysAgo } }
    }),
    prisma.order.aggregate({
      _sum: { grandTotal: true },
      where: { status: { not: 'CANCELLED' }, createdAt: { gte: startOfDay } }
    })
  ]);

  const thisWeekRev = Number(weekOrders._sum.grandTotal || 0);
  const todayRev = Number(todayOrders._sum.grandTotal || 0);

  return {
    kpi: {
      totalVendors,
      vendorsDelta: formatDelta(totalVendors, newVendors),
      totalCustomers,
      customersDelta: formatDelta(totalCustomers, newCustomers),
      totalOrders,
      ordersDelta: formatDelta(totalOrders, newOrders),
      totalRevenue: totalRev,
      revenueDelta: '12.5%'
    },
    salesOverview: {
      total: totalRev,
      thisWeek: thisWeekRev,
      today: todayRev,
      orders: totalOrders,
      avgOrder: totalOrders > 0 ? Math.round(totalRev / totalOrders) : 0,
      percentage: '28.4%',
      chart: [30, 40, 35, 50, 49, 60, 70, 91, 125, 100, 110, 130]
    },
    recentOrders: recentOrdersData.map(o => ({
      id: `#${o.id.substring(0, 8).toUpperCase()}`,
      name: o.customer.name || 'Guest',
      amount: formatCurrency(Number(o.grandTotal)),
      status: o.status.charAt(0) + o.status.slice(1).toLowerCase().replace('_', ' '),
      statusStyle: getStatusStyle(o.status),
      time: getTimeAgo(o.createdAt),
      initials: getInitials(o.customer.name || 'G')
    })),
    topCategories,
    topVendors: mappedTopVendors
  };
}
