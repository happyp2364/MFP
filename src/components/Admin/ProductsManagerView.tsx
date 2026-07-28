import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product } from '../../types';
import { SmartProductFormModal } from './SmartProductFormModal';
import { Plus, Edit2, Trash2, Eye, EyeOff, Search, Copy } from 'lucide-react';

export const ProductsManagerView: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct, toggleInStock } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleDuplicate = async (p: Product) => {
    const { id, ...rest } = p;
    const duplicate = {
      ...rest,
      name: `${p.name} (Copy)`
    };
    await addProduct(duplicate as any);
  };

  const handleEdit = (p: Product) => {
    setEditingProduct(p);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingProduct(undefined);
    setIsModalOpen(true);
  };

  const handleSave = async (p: Partial<Product>) => {
    if (editingProduct) {
      await updateProduct(editingProduct.id, p);
    } else {
      await addProduct(p as any);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold font-serif-heading">Products Management</h2>
        <button onClick={handleAddNew} className="flex items-center gap-2 bg-[#0B8F63] hover:bg-[#097350] text-white px-4 py-2 rounded-xl text-sm font-bold transition-all">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>
      
      <div className="mb-6 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search products by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-[#0B8F63] focus:border-[#0B8F63] sm:text-sm"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProducts.map((product) => (
              <tr key={product.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <img className="h-10 w-10 rounded-full object-cover" src={product.images[0] || 'https://via.placeholder.com/150'} alt="" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      <div className="text-sm text-gray-500">{product.brand} • {product.category}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">₹{product.price}</div>
                  {product.originalPrice && (
                    <div className="text-sm text-gray-500 line-through">₹{product.originalPrice}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button 
                    onClick={() => toggleInStock(product.id)}
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {product.inStock ? 'In Stock' : 'Out of Stock'}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end items-center gap-3">
                    <button onClick={() => handleDuplicate(product)} className="text-blue-600 hover:text-blue-900" title="Duplicate">
                      <Copy className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleEdit(product)} className="text-indigo-600 hover:text-indigo-900">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => deleteProduct(product.id)} className="text-red-600 hover:text-red-900">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredProducts.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <SmartProductFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          initialData={editingProduct}
        />
      )}
    </div>
  );
};
