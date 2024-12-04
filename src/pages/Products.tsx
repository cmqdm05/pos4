import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Package, Plus, Edit2, Trash2, Tag, Settings } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useGetCategoriesQuery } from '../store/services/categoryService';
import { 
  useGetProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation
} from '../store/services/productService';

interface ProductForm {
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  image: string;
}

interface ModifierOption {
  name: string;
  price: number;
}

interface Modifier {
  name: string;
  options: ModifierOption[];
}

interface Discount {
  name: string;
  type: 'percentage' | 'fixed';
  value: number;
  startDate: string;
  endDate: string;
}

const Products = () => {
  const { storeId } = useParams<{ storeId: string }>();
  const { data: products, isLoading } = useGetProductsQuery(storeId!);
  const { data: categories } = useGetCategoriesQuery(storeId!);
  const [createProduct] = useCreateProductMutation();
  const [updateProduct] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [modifiers, setModifiers] = useState<Modifier[]>([]);
  const [discounts, setDiscounts] = useState<Discount[]>([]);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProductForm>();

  const onSubmit = async (data: ProductForm) => {
    try {
      const productData = {
        ...data,
        store: storeId,
        modifiers,
        discounts,
        price: Number(data.price),
        stock: Number(data.stock)
      };

      if (editingProduct) {
        await updateProduct({ _id: editingProduct._id, ...productData }).unwrap();
        toast.success('Product updated successfully');
      } else {
        await createProduct(productData).unwrap();
        toast.success('Product created successfully');
      }
      setIsModalOpen(false);
      reset();
      setEditingProduct(null);
      setModifiers([]);
      setDiscounts([]);
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const handleAddModifier = () => {
    setModifiers([...modifiers, { name: '', options: [{ name: '', price: 0 }] }]);
  };

  const handleAddModifierOption = (modifierIndex: number) => {
    const newModifiers = [...modifiers];
    newModifiers[modifierIndex].options.push({ name: '', price: 0 });
    setModifiers(newModifiers);
  };

  const handleModifierChange = (index: number, field: string, value: string) => {
    const newModifiers = [...modifiers];
    newModifiers[index] = { ...newModifiers[index], [field]: value };
    setModifiers(newModifiers);
  };

  const handleModifierOptionChange = (
    modifierIndex: number,
    optionIndex: number,
    field: string,
    value: string | number
  ) => {
    const newModifiers = [...modifiers];
    newModifiers[modifierIndex].options[optionIndex] = {
      ...newModifiers[modifierIndex].options[optionIndex],
      [field]: field === 'price' ? Number(value) : value,
    };
    setModifiers(newModifiers);
  };

  const handleAddDiscount = () => {
    setDiscounts([
      ...discounts,
      {
        name: '',
        type: 'percentage',
        value: 0,
        startDate: '',
        endDate: '',
      },
    ]);
  };

  const handleDiscountChange = (index: number, field: string, value: string | number) => {
    const newDiscounts = [...discounts];
    newDiscounts[index] = {
      ...newDiscounts[index],
      [field]: field === 'value' ? Number(value) : value,
    };
    setDiscounts(newDiscounts);
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
          <Package className="h-6 w-6" />
          Products
        </h1>
        <button
          onClick={() => {
            setEditingProduct(null);
            reset();
            setModifiers([]);
            setDiscounts([]);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products?.map((product) => (
          <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden">
            {product.image && (
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-4">
              <h3 className="text-lg font-medium text-gray-900">{product.name}</h3>
              <p className="mt-1 text-sm text-gray-500">{product.description}</p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-lg font-bold text-gray-900">
                  ${product.price.toFixed(2)}
                </span>
                <span className="text-sm text-gray-500">
                  Stock: {product.stock}
                </span>
              </div>
              <div className="mt-4 flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setEditingProduct(product);
                    reset({
                      name: product.name,
                      description: product.description,
                      price: product.price,
                      category: product.category,
                      stock: product.stock,
                      image: product.image,
                    });
                    setModifiers(product.modifiers || []);
                    setDiscounts(product.discounts || []);
                    setIsModalOpen(true);
                  }}
                  className="text-indigo-600 hover:text-indigo-900"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(product._id)}
                  className="text-red-600 hover:text-red-900"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">
              {editingProduct ? 'Edit Product' : 'Add Product'}
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    {...register('name', { required: 'Name is required' })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <select
                    {...register('category', { required: 'Category is required' })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="">Select category</option>
                    {categories?.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  {...register('description')}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Price</label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('price', { required: 'Price is required', min: 0 })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                  {errors.price && (
                    <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Stock</label>
                  <input
                    type="number"
                    {...register('stock', { required: 'Stock is required', min: 0 })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                  {errors.stock && (
                    <p className="mt-1 text-sm text-red-600">{errors.stock.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Image URL</label>
                <input
                  type="url"
                  {...register('image')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              {/* Modifiers Section */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Modifiers
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddModifier}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                {modifiers.map((modifier, modifierIndex) => (
                  <div key={modifierIndex} className="mb-4 p-4 border rounded-md">
                    <input
                      type="text"
                      value={modifier.name}
                      onChange={(e) =>
                        handleModifierChange(modifierIndex, 'name', e.target.value)
                      }
                      placeholder="Modifier name"
                      className="mb-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                    <div className="space-y-2">
                      {modifier.options.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex gap-2">
                          <input
                            type="text"
                            value={option.name}
                            onChange={(e) =>
                              handleModifierOptionChange(
                                modifierIndex,
                                optionIndex,
                                'name',
                                e.target.value
                              )
                            }
                            placeholder="Option name"
                            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          />
                          <input
                            type="number"
                            value={option.price}
                            onChange={(e) =>
                              handleModifierOptionChange(
                                modifierIndex,
                                optionIndex,
                                'price',
                                e.target.value
                              )
                            }
                            placeholder="Price"
                            className="w-24 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          />
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => handleAddModifierOption(modifierIndex)}
                        className="text-sm text-indigo-600 hover:text-indigo-900"
                      >
                        Add Option
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Discounts Section */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <Tag className="h-5 w-5" />
                    Discounts
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddDiscount}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                {discounts.map((discount, index) => (
                  <div key={index} className="mb-4 p-4 border rounded-md">
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        value={discount.name}
                        onChange={(e) =>
                          handleDiscountChange(index, 'name', e.target.value)
                        }
                        placeholder="Discount name"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                      <select
                        value={discount.type}
                        onChange={(e) =>
                          handleDiscountChange(index, 'type', e.target.value)
                        }
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      >
                        <option value="percentage">Percentage</option>
                        <option value="fixed">Fixed Amount</option>
                      </select>
                    </div>
                    <div className="mt-2 grid grid-cols-3 gap-4">
                      <input
                        type="number"
                        value={discount.value}
                        onChange={(e) =>
                          handleDiscountChange(index, 'value', e.target.value)
                        }
                        placeholder="Value"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                      <input
                        type="date"
                        value={discount.startDate}
                        onChange={(e) =>
                          handleDiscountChange(index, 'startDate', e.target.value)
                        }
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                      <input
                        type="date"
                        value={discount.endDate}
                        onChange={(e) =>
                          handleDiscountChange(index, 'endDate', e.target.value)
                        }
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingProduct(null);
                    reset();
                    setModifiers([]);
                    setDiscounts([]);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  {editingProduct ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;