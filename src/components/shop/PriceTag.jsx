import React from 'react';

// Formats a number as a clean GBP string: whole numbers show as "£20",
// anything with pence shows two decimals ("£39.99").
const formatPrice = (value) => {
  const num = Number(value) || 0;
  return Number.isInteger(num) ? `£${num}` : `£${num.toFixed(2)}`;
};

/**
 * Price display with optional sale treatment.
 *
 * When `originalPrice` is set and higher than `price`, the original is shown
 * struck through next to the current price, with a badge that reads "HALF PRICE"
 * for a ~50% cut (otherwise "N% OFF"). `className` styles the current price, so
 * callers keep their existing size/weight.
 */
const PriceTag = ({ price = 0, originalPrice, className = '' }) => {
  const current = Number(price) || 0;
  const was = Number(originalPrice) || 0;
  const hasSale = was > current;

  if (!hasSale) {
    return <span className={className}>{formatPrice(current)}</span>;
  }

  const discount = Math.round((1 - current / was) * 100);
  const label = discount >= 48 && discount <= 52 ? 'HALF PRICE' : `${discount}% OFF`;

  return (
    <span className={`inline-flex items-center gap-2 flex-wrap ${className}`}>
      <span>{formatPrice(current)}</span>
      <span className="text-gray-500 line-through font-normal text-[0.7em]">
        {formatPrice(was)}
      </span>
      <span
        className="text-[10px] leading-none font-bold tracking-wider uppercase bg-red-600 text-white px-2 py-1 rounded-sm"
        // Some callers (e.g. the home "price-tag" gradient) set
        // -webkit-text-fill-color: transparent on ancestors, which would blank
        // this label to an empty red box — force it back to white here.
        style={{ WebkitTextFillColor: '#fff' }}
      >
        {label}
      </span>
    </span>
  );
};

export default PriceTag;
