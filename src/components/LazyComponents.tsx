/**
 * Lazy loaded components pentru optimizarea performanței
 * Folosește dynamic imports cu loading states
 */

import dynamic from 'next/dynamic';
import { LoadingState, SkeletonCard, SkeletonList, SkeletonTable } from '@/components/ui/LoadingState';

// Editor components - foarte mari, lazy load obligatoriu
export const EditorCanvas = dynamic(
  () => import('@/components/public/editor/EditorCanvas'),
  {
    loading: () => <LoadingState size="lg" text="Se încarcă canvas-ul..." />,
    ssr: false, // Editor rulează doar client-side
  }
);

export const EditorTopbar = dynamic(
  () => import('@/components/public/editor/EditorTopbar'),
  {
    loading: () => <div className="h-16 bg-gray-100 animate-pulse" />,
    ssr: false,
  }
);

export const LayersPanel = dynamic(
  () => import('@/components/public/editor/layers/LayersPanel'),
  {
    loading: () => <div className="h-full bg-gray-50 animate-pulse" />,
    ssr: false,
  }
);

export const PropertiesPanel = dynamic(
  () => import('@/components/public/editor/properties/PropertiesPanel'),
  {
    loading: () => <div className="h-full bg-gray-50 animate-pulse" />,
    ssr: false,
  }
);

export const ExportPanel = dynamic(
  () => import('@/components/public/editor/export/ExportPanel'),
  {
    loading: () => <LoadingState size="md" text="Se pregătește exportul..." />,
    ssr: false,
  }
);

export const TemplateLibrary = dynamic(
  () => import('@/components/public/editor/templates/TemplateLibrary'),
  {
    loading: () => (
      <div className="grid grid-cols-2 gap-4 p-4">
        {[...Array(6)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    ),
    ssr: false,
  }
);

// Charts - lazy load pentru dashboard
export const LineChart = dynamic(() => import('@/components/charts/LineChart'), {
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-lg" />,
  ssr: false,
});

export const BarChart = dynamic(() => import('@/components/charts/BarChart'), {
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-lg" />,
  ssr: false,
});

export const PieChart = dynamic(() => import('@/components/charts/PieChart'), {
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-lg" />,
  ssr: false,
});

export const DonutChart = dynamic(() => import('@/components/charts/DonutChart'), {
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-lg" />,
  ssr: false,
});

// Admin components
export const OrdersList = dynamic(
  () => import('@/app/admin/orders/OrdersList'),
  {
    loading: () => <SkeletonTable rows={10} />,
  }
);

export const OrderDetails = dynamic(
  () => import('@/app/admin/orders/OrderDetails'),
  {
    loading: () => <LoadingState size="md" text="Se încarcă detaliile comenzii..." />,
  }
);

export const MaterialsTable = dynamic(
  () => import('@/app/admin/materials/_components/MaterialCard'),
  {
    loading: () => <SkeletonList items={5} />,
  }
);

export const ProductionJobsList = dynamic(
  () => import('@/app/admin/production/page').then((mod) => ({ default: mod.default })),
  {
    loading: () => <SkeletonTable rows={8} />,
  }
);

// Dashboard user components
export const ProjectsList = dynamic(
  () => import('@/components/account/projects/ProjectsList'),
  {
    loading: () => (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    ),
  }
);

export const OrdersHistory = dynamic(
  () => import('@/components/account/orders/OrdersList'),
  {
    loading: () => <SkeletonList items={5} />,
  }
);

export const SavedFilesDashboard = dynamic(
  () => import('@/components/account/files/SavedFilesDashboard'),
  {
    loading: () => (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    ),
  }
);

export const NotificationsList = dynamic(
  () => import('@/components/account/notifications/NotificationsList'),
  {
    loading: () => <SkeletonList items={10} />,
  }
);

// Configurator steps - încărcare progresivă
export const Step1Specifications = dynamic(
  () => import('@/components/public/configurator/Step1Specifications'),
  {
    loading: () => <LoadingState size="md" text="Se încarcă specificațiile..." />,
  }
);

export const Step2UploadDesign = dynamic(
  () => import('@/components/public/configurator/Step2UploadDesign'),
  {
    loading: () => <LoadingState size="md" text="Se pregătește încărcarea..." />,
  }
);

export const Step3Upsell = dynamic(
  () => import('@/components/public/configurator/Step3Upsell'),
  {
    loading: () => <LoadingState size="md" text="Se încarcă opțiuni..." />,
  }
);

export const Step4Summary = dynamic(
  () => import('@/components/public/configurator/Step4Summary'),
  {
    loading: () => <LoadingState size="md" text="Se generează sumarul..." />,
  }
);

// Catalog
export const ProductGrid = dynamic(
  () => import('@/components/public/catalog/ProductGrid'),
  {
    loading: () => (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(12)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    ),
  }
);

export const ProductQuickView = dynamic(
  () => import('@/components/public/catalog/ProductQuickView'),
  {
    loading: () => <LoadingState size="md" text="Se încarcă produsul..." />,
    ssr: false,
  }
);

// Checkout
export const CheckoutForm = dynamic(
  () => import('@/components/public/checkout/CheckoutCustomerForm'),
  {
    loading: () => <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
      ))}
    </div>,
  }
);

export const CheckoutPaymentMethods = dynamic(
  () => import('@/components/public/checkout/CheckoutPaymentMethods'),
  {
    loading: () => <LoadingState size="md" text="Se încarcă metodele de plată..." />,
  }
);
