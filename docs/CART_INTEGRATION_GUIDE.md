#!/bin/bash

# Integration Guide for Cart System
# This shows how to integrate the cart system into existing components

cat << 'EOF'
╔════════════════════════════════════════════════════════════════════════════╗
║         🛒 CART SYSTEM - INTEGRATION GUIDE                                ║
╚════════════════════════════════════════════════════════════════════════════╝

## 1. ADĂUGARE ÎN COȘ DIN CONFIGURATOR (Step 4)

Locație: src/app/(public)/produse/[slug]/configure/step-4/page.tsx

Exemplu:

    import { useCartStore } from '@/modules/cart/cartStore';
    import { useCartActions } from '@/modules/cart/useCartActions';
    import { useRouter, useSearchParams } from 'next/navigation';

    export default function Step4Page() {
      const router = useRouter();
      const searchParams = useSearchParams();
      const editItemId = searchParams?.get('editItemId');
      const { addToCart } = useCartActions();

      const handleAddToCart = () => {
        const item = {
          productId: 'product-123',
          productSlug: 'carti-personalizate',
          name: 'Cărți personalizate A5',
          previewUrl: '/preview.png',
          fileUrl: '/design.pdf',
          specifications: {
            dimensions: { width: 148, height: 210 },
            material: { id: 'mat-170g', name: '170g' },
            finishes: [{ id: 'finish-1', name: 'Luciu', type: 'glossy' }],
            quantity: 500,
            productionTime: '5-7 zile lucratoare'
          },
          upsells: [
            { id: 'upsell-1', name: 'Cutie ambalare', price: 100 }
          ],
          priceBreakdown: {
            basePrice: 1000,
            materialCost: 200,
            finishingCost: 150,
            upsellsCost: 100,
            quantityDiscount: 0,
            subtotal: 1450
          },
          totalPrice: 1450
        };

        addToCart(item, {
          editItemId,
          redirectToCart: true
        });
      };

      return (
        <button
          onClick={handleAddToCart}
          className="bg-[#0066FF] text-white px-6 py-3 rounded-lg"
        >
          Adaugă în coș
        </button>
      );
    }

## 2. ACCESARE DATELOR COȘULUI ÎN ALTE COMPONENTE

Exemplu:

    import { useCartStore } from '@/modules/cart/cartStore';

    export function MyComponent() {
      const { items, getTotals } = useCartStore();
      const totals = getTotals();

      return (
        <div>
          <p>Total produse: {totals.itemCount}</p>
          <p>Subtotal: {totals.subtotal} RON</p>
          <p>Total: {totals.total} RON</p>
        </div>
      );
    }

## 3. ACTUALIZARE PRODUS DIN COȘ

Locație: src/app/(public)/produse/[slug]/configure/page.tsx

Exemplu:

    'use client';
    import { useCartStore } from '@/modules/cart/cartStore';
    import { useSearchParams } from 'next/navigation';

    export default function ConfigurePage() {
      const { getItem, updateItem } = useCartStore();
      const searchParams = useSearchParams();
      const editItemId = searchParams?.get('editItemId');

      // La finalizare:
      const handleFinalize = () => {
        if (editItemId) {
          const existingItem = getItem(editItemId);
          if (existingItem) {
            updateItem(editItemId, {
              // Actualizează doar câmpurile care s-au schimbat
              specifications: {
                ...existingItem.specifications,
                quantity: newQuantity
              }
            });
          }
        }
      };
    }

## 4. ȘTERGERE PRODUS DIN COȘ

Exemplu:

    import { useCartStore } from '@/modules/cart/cartStore';

    export function CartItem({ itemId }) {
      const { removeItem } = useCartStore();

      const handleDelete = () => {
        if (confirm('Sigur vrei să ștergi?')) {
          removeItem(itemId);
        }
      };

      return <button onClick={handleDelete}>Șterge</button>;
    }

## 5. DUPLICARE PRODUS

Exemplu:

    import { useCartStore } from '@/modules/cart/cartStore';

    export function CartItem({ itemId }) {
      const { duplicateItem } = useCartStore();

      const handleDuplicate = () => {
        const newItemId = duplicateItem(itemId);
        console.log('Copie creata:', newItemId);
      };

      return <button onClick={handleDuplicate}>Duplică</button>;
    }

## 6. GOLIRE COȘUL

Exemplu:

    import { useCartStore } from '@/modules/cart/cartStore';

    export function CheckoutPage() {
      const { clearCart } = useCartStore();

      const handleOrderComplete = async () => {
        // După finalizarea plății
        clearCart();
      };
    }

## 7. EDITARE ITEM - FLUXUL COMPLET

1. User vizitează /cart
2. Apasă "Editează configurarea" pe un produs
3. Se redirecționează către:
   /produse/carti-personalizate/configure?editItemId=cart-item-123456

4. Configuratorul detectează editItemId și:
   - Preîncarcă datele item-ului existent
   - Afișează "Modul editare" banner
   - Permite modificări

5. La finalizare, in loc de addItem():
   - Apelează updateItem(editItemId, newData)
   - Se redirecționează la /cart
   - Produsul se actualizează în coș

## 8. CALCUL PREȚURI

Utilizează calculatorul de prețuri din configurator:

    import { usePriceCalculator } from '@/modules/configurator/usePriceCalculator';

    export function MyComponent() {
      const calculator = usePriceCalculator();

      const selection = {
        dimension: 'A5',
        material: '170g',
        finishes: ['glossy'],
        quantity: 500,
        productionSpeed: 'standard'
      };

      const priceResult = calculator.calcTotal(selection);
      // {
      //   basePrice: 1000,
      //   total: 1450,
      //   breakdown: { ... }
      // }
    }

## 9. HEADER - INDICATOR COȘULUI

Header-ul public (src/components/public/Header.tsx) include:

    import { useCartStore } from '@/modules/cart/cartStore';

    export function Header() {
      const { getTotals } = useCartStore();
      const { itemCount } = getTotals();

      return (
        <Link href="/cart">
          <ShoppingCart />
          {itemCount > 0 && <Badge>{itemCount}</Badge>}
        </Link>
      );
    }

## 10. PERSISTENȚĂ

Datele coșului sunt salvate automat în localStorage.

Pentru a reseta (dev):

    localStorage.removeItem('sanduta-cart-storage');

Pentru a testa:

    const stored = localStorage.getItem('sanduta-cart-storage');
    console.log(JSON.parse(stored));

═════════════════════════════════════════════════════════════════════════════

ENDPOINT-URI VIITOARE (pentru checkout):

- POST /api/orders/create
- GET /api/orders/[id]
- POST /api/payments/process
- GET /api/cart/validate

═════════════════════════════════════════════════════════════════════════════

EOF
