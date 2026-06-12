import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Upload, X, Plus, Package, Truck } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Category, Supplier } from '../../lib/supabase';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Switch } from '../../components/ui/switch';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { toast } from 'sonner';

interface ProductFormData {
  sku: string;
  title: string;
  description: string;
  brand: string;
  price: string;
  sale_price: string;
  cost_price: string;
  category_id: string;
  supplier_id: string;
  images: string[];
  tags: string[];
  stock_qty: string;
  low_stock_threshold: string;
  weight: string;
  fulfillment_type: 'warehouse' | 'dropship';
  is_featured: boolean;
  is_active: boolean;
}

const initialFormData: ProductFormData = {
  sku: '',
  title: '',
  description: '',
  brand: '',
  price: '',
  sale_price: '',
  cost_price: '',
  category_id: '',
  supplier_id: '',
  images: [],
  tags: [],
  stock_qty: '0',
  low_stock_threshold: '5',
  weight: '',
  fulfillment_type: 'warehouse',
  is_featured: false,
  is_active: true,
};

export function AdminProductForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [formData, setFormData] = useState<ProductFormData>(initialFormData);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    loadCategoriesAndSuppliers();
    if (isEditing) {
      loadProduct();
    }
  }, [id]);

  async function loadCategoriesAndSuppliers() {
    const { data: cats } = await supabase.from('categories').select('*').order('name');
    const { data: sups } = await supabase.from('suppliers').select('*').eq('is_active', true).order('name');
    setCategories(cats || []);
    setSuppliers(sups || []);
  }

  async function loadProduct() {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          sku: data.sku || '',
          title: data.title || '',
          description: data.description || '',
          brand: data.brand || '',
          price: data.price?.toString() || '',
          sale_price: data.sale_price?.toString() || '',
          cost_price: data.cost_price?.toString() || '',
          category_id: data.category_id || '',
          supplier_id: data.supplier_id || '',
          images: data.images || [],
          tags: data.tags || [],
          stock_qty: data.stock_qty?.toString() || '0',
          low_stock_threshold: data.low_stock_threshold?.toString() || '5',
          weight: data.weight?.toString() || '',
          fulfillment_type: data.fulfillment_type || 'warehouse',
          is_featured: data.is_featured || false,
          is_active: data.is_active ?? true,
        });
      }
    } catch (error) {
      console.error('Error loading product:', error);
      toast.error('Failed to load product');
      navigate('/admin/products');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const productData = {
        sku: formData.sku,
        title: formData.title,
        description: formData.description || null,
        brand: formData.brand || null,
        price: parseFloat(formData.price) || 0,
        sale_price: formData.sale_price ? parseFloat(formData.sale_price) : null,
        cost_price: formData.cost_price ? parseFloat(formData.cost_price) : null,
        category_id: formData.category_id || null,
        supplier_id: formData.supplier_id || null,
        images: formData.images,
        tags: formData.tags,
        stock_qty: parseInt(formData.stock_qty) || 0,
        low_stock_threshold: parseInt(formData.low_stock_threshold) || 5,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        fulfillment_type: formData.fulfillment_type,
        is_featured: formData.is_featured,
        is_active: formData.is_active,
      };

      let error;
      if (isEditing) {
        const result = await supabase
          .from('products')
          .update(productData)
          .eq('id', id);
        error = result.error;
      } else {
        const result = await supabase
          .from('products')
          .insert([{ ...productData }]);
        error = result.error;
      }

      if (error) throw error;

      toast.success(isEditing ? 'Product updated successfully' : 'Product created successfully');
      navigate('/admin/products');
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Failed to save product');
    } finally {
      setSaving(false);
    }
  }

  function addImage() {
    if (newImageUrl.trim()) {
      setFormData({ ...formData, images: [...formData.images, newImageUrl.trim()] });
      setNewImageUrl('');
    }
  }

  function removeImage(index: number) {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  }

  function addTag() {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, newTag.trim()] });
      setNewTag('');
    }
  }

  function removeTag(tag: string) {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tag),
    });
  }

  function generateSku() {
    const prefix = 'PRD';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    setFormData({ ...formData, sku: `${prefix}-${timestamp}-${random}` });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/products')}
            className="p-2 hover:bg-ink-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-heading font-bold text-ink-900">
              {isEditing ? 'Edit Product' : 'Add Product'}
            </h1>
            <p className="text-sm text-ink-500">
              {isEditing ? 'Update product information' : 'Create a new product'}
            </p>
          </div>
        </div>
        <Button
          onClick={handleSubmit}
          disabled={saving}
          className="bg-brand hover:bg-brand-600"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Product'}
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="bg-white border border-ink-200 rounded-lg p-1">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="pricing">Pricing & Inventory</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
            <TabsTrigger value="fulfillment">Fulfillment</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="sku">SKU *</Label>
                        <div className="flex gap-2">
                          <Input
                            id="sku"
                            value={formData.sku}
                            onChange={(e) =>
                              setFormData({ ...formData, sku: e.target.value })
                            }
                            placeholder="PRD-001"
                            required
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={generateSku}
                          >
                            Generate
                          </Button>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="brand">Brand</Label>
                        <Input
                          id="brand"
                          value={formData.brand}
                          onChange={(e) =>
                            setFormData({ ...formData, brand: e.target.value })
                          }
                          placeholder="Brand name"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="title">Product Name *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        placeholder="Enter product name"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({ ...formData, description: e.target.value })
                        }
                        placeholder="Product description"
                        rows={5}
                      />
                    </div>

                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={formData.category_id}
                        onValueChange={(value) =>
                          setFormData({ ...formData, category_id: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Tags</Label>
                      <div className="flex gap-2 mb-2">
                        <Input
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          placeholder="Add tag"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addTag();
                            }
                          }}
                        />
                        <Button type="button" variant="outline" onClick={addTag}>
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-ink-100 text-ink-700 rounded-full text-sm"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => removeTag(tag)}
                              className="hover:text-red-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="active">Active</Label>
                      <Switch
                        id="active"
                        checked={formData.is_active}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, is_active: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="featured">Featured</Label>
                      <Switch
                        id="featured"
                        checked={formData.is_featured}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, is_featured: checked })
                        }
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="pricing" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Pricing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="price">Regular Price ($) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="sale_price">Sale Price ($)</Label>
                    <Input
                      id="sale_price"
                      type="number"
                      step="0.01"
                      value={formData.sale_price}
                      onChange={(e) =>
                        setFormData({ ...formData, sale_price: e.target.value })
                      }
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cost_price">Cost Price ($)</Label>
                    <Input
                      id="cost_price"
                      type="number"
                      step="0.01"
                      value={formData.cost_price}
                      onChange={(e) =>
                        setFormData({ ...formData, cost_price: e.target.value })
                      }
                      placeholder="0.00"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Inventory</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="stock_qty">Stock Quantity</Label>
                    <Input
                      id="stock_qty"
                      type="number"
                      value={formData.stock_qty}
                      onChange={(e) =>
                        setFormData({ ...formData, stock_qty: e.target.value })
                      }
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="low_stock_threshold">Low Stock Threshold</Label>
                    <Input
                      id="low_stock_threshold"
                      type="number"
                      value={formData.low_stock_threshold}
                      onChange={(e) =>
                        setFormData({ ...formData, low_stock_threshold: e.target.value })
                      }
                      placeholder="5"
                    />
                    <p className="text-xs text-ink-500 mt-1">
                      You'll be notified when stock falls below this level
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.01"
                      value={formData.weight}
                      onChange={(e) =>
                        setFormData({ ...formData, weight: e.target.value })
                      }
                      placeholder="0.00"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="images" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Images</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Add Image URL</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addImage();
                        }
                      }}
                    />
                    <Button type="button" variant="outline" onClick={addImage}>
                      <Upload className="w-4 h-4 mr-2" />
                      Add
                    </Button>
                  </div>
                  <p className="text-xs text-ink-500 mt-1">
                    Paste image URLs from your CDN or image hosting service
                  </p>
                </div>

                {formData.images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {formData.images.map((url, index) => (
                      <div
                        key={index}
                        className="relative aspect-square bg-ink-100 rounded-lg overflow-hidden group"
                      >
                        <img
                          src={url}
                          alt={`Product ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="%239ca3af"%3E%3Cpath stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.172-1.172a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /%3E%3C/svg%3E';
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        {index === 0 && (
                          <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-brand text-white text-xs rounded">
                            Primary
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {formData.images.length === 0 && (
                  <div className="border-2 border-dashed border-ink-200 rounded-lg p-8 text-center">
                    <Upload className="w-12 h-12 text-ink-300 mx-auto mb-4" />
                    <p className="text-ink-500">No images added yet</p>
                    <p className="text-xs text-ink-400 mt-1">
                      Add image URLs above to showcase your product
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fulfillment" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Fulfillment Method</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, fulfillment_type: 'warehouse', supplier_id: '' })
                      }
                      className={`p-4 border rounded-lg text-center ${
                        formData.fulfillment_type === 'warehouse'
                          ? 'border-brand bg-brand/5'
                          : 'border-ink-200 hover:border-ink-300'
                      }`}
                    >
                      <Package className="w-8 h-8 mx-auto mb-2 text-brand" />
                      <p className="font-medium">Warehouse</p>
                      <p className="text-xs text-ink-500 mt-1">
                        Ship from your own inventory
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, fulfillment_type: 'dropship' })
                      }
                      className={`p-4 border rounded-lg text-center ${
                        formData.fulfillment_type === 'dropship'
                          ? 'border-brand bg-brand/5'
                          : 'border-ink-200 hover:border-ink-300'
                      }`}
                    >
                      <Truck className="w-8 h-8 mx-auto mb-2 text-brand" />
                      <p className="font-medium">Dropship</p>
                      <p className="text-xs text-ink-500 mt-1">
                        Ship from supplier
                      </p>
                    </button>
                  </div>
                </CardContent>
              </Card>

              {formData.fulfillment_type === 'dropship' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Supplier</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Select
                      value={formData.supplier_id}
                      onValueChange={(value) =>
                        setFormData({ ...formData, supplier_id: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers.map((supplier) => (
                          <SelectItem key={supplier.id} value={supplier.id}>
                            {supplier.name} ({supplier.platform})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-ink-500 mt-2">
                      Select the supplier who will fulfill this product
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </form>
    </div>
  );
}
