import React, { useState } from 'react';
import { useCart } from '../../hooks/useCart';
import Button from '../common/Button';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const [adding, setAdding] = useState(false);

  const handleAddToCart = async () => {
    setAdding(true);
    await addToCart(product);
    setTimeout(() => setAdding(false), 500);
  };

  const isAvailable = product.availableForSale === true; //&& product.stock > 0;

  return (
    <div className="group cursor-pointer">
      <div className="relative overflow-hidden mb-4 aspect-[3/4] bg-gray-800">
        <img
          src={product.images?.edges?.[0]?.node?.url || '/placeholder.jpg'}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {isAvailable && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
            <span className="text-2xl font-black tracking-wider">
              {product.status === 'sold out' ? 'SOLD OUT' : 'COMING SOON'}
            </span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <h3 className="text-xl font-black group-hover:text-gray-400 transition-colors">
          {product.title}
        </h3>
        {product.subtitle && (
          <p className="text-gray-400">{product.subtitle}</p>
        )}
        {product.description && (
          <p className="text-sm text-gray-500 line-clamp-2">
            {product.description}
          </p>
        )}
        
        <div className="flex items-center justify-between pt-2">
          <p className="text-xl font-bold">£{product.variants?.edges?.[0]?.node?.price?.amount}</p>
          {!isAvailable && (
            <Button
              onClick={handleAddToCart}
              loading={adding}
              size="sm"
            >
              {adding ? 'ADDING...' : 'ADD TO CART'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;