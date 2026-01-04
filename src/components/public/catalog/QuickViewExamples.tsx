// 🔍 Quick View Demo - Exemple de utilizare

import { useState } from 'react';
import { ProductQuickView } from '@/components/public/catalog/ProductQuickView';
import { Modal } from '@/components/ui/Modal';

// ============================================
// EXEMPLU 1: Quick View pentru Flyere
// ============================================
export function FlyereQuickViewExample() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>
        Vezi Quick View - Flyere
      </button>

      <ProductQuickView
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        product={{
          id: 1,
          name: 'Flyere A5',
          slug: 'flyere-a5',
          description:
            'Flyere profesionale de calitate premium. Perfecte pentru evenimente, promoții și marketing. Imprimare color pe ambele fețe.',
          imageUrl: '/images/products/flyere.jpg',
          basePrice: 250,
          badges: ['bestseller', 'promo'],
          discount: 15,
          specifications: {
            sizes: ['A5 (148x210mm)', 'A4 (210x297mm)', 'A6 (105x148mm)'],
            materials: ['Hârtie 150g/m²', 'Hârtie 200g/m²', 'Hârtie 300g/m²'],
            finishes: ['Mat', 'Lucios', 'UV Spot'],
            productionTime: '2-3 zile lucrătoare',
          },
        }}
      />
    </>
  );
}

// ============================================
// EXEMPLU 2: Quick View pentru Cărți de vizită
// ============================================
export function CartiVizitaQuickViewExample() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>
        Vezi Quick View - Cărți de vizită
      </button>

      <ProductQuickView
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        product={{
          id: 2,
          name: 'Cărți de vizită Premium',
          slug: 'carti-vizita-premium',
          description:
            'Cărți de vizită premium cu finisaje speciale. Impresionează-ți clienții cu un design elegant și calitate superioară.',
          imageUrl: '/images/products/carti-vizita.jpg',
          basePrice: 180,
          badges: ['eco'],
          specifications: {
            sizes: ['Standard (90x50mm)', 'European (85x55mm)'],
            materials: ['Carton 350g/m²', 'Carton 400g/m²', 'Plastic PVC'],
            finishes: ['Mat', 'Lucios', 'Soft Touch', 'Gold Foil'],
            productionTime: '1-2 zile lucrătoare',
          },
        }}
      />
    </>
  );
}

// ============================================
// EXEMPLU 3: Quick View fără discount
// ============================================
export function ProdusStandardExample() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>
        Vezi Quick View - Produs Standard
      </button>

      <ProductQuickView
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        product={{
          id: 3,
          name: 'Postere A2',
          slug: 'postere-a2',
          description:
            'Postere mari pentru reclamă și decorare. Calitate foto garantată.',
          imageUrl: '/images/products/postere.jpg',
          basePrice: 450,
          specifications: {
            sizes: ['A2 (420x594mm)', 'A1 (594x841mm)', 'A0 (841x1189mm)'],
            materials: ['Hârtie photo 180g/m²', 'Canvas', 'Vinil'],
            finishes: ['Mat', 'Lucios'],
            productionTime: '3-5 zile lucrătoare',
          },
        }}
      />
    </>
  );
}

// ============================================
// EXEMPLU 4: Modal Generic Custom
// ============================================
export function CustomModalExample() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>
        Deschide Modal Custom
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        size="md"
        closeOnOverlay={true}
        showCloseButton={true}
      >
        <div className="p-8">
          <h2 className="text-2xl font-bold mb-4">Modal Custom</h2>
          <p className="text-gray-600 mb-6">
            Poți folosi componenta Modal pentru orice tip de conținut!
          </p>
          <button
            onClick={() => setIsOpen(false)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg"
          >
            Închide
          </button>
        </div>
      </Modal>
    </>
  );
}

// ============================================
// EXEMPLU 5: Quick View dinamic din API
// ============================================
export function DynamicQuickViewExample() {
  const [isOpen, setIsOpen] = useState(false);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleOpenQuickView = async (productId: number) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/products/${productId}`);
      const data = await response.json();
      setProduct(data);
      setIsOpen(true);
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => handleOpenQuickView(1)}
        disabled={loading}
      >
        {loading ? 'Se încarcă...' : 'Vezi Produs'}
      </button>

      {product && (
        <ProductQuickView
          isOpen={isOpen}
          onClose={() => {
            setIsOpen(false);
            setProduct(null);
          }}
          product={product}
        />
      )}
    </>
  );
}

// ============================================
// EXEMPLU 6: Multiple Modal Sizes
// ============================================
export function ModalSizesExample() {
  const [size, setSize] = useState<'sm' | 'md' | 'lg' | 'xl' | 'full'>('md');
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {(['sm', 'md', 'lg', 'xl', 'full'] as const).map((s) => (
          <button
            key={s}
            onClick={() => {
              setSize(s);
              setIsOpen(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            {s.toUpperCase()}
          </button>
        ))}
      </div>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} size={size}>
        <div className="p-8">
          <h2 className="text-2xl font-bold mb-4">Modal Size: {size}</h2>
          <p className="text-gray-600">
            Acest modal folosește size="{size}"
          </p>
        </div>
      </Modal>
    </div>
  );
}

// ============================================
// TIPS & BEST PRACTICES
// ============================================

/*
 * 💡 TIP 1: Focus Trap
 * Modalul folosește focus trap automat.
 * Utilizatorii nu pot face Tab în afara modalului.
 *
 * 💡 TIP 2: ESC Key
 * Apăsarea tastei ESC va închide modalul automat.
 *
 * 💡 TIP 3: Body Scroll Lock
 * Când modalul este deschis, scroll-ul body este blocat.
 * Scroll-ul revine automat la închidere.
 *
 * 💡 TIP 4: Performance
 * Modalul folosește AnimatePresence pentru unmount smooth.
 * Conținutul este renderizat doar când isOpen=true.
 *
 * 💡 TIP 5: Accessibility
 * Modalul respectă toate standardele ARIA:
 * - role="dialog"
 * - aria-modal="true"
 * - aria-label pentru close button
 *
 * 💡 TIP 6: Mobile Responsive
 * Pe mobile, modalul devine aproape full-screen.
 * Layout-ul se adaptează automat (grid → stack).
 */
