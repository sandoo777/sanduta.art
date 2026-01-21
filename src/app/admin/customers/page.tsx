"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button, Input, Select, Card, Badge, EmptyState } from "@/components/ui";
import { Table } from "@/components/ui/Table";
import { useConfirmDialog } from "@/components/ui/ConfirmDialog";
import type { Column } from "@/components/ui/Table.types";
import { useCustomers, type Customer } from "@/modules/customers/useCustomers";
import CustomerModal from "./_components/CustomerModal";
import { LoadingState } from "@/components/ui/LoadingState";

const SORT_OPTIONS = [
  { value: "createdAt", label: "Data creării" },
  { value: "name", label: "Nume" },
  { value: "email", label: "Email" },
];

export default function CustomersPage() {
  const router = useRouter();
  const { confirm, Dialog } = useConfirmDialog();
  const { getCustomers, deleteCustomer, loading } = useCustomers();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    pages: 0,
  });

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "email" | "createdAt">("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Load customers
  const loadCustomers = async () => {
    try {
      const response = await getCustomers({
        page: pagination.page,
        limit: pagination.limit,
        search: search || undefined,
        sortBy,
        sortOrder,
      });
      setCustomers(response.customers);
      setPagination(response.pagination);
    } catch (err) {
      console.error("Error loading customers:", err);
    }
  };

  useEffect(() => {
    loadCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, sortBy, sortOrder]);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (pagination.page !== 1) {
        setPagination((prev) => ({ ...prev, page: 1 }));
      } else {
        loadCustomers();
      }
    }, 500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // Handle delete customer
  const handleDelete = async (customer: Customer) => {
    const hasOrders = customer._count?.orders || 0;
    
    if (hasOrders > 0) {
      alert(
        `Nu poți șterge acest client deoarece are ${hasOrders} comenzi active. Șterge mai întâi comenzile.`
      );
      return;
    }

    await confirm({
      title: 'Șterge client',
      message: `Sigur vrei să ștergi clientul "${customer.name}"?`,
      variant: 'danger',
      onConfirm: async () => {
        try {
          await deleteCustomer(customer.id);
          loadCustomers();
        } catch (err) {
          console.error("Error deleting customer:", err);
          alert("Eroare la ștergerea clientului");
        }
      }
    });
  };

  // Handle edit customer
  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsModalOpen(true);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("ro-RO", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
            <p className="text-gray-600 mt-1">
              Gestionează clienții și istoricul comenzilor
            </p>
          </div>
          <Button
            onClick={() => {
              setEditingCustomer(null);
              setIsModalOpen(true);
            }}
            variant="primary"
          >
            <Plus className="w-5 h-5" />
            Add Customer
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Căutare
            </label>
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Caută după nume, email sau telefon..."
            />
          </div>

          {/* Sort By */}
          <div>
            <div className="flex gap-2">
              <Select
                options={SORT_OPTIONS}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                fullWidth={false}
                className="flex-1"
              />
              <Button
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                variant="outline"
                size="sm"
                title={sortOrder === "asc" ? "Crescător" : "Descrescător"}
              >
                {sortOrder === "asc" ? "↑" : "↓"}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Loading State */}
      {loading && customers.length === 0 && (
        <LoadingState text="Se încarcă clienții..." />
      )}

      {/* Empty State */}
      {!loading && customers.length === 0 && (
        <EmptyState
          icon={
            <svg
              className="h-16 w-16"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          }
          title={search ? "Nu s-au găsit rezultate" : "Nu există clienți"}
          description={search ? "Încearcă să modifici termenii de căutare" : "Începe prin a adăuga primul client"}
          action={!search ? {
            label: "Adaugă primul client",
            onClick: () => setIsModalOpen(true)
          } : undefined}
        />
      )}

      {/* Desktop Table View */}
      {!loading && customers.length > 0 && (
        <Card className="hidden lg:block p-0 overflow-hidden">
          <Table<Customer>
            columns={[
              {
                key: 'name',
                label: 'Client',
                sortable: true,
                render: (customer) => (
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 font-medium text-sm">
                        {customer.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {customer.name}
                      </div>
                      {customer.company && (
                        <div className="text-sm text-gray-500">{customer.company}</div>
                      )}
                    </div>
                  </div>
                )
              },
              {
                key: 'contact',
                label: 'Contact',
                render: (customer) => (
                  <div>
                    <div className="text-sm text-gray-900">{customer.email || "-"}</div>
                    <div className="text-sm text-gray-500">{customer.phone || "-"}</div>
                  </div>
                )
              },
              {
                key: 'location',
                label: 'Locație',
                render: (customer) => (
                  <div>
                    <div className="text-sm text-gray-900">{customer.city || "-"}</div>
                    <div className="text-sm text-gray-500">{customer.country || "-"}</div>
                  </div>
                )
              },
              {
                key: 'orders',
                label: 'Comenzi',
                render: (customer) => (
                  <Badge variant="primary" size="sm">
                    {customer._count?.orders || 0} comenzi
                  </Badge>
                )
              },
              {
                key: 'createdAt',
                label: 'Data creării',
                sortable: true,
                render: (customer) => (
                  <span className="text-sm text-gray-500">{formatDate(customer.createdAt)}</span>
                )
              },
              {
                key: 'actions',
                label: 'Acțiuni',
                align: 'right',
                render: (customer) => (
                  <div className="flex gap-2 justify-end">
                    <Button
                      onClick={() => router.push(`/admin/customers/${customer.id}`)}
                      variant="ghost"
                      size="sm"
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View
                    </Button>
                    <Button
                      onClick={() => handleEdit(customer)}
                      variant="ghost"
                      size="sm"
                      className="text-gray-600 hover:text-gray-900"
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDelete(customer)}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </Button>
                  </div>
                )
              }
            ]}
            data={customers}
            rowKey="id"
            loading={loading}
            emptyMessage="Nu există clienți"
            striped={true}
            responsive={true}
            rowClassName={(customer) => "hover:bg-gray-50 transition-colors"}
          />
        </Card>
      )}

      {/* Mobile Card View */}
      {!loading && customers.length > 0 && (
        <div className="lg:hidden space-y-4">
          {customers.map((customer) => (
            <Card
              key={customer.id}
              hover
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 font-medium">
                      {customer.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">
                      {customer.name}
                    </div>
                    {customer.company && (
                      <div className="text-xs text-gray-500">{customer.company}</div>
                    )}
                  </div>
                </div>
                <Badge variant="primary" size="sm">
                  {customer._count?.orders || 0}
                </Badge>
              </div>

              <div className="space-y-2 text-sm mb-4">
                {customer.email && (
                  <div className="flex items-center text-gray-600">
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {customer.email}
                  </div>
                )}
                {customer.phone && (
                  <div className="flex items-center text-gray-600">
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {customer.phone}
                  </div>
                )}
                {(customer.city || customer.country) && (
                  <div className="flex items-center text-gray-600">
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {[customer.city, customer.country].filter(Boolean).join(", ")}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => router.push(`/admin/customers/${customer.id}`)}
                  variant="primary"
                  size="sm"
                  fullWidth
                >
                  View
                </Button>
                <Button
                  onClick={() => handleEdit(customer)}
                  variant="outline"
                  size="sm"
                >
                  Edit
                </Button>
                <Button
                  onClick={() => handleDelete(customer)}
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700 border-red-300 hover:bg-red-50"
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="mt-6 flex items-center justify-between bg-white px-4 py-3 rounded-lg shadow-sm">
          <div className="flex-1 flex justify-between sm:hidden">
            <Button
              onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
              variant="outline"
              size="sm"
            >
              Anterior
            </Button>
            <Button
              onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page === pagination.pages}
              variant="outline"
              size="sm"
            >
              Următor
            </Button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Arată <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> până la{" "}
                <span className="font-medium">
                  {Math.min(pagination.page * pagination.limit, pagination.total)}
                </span>{" "}
                din <span className="font-medium">{pagination.total}</span> rezultate
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
                variant="outline"
                size="sm"
              >
                Anterior
              </Button>
              <span className="px-4 py-2 text-sm text-gray-700">
                Pagina {pagination.page} din {pagination.pages}
              </span>
              <Button
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page === pagination.pages}
                variant="outline"
                size="sm"
              >
                Următor
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Modal */}
      <CustomerModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCustomer(null);
        }}
        onSuccess={loadCustomers}
        customer={editingCustomer}
      />
      <Dialog />
    </div>
  );
}
