import React from 'react';
import { Product } from '../../store/services/productService';

interface ProductGridProps {
  products: Product[];
  onProductSelect: (product: Product) => void;
}

const ProductGrid = ({ products, onProductSelect }: ProductGridProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto pb-4">
      {products?.map((product) => (
        <button
          key={product._id}
          onClick={() => onProductSelect(product)}
          className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow text-left"
        >
          {product.image && (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-32 object-cover rounded-lg mb-2"
            />
          )}
          <h3 className="font-medium">{product.name}</h3>
          <p className="text-sm text-gray-500">${product.price.toFixed(2)}</p>
        </button>
      ))}
    </div>
  );
};

export default ProductGrid;