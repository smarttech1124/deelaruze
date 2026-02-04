import React from 'react';
import { X, Minus, Plus } from 'lucide-react';
import { useCart } from '../../hooks/useCart';

const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= item.stock) {
      updateQuantity(item._id, newQuantity);
    }
  };

  return (
    <div className="flex gap-4 p-4 bg-gray-900 border border-gray-800">
      <div className="w-24 h-32 flex-shrink-0 bg-gray-800">
        <img
          src={item.images?.[0]?.url || '/placeholder.jpg'}
          alt={item.title}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-bold text-lg">{item.title}</h3>
              {item.subtitle && (
                <p className="text-sm text-gray-400">{item.subtitle}</p>
              )}
            </div>
            <button
              onClick={() => removeFromCart(item._id)}
              className="hover:text-red-600 transition-colors"
              aria-label="Remove item"
            >
              <X size={20} />
            </button>
          </div>
          <p className="text-lg font-bold">${item.price}</p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 bg-black border border-gray-700">
            <button
              onClick={() => handleQuantityChange(item.quantity - 1)}
              className="px-3 py-2 hover:bg-gray-800 transition-colors"
              disabled={item.quantity <= 1}
            >
              <Minus size={16} />
            </button>
            <span className="px-4 font-bold">{item.quantity}</span>
            <button
              onClick={() => handleQuantityChange(item.quantity + 1)}
              className="px-3 py-2 hover:bg-gray-800 transition-colors"
              disabled={item.quantity >= item.stock}
            >
              <Plus size={16} />
            </button>
          </div>
          <p className="text-xl font-black">
            ${(item.price * item.quantity).toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CartItem;