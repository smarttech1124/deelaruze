import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import Button from '../common/Button';
import { truncateText } from '../../utils/helpers';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const [adding, setAdding] = useState(false);

  const handleAddToCart = async () => {
    setAdding(true);
    await addToCart(product);
    setTimeout(() => setAdding(false), 500);
  };

  const isAvailable = product.stock > 0 ; //&& product.stock > 0;

  return (
    <div className="group cursor-pointer">
      <div className="relative overflow-hidden mb-4 aspect-[4/4] bg-gray-800">
      <Link
          key={product._id}
          to={`/publication/${product._id}`}
          className=""
        >
          <img
            src={product.images[0]?.url || '/placeholder.jpg'}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </Link>
        {!isAvailable && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
            <span className="text-2xl font-black tracking-wider">
              {product.status === 0 && 'SOLD OUT'}
            </span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Link
          key={product._id}
          to={`/publication/${product._id}`}
          className=""
        >
          <h3 className="text-xl font-black group-hover:text-gray-400 transition-colors">
            {product.title}
          </h3>
        </Link>
        
        {product.tagline && (
          <p className="text-gray-400">{product.tagline}</p>
        )}
        {/* {product.description && (
          <div
            className="
              prose prose-sm sm:prose lg:prose-lg
              max-w-none
              text-gray-300
              break-words
            "
            dangerouslySetInnerHTML={{
              __html: truncateText(product.description, 120) ?? '',
            }}
          />
        )} */}
        
        <div className="flex items-center justify-between pt-2">
          <p className="text-xl font-bold">£{product.price}</p>
          {isAvailable && (
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