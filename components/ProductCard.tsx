
import React from 'react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onOrder: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onOrder }) => {
  return (
    <div className="bg-white rounded-[1.5rem] overflow-hidden shadow-sm border border-emerald-50 active:scale-95 transition-all">
      <div className="relative h-32 overflow-hidden">
        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
        <div className="absolute top-2 right-2 bg-white/90 px-2 py-0.5 rounded-lg text-[10px] font-bold text-emerald-800">
          ₹{product.price}
        </div>
      </div>
      <div className="p-3">
        <h3 className="text-xs font-bold text-slate-800 truncate mb-1">{product.name}</h3>
        <p className="text-[10px] text-slate-400 mb-3 truncate">{product.category}</p>
        <button
          onClick={() => onOrder(product)}
          className="w-full py-2 bg-emerald-600 text-white rounded-xl text-[10px] font-bold shadow-md shadow-emerald-200"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
};
