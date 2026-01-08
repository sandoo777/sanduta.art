'use client';

import Link from "next/link";

export default function AdminPage() {
  const stats = [
    { label: 'Total Products', value: '42', icon: '📦', link: '/admin/products', color: 'bg-blue-50 text-blue-600' },
    { label: 'Total Orders', value: '128', icon: '🛒', link: '/manager/orders', color: 'bg-green-50 text-green-600' },
    { label: 'Total Users', value: '356', icon: '👥', link: '/admin/users', color: 'bg-purple-50 text-purple-600' },
    { label: 'Categories', value: '8', icon: '🏷️', link: '/admin/categories', color: 'bg-yellow-50 text-yellow-600' },
  ];

  const quickActions = [
    { title: 'Dashboard', description: 'View analytics and statistics', icon: '📊', link: '/admin/dashboard' },
    { title: 'Manage Products', description: 'Add, edit, or remove products', icon: '📦', link: '/admin/products' },
    { title: 'View Orders', description: 'Process and manage orders', icon: '📋', link: '/admin/orders' },
    { title: 'Manage Categories', description: 'Organize product categories', icon: '🏷️', link: '/admin/categories' },
    { title: 'Customers', description: 'Manage customer information', icon: '👥', link: '/admin/customers' },
    { title: 'Production', description: 'Track production status', icon: '🏭', link: '/admin/production' },
    { title: 'Materials', description: 'Manage inventory and materials', icon: '📦', link: '/admin/materials' },
    { title: 'Print Methods', description: 'Configure printing methods and costs', icon: '🖨️', link: '/admin/print-methods' },
    { title: 'Finishing Operations', description: 'Manage finishing and post-processing', icon: '✂️', link: '/admin/finishing' },
    { title: 'Machines & Equipment', description: 'Manage production equipment', icon: '⚙️', link: '/admin/machines' },
    { title: 'Reports', description: 'View business reports', icon: '📈', link: '/admin/reports' },
    { title: 'Site Settings', description: 'Configure site preferences', icon: '⚙️', link: '/admin/settings' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to the admin panel. Here's your overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.link}>
            <div className={`${stat.color} rounded-lg p-6 cursor-pointer hover:shadow-lg transition`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium opacity-75">{stat.label}</p>
                  <p className="text-3xl font-bold mt-2">{stat.value}</p>
                </div>
                <div className="text-4xl">{stat.icon}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickActions.map((action) => (
            <Link key={action.title} href={action.link}>
              <div className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition">
                <div className="flex items-start">
                  <div className="text-3xl mr-4">{action.icon}</div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {action.title}
                    </h3>
                    <p className="text-sm text-gray-600">{action.description}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Activity</h2>
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 space-y-4">
            <div className="flex items-center border-b pb-3">
              <div className="text-2xl mr-3">📦</div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">New order received</p>
                <p className="text-xs text-gray-500">Order #1234 - 5 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center border-b pb-3">
              <div className="text-2xl mr-3">👤</div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">New user registered</p>
                <p className="text-xs text-gray-500">john@example.com - 1 hour ago</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="text-2xl mr-3">✅</div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Product updated</p>
                <p className="text-xs text-gray-500">Canvas Print 40x60 - 2 hours ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}