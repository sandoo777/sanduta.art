"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Edit } from "lucide-react";
import { Button, LoadingState, Card, EmptyState, ErrorState } from '@/components/ui';
import { useRouter } from "next/navigation";
import { useCustomers, type Customer } from "@/modules/customers/useCustomers";
import CustomerModal from "../_components/CustomerModal";
import CustomerNotes from "../_components/CustomerNotes";
import CustomerTags from "../_components/CustomerTags";
import CustomerTimeline from "../_components/CustomerTimeline";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function CustomerDetailsPage({ params }: PageProps) {
  const router = useRouter();
  const { getCustomer, loading } = useCustomers();
  
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "orders" | "notes" | "tags" | "timeline">("overview");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load params and customer
  useEffect(() => {
    params.then((p) => {
      const id = parseInt(p.id);
      setCustomerId(id);
      loadCustomer(id);
    });
  }, []);

  const loadCustomer = async (id: number) => {
    try {
      setError(null);
      const data = await getCustomer(id);
      setCustomer(data);
    } catch (err) {
      console.error("Error loading customer:", err);
      setError(err instanceof Error ? err.message : 'Eroare la încărcarea clientului');
    }
  };

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("ro-RO", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ro-RO", {
      style: "currency",
      currency: "RON",
    }).format(amount);
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: "bg-yellow-100 text-yellow-800",
      PROCESSING: "bg-blue-100 text-blue-800",
      COMPLETED: "bg-green-100 text-green-800",
      CANCELLED: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return <LoadingState text="Se încarcă detaliile clientului..." />;
  }

  if (error) {
    return (
      <ErrorState
        message={error}
        retry={() => customerId && loadCustomer(customerId)}
      />
    );
  }

  if (!customer) {
    return <LoadingState text="Se încarcă detaliile clientului..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <Button
          onClick={() => router.push("/admin/customers")}
          variant="ghost"
          size="sm"
          className="mb-4"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Înapoi la clienți
        </Button>

        <Card>
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            {/* Customer Info */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 font-bold text-2xl">
                  {customer.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {customer.name}
                </h1>
                <div className="space-y-1 text-sm text-gray-600">
                  {customer.email && (
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {customer.email}
                    </div>
                  )}
                  {customer.phone && (
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {customer.phone}
                    </div>
                  )}
                  {customer.company && (
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      {customer.company}
                    </div>
                  )}
                  {(customer.address || customer.city || customer.country) && (
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {[customer.address, customer.city, customer.country].filter(Boolean).join(", ")}
                    </div>
                  )}
                </div>

                {/* Tags */}
                {customer.tags && customer.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {customer.tags.map((tag) => (
                      <span
                        key={tag.id}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: tag.color }}
                      >
                        {tag.label}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Edit Button */}
            <Button
              onClick={() => setIsEditModalOpen(true)}
              variant="primary"
            >
              <Edit className="w-5 h-5" />
              Edit Customer
            </Button>
          </div>
        </Card>
      </div>

      {/* Stats Cards */}
      {customer.statistics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <div className="flex items-center">
              <div className="flex-shrink-0 h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Comenzi</p>
                <p className="text-2xl font-bold text-gray-900">{customer.statistics.totalOrders}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center">
              <div className="flex-shrink-0 h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Cheltuit</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(customer.statistics.totalSpent)}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center">
              <div className="flex-shrink-0 h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Ultima Comandă</p>
                <p className="text-lg font-bold text-gray-900">{formatDate(customer.statistics.lastOrderDate)}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Card className="p-0 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex overflow-x-auto">
            {[
              { id: "overview", label: "Overview", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
              { id: "orders", label: "Orders", icon: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" },
              { id: "notes", label: "Notes", icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" },
              { id: "tags", label: "Tags", icon: "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" },
              { id: "timeline", label: "Timeline", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
                }`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                </svg>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Informații Client</h3>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Nume</dt>
                      <dd className="text-sm text-gray-900">{customer.name}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Email</dt>
                      <dd className="text-sm text-gray-900">{customer.email || "N/A"}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Telefon</dt>
                      <dd className="text-sm text-gray-900">{customer.phone || "N/A"}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Companie</dt>
                      <dd className="text-sm text-gray-900">{customer.company || "N/A"}</dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Adresă</h3>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Adresă</dt>
                      <dd className="text-sm text-gray-900">{customer.address || "N/A"}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Oraș</dt>
                      <dd className="text-sm text-gray-900">{customer.city || "N/A"}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Țară</dt>
                      <dd className="text-sm text-gray-900">{customer.country || "N/A"}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Data înregistrării</dt>
                      <dd className="text-sm text-gray-900">{formatDate(customer.createdAt)}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === "orders" && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Istoric Comenzi</h3>
              {customer.orders && customer.orders.length > 0 ? (
                <div className="space-y-4">
                  {customer.orders.map((order) => (
                    <div
                      key={order.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-gray-900">
                            Comanda #{order.id}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                        <span className="text-lg font-bold text-gray-900">
                          {formatCurrency(order.total)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>{formatDate(order.createdAt)}</span>
                        <button
                          onClick={() => router.push(`/admin/orders/${order.id}`)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View Order →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={
                    <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  }
                  title="Nu există comenzi"
                  description="Acest client nu are comenzi plasate încă"
                />
              )}
            </div>
          )}

          {/* Notes Tab */}
          {activeTab === "notes" && customerId && (
            <CustomerNotes
              customerId={customerId}
              notes={customer.notes || []}
              onUpdate={() => customerId && loadCustomer(customerId)}
            />
          )}

          {/* Tags Tab */}
          {activeTab === "tags" && customerId && (
            <CustomerTags
              customerId={customerId}
              tags={customer.tags || []}
              onUpdate={() => customerId && loadCustomer(customerId)}
            />
          )}

          {/* Timeline Tab */}
          {activeTab === "timeline" && (
            <CustomerTimeline customer={customer} />
          )}
        </div>
      </Card>

      {/* Edit Modal */}
      {customerId && (
        <CustomerModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={() => loadCustomer(customerId)}
          customer={customer}
        />
      )}
    </div>
  );
}
