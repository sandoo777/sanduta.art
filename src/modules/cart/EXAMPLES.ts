/**
 * Example: How to add a product to cart
 * This is a practical example for integration with configurator step 4
 */

// USAGE EXAMPLES FOR CART INTEGRATION
// This file shows examples of how to use the cart store

/*
  USAGE EXAMPLE - Add to Cart with Full Breakdown

  const cartItem: Omit<CartItem, 'id' | 'addedAt'> = {
    productId: 'prod-carti-personalizate',
    productSlug: 'carti-personalizate',
    name: 'Cărți personalizate A5',
    previewUrl: 'https://cdn.example.com/preview-a5-170g.jpg',
    fileUrl: 'https://storage.example.com/design-files/user-123.pdf',
    specifications: {
      dimensions: {
        width: 148,
        height: 210,
      },
      material: {
        id: 'mat-170g',
        name: '170g Coated Paper',
      },
      finishes: [
        {
          id: 'finish-glossy',
          name: 'Glossy',
          type: 'coating',
        },
      ],
      quantity: 500,
      productionTime: '5-7 zile lucratoare',
    },
    upsells: [
      {
        id: 'upsell-box',
        name: 'Cutie ambalare premium',
        price: 150,
      },
    ],
    priceBreakdown: {
      basePrice: 1000,
      materialCost: 200,
      finishingCost: 150,
      upsellsCost: 450,
      quantityDiscount: 150,
      subtotal: 1650,
    },
    totalPrice: 1650,
  };

  // Usage in component:
  const { addItem } = useCartStore();
  const newItemId = addItem(cartItem);
*/

// IMPORTANT NOTES:
/*
  1. CartItem ID is auto-generated:
     - Format: cart-item-{timestamp}-{random}
     - Example: cart-item-1704355200000-abc1d2e3

  2. Prices are in RON (Romanian currency)
     - No decimals in final display
     - Breakdown includes all costs

  3. Specifications are flexible:
     - Can add custom fields as needed
     - depth is optional for 2D products
     - finishes array can be empty

  4. Edit mode:
     - URL param: ?editItemId={itemId}
     - Check searchParams to detect edit mode
     - Use updateItem() instead of addItem()

  5. Persistence:
     - Auto-saved to localStorage
     - Storage key: "sanduta-cart-storage"
     - Survives page refresh

  6. Performance:
     - Store is optimized with Zustand
     - No unnecessary re-renders
     - Persist middleware handles storage

  INTEGRATION EXAMPLES:
  ====================

  // In Step 4 (Configurator final step):
  import { useCartStore } from '@/modules/cart/cartStore';

  const { addItem } = useCartStore();

  const handleAddToCart = () => {
    const itemId = addItem({...cartItem});
    router.push('/cart');
  };

  // Get item details:
  const { getItem } = useCartStore();
  const item = getItem('cart-item-123');

  // Update item (for edit mode):
  const { updateItem } = useCartStore();
  updateItem('cart-item-123', {
    specifications: { ...newSpecs }
  });

  // Get cart totals:
  const { getTotals } = useCartStore();
  const { subtotal, vat, total, itemCount } = getTotals();
*/

