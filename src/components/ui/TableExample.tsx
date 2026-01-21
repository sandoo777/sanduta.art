"use client";

import React, { useState } from 'react';
import { Table, Badge, Button, type Column } from '@/components/ui';

// Tipul de date pentru exemplu
interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'operator' | 'viewer';
  status: 'active' | 'inactive';
  createdAt: string;
}

// Date de exemplu
const mockUsers: User[] = [
  { id: 1, name: 'Ion Popescu', email: 'ion@sanduta.art', role: 'admin', status: 'active', createdAt: '2024-01-15' },
  { id: 2, name: 'Maria Ionescu', email: 'maria@sanduta.art', role: 'manager', status: 'active', createdAt: '2024-02-20' },
  { id: 3, name: 'Vasile Ungureanu', email: 'vasile@sanduta.art', role: 'operator', status: 'inactive', createdAt: '2024-03-10' },
  { id: 4, name: 'Ana Cojocaru', email: 'ana@sanduta.art', role: 'viewer', status: 'active', createdAt: '2024-04-05' },
  { id: 5, name: 'Gheorghe Rusu', email: 'gheorghe@sanduta.art', role: 'operator', status: 'active', createdAt: '2024-05-12' },
];

/**
 * Table Component Example
 * 
 * Exemplu complet de utilizare a componentei Table
 * cu sorting, pagination, loading state, și custom rendering
 */
export default function TableExample() {
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Definirea coloanelor
  const columns: Column<User>[] = [
    {
      key: 'id',
      label: 'ID',
      width: '80px',
      sortable: true,
    },
    {
      key: 'name',
      label: 'Nume',
      sortable: true,
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
    },
    {
      key: 'role',
      label: 'Rol',
      align: 'center',
      sortable: true,
      render: (user) => (
        <Badge 
          value={user.role.toUpperCase()} 
          className="capitalize"
        />
      ),
    },
    {
      key: 'status',
      label: 'Status',
      align: 'center',
      render: (user) => (
        <Badge value={user.status === 'active' ? 'ACTIV' : 'INACTIV'} />
      ),
    },
    {
      key: 'createdAt',
      label: 'Data Creării',
      sortable: true,
      render: (user) => new Date(user.createdAt).toLocaleDateString('ro-RO'),
    },
    {
      key: 'actions',
      label: 'Acțiuni',
      align: 'right',
      render: (_user) => (
        <div className="flex gap-2 justify-end">
          <Button size="sm" variant="ghost">
            Edit
          </Button>
          <Button size="sm" variant="danger">
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const handleRowClick = (user: User) => {
    console.log('Clicked user:', user);
  };

  const simulateLoading = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Table Component Example</h1>
        <p className="text-gray-600">Exemple complete de utilizare a componentei Table</p>
      </div>

      {/* Controale */}
      <div className="flex gap-4">
        <Button onClick={simulateLoading}>
          Simulează Loading
        </Button>
        <Button variant="secondary" onClick={() => setCurrentPage(1)}>
          Reset Page
        </Button>
      </div>

      {/* Exemplu 1: Tabel Basic cu Sorting */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">1. Basic Table cu Sorting</h2>
        <Table
          columns={columns}
          data={mockUsers}
          rowKey="id"
          onRowClick={handleRowClick}
          loading={loading}
        />
      </section>

      {/* Exemplu 2: Tabel Compact cu Border */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">2. Compact Table cu Border</h2>
        <Table
          columns={columns.slice(0, 4)}
          data={mockUsers}
          rowKey="id"
          compact
          bordered
        />
      </section>

      {/* Exemplu 3: Cu Pagination */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">3. Table cu Pagination</h2>
        <Table
          columns={columns}
          data={mockUsers}
          rowKey="id"
          pagination={{
            currentPage,
            totalPages: 5,
            totalCount: 25,
            pageSize: 5,
            onPageChange: setCurrentPage,
          }}
        />
      </section>

      {/* Exemplu 4: Sticky Header */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">4. Sticky Header (max 400px)</h2>
        <Table
          columns={columns}
          data={[...mockUsers, ...mockUsers, ...mockUsers]}
          rowKey="id"
          stickyHeader
          maxHeight="400px"
          bordered
        />
      </section>

      {/* Exemplu 5: Empty State */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">5. Empty State</h2>
        <Table
          columns={columns}
          data={[]}
          emptyMessage="Nu există utilizatori înregistrați"
        />
      </section>

      {/* Exemplu 6: Cu Custom Row ClassName */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">6. Custom Row Styling</h2>
        <Table
          columns={columns}
          data={mockUsers}
          rowKey="id"
          rowClassName={(user) => 
            user.status === 'inactive' ? 'opacity-50 bg-red-50 dark:bg-red-900/10' : ''
          }
        />
      </section>
    </div>
  );
}
