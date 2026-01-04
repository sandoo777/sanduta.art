import { useCallback } from 'react';
import { useCartStore, type CartItem } from '@/modules/cart/cartStore';
import { useRouter } from 'next/navigation';

export function useCartActions() {
  const { addItem, updateItem } = useCartStore();
  const router = useRouter();

  const addToCart = useCallback(
    (
      item: Omit<CartItem, 'id' | 'addedAt'>,
      options?: {
        editItemId?: string;
        redirectToCart?: boolean;
      }
    ) => {
      const editItemId = options?.editItemId || sessionStorage.getItem('editItemId');

      if (editItemId) {
        // Update existing item
        updateItem(editItemId, item);
        sessionStorage.removeItem('editItemId');
        
        if (options?.redirectToCart !== false) {
          router.push('/cart');
        }
        
        return editItemId;
      } else {
        // Add new item
        const newItemId = addItem(item);
        
        if (options?.redirectToCart !== false) {
          router.push('/cart');
        }
        
        return newItemId;
      }
    },
    [addItem, updateItem, router]
  );

  const isEditMode = useCallback(() => {
    return !!sessionStorage.getItem('editItemId');
  }, []);

  return {
    addToCart,
    isEditMode,
  };
}
