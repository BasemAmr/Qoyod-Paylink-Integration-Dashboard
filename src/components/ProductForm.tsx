import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Pencil, Trash2, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface Teacher {
  id: string;
  name: string;
  teacherPercentageLiabilityAccountId: number;
  teacherCommissionExpenseAccountId: number;
  teacherPercentage: number;
  expenseAccountId: number;
  couponAccountId: number;
}

interface Product {
  id?: number | null;
  productName: string;
  teacherCommissionExpenseAccountId: number | null;
  teacherPercentageExpenseAccountId: number | null;
  teacherPercentage: number | null;
  teacherPercentageLiabilityAccountId: number | null;
  productRevenueAccountId: number | null;
  couponAccountId: number | null;
}

const API_HEADERS = {
  'Content-Type': 'application/json',
  'ngrok-skip-browser-warning': '1'
};

export function ProductForm() {
  const [products, setProducts] = useState<Product[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [customTeacherPercentage, setCustomTeacherPercentage] = useState<number | null>(null);

  const [productForm, setProductForm] = useState<Product>({
    productName: '',
    teacherCommissionExpenseAccountId: null,
    teacherPercentageExpenseAccountId: null,
    teacherPercentage: null,
    teacherPercentageLiabilityAccountId: null,
    productRevenueAccountId: null,
    couponAccountId: null
  });

  const [teacherForm, setTeacherForm] = useState<Omit<Teacher, 'id'>>({
    name: '',
    teacherPercentageLiabilityAccountId: 0,
    teacherCommissionExpenseAccountId: 0,
    teacherPercentage: 0,
    expenseAccountId: 0,
    couponAccountId: 0
  });

  useEffect(() => {
    fetchProducts();
    fetchTeachers();
  }, []);

  useEffect(() => {
    if (selectedTeacherId) {
      const selectedTeacher = teachers.find(t => t.id === selectedTeacherId);
      if (selectedTeacher) {
        setProductForm(prev => ({
          ...prev,
          teacherCommissionExpenseAccountId: selectedTeacher.teacherCommissionExpenseAccountId,
          teacherPercentageExpenseAccountId: selectedTeacher.expenseAccountId,
          teacherPercentage: customTeacherPercentage ?? selectedTeacher.teacherPercentage,
          teacherPercentageLiabilityAccountId: selectedTeacher.teacherPercentageLiabilityAccountId,
          couponAccountId: selectedTeacher.couponAccountId
        }));
      }
    }
  }, [selectedTeacherId, teachers, customTeacherPercentage]);

  useEffect(() => {
    if (editingProduct) {
      setProductForm(editingProduct);
      setCustomTeacherPercentage(editingProduct.teacherPercentage);
      // Find and set the teacher based on the product's fields for radio selection
      const matchingTeacher = teachers.find(t =>
        t.teacherCommissionExpenseAccountId === editingProduct.teacherCommissionExpenseAccountId &&
        t.expenseAccountId === editingProduct.teacherPercentageExpenseAccountId &&
        t.teacherPercentageLiabilityAccountId === editingProduct.teacherPercentageLiabilityAccountId &&
        t.couponAccountId === editingProduct.couponAccountId
      );
      if (matchingTeacher) {
        setSelectedTeacherId(matchingTeacher.id);
        // If the percentage differs from the teacher's default, show advanced section
        if (editingProduct.teacherPercentage !== matchingTeacher.teacherPercentage) {
          setShowAdvanced(true);
        }
      } else {
        setSelectedTeacherId('');
      }
    } else {
      setProductForm({
        productName: '',
        teacherCommissionExpenseAccountId: null,
        teacherPercentageExpenseAccountId: null,
        teacherPercentage: null,
        teacherPercentageLiabilityAccountId: null,
        productRevenueAccountId: null,
        couponAccountId: null
      });
      setSelectedTeacherId('');
      setCustomTeacherPercentage(null);
      setShowAdvanced(false);
    }
  }, [editingProduct, teachers]);

  useEffect(() => {
    if (editingTeacher) {
      setTeacherForm({
        name: editingTeacher.name,
        teacherPercentageLiabilityAccountId: editingTeacher.teacherPercentageLiabilityAccountId,
        teacherCommissionExpenseAccountId: editingTeacher.teacherCommissionExpenseAccountId,
        teacherPercentage: editingTeacher.teacherPercentage,
        expenseAccountId: editingTeacher.expenseAccountId,
        couponAccountId: editingTeacher.couponAccountId
      });
    } else {
      setTeacherForm({
        name: '',
        teacherPercentageLiabilityAccountId: 0,
        teacherCommissionExpenseAccountId: 0,
        teacherPercentage: 0,
        expenseAccountId: 0,
        couponAccountId: 0
      });
    }
  }, [editingTeacher]);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/dashboard/products`, {
        headers: API_HEADERS
      });
      const data = await response.json();
      if (data.success) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/dashboard/teachers`, {
        headers: API_HEADERS
      });
      const data = await response.json();
      setTeachers(data);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingProduct
        ? `${import.meta.env.VITE_BACKEND_URL}/dashboard/products/${editingProduct.id}`
        : `${import.meta.env.VITE_BACKEND_URL}/dashboard/products`;
      const method = editingProduct ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: API_HEADERS,
        body: JSON.stringify(productForm),
      });

      if (response.ok) {
        fetchProducts();
        setProductForm({
          productName: '',
          teacherCommissionExpenseAccountId: null,
          teacherPercentageExpenseAccountId: null,
          teacherPercentage: null,
          teacherPercentageLiabilityAccountId: null,
          productRevenueAccountId: null,
          couponAccountId: null
        });
        setSelectedTeacherId('');
        setCustomTeacherPercentage(null);
        setShowAdvanced(false);
        setEditingProduct(null);
      }
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const handleTeacherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingTeacher
        ? `${import.meta.env.VITE_BACKEND_URL}/dashboard/teachers/${editingTeacher.id}`
        : `${import.meta.env.VITE_BACKEND_URL}/dashboard/teachers`;
      const method = editingTeacher ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: API_HEADERS,
        body: JSON.stringify(teacherForm),
      });

      if (response.ok) {
        fetchTeachers();
        setTeacherForm({
          name: '',
          teacherPercentageLiabilityAccountId: 0,
          teacherCommissionExpenseAccountId: 0,
          teacherPercentage: 0,
          expenseAccountId: 0,
          couponAccountId: 0
        });
        setEditingTeacher(null);
      }
    } catch (error) {
      console.error('Error saving teacher:', error);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/dashboard/products/${id}`, {
        method: 'DELETE',
        headers: API_HEADERS
      });

      if (response.ok) {
        fetchProducts();
      }
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleDeleteTeacher = async (id: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/dashboard/teachers/${id}`, {
        method: 'DELETE',
        headers: API_HEADERS
      });

      if (response.ok) {
        fetchTeachers();
      }
    } catch (error) {
      console.error('Error deleting teacher:', error);
    }
  };

  return (
    <div className="flex-1 p-8 overflow-auto">
      <Card>
        <CardHeader>
          <CardTitle>Product & Teacher Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="products" className="space-y-6">
            <TabsList>
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="teachers">Teachers</TabsTrigger>
            </TabsList>

            <TabsContent value="products">
              <form onSubmit={handleProductSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="productName">Product Name</Label>
                    <Input
                      id="productName"
                      value={productForm.productName}
                      onChange={(e) =>
                        setProductForm({ ...productForm, productName: e.target.value })
                      }
                      placeholder="Enter product name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="productRevenueAccountId">
                      Product Revenue Account ID
                    </Label>
                    <Input
                      id="productRevenueAccountId"
                      type="number"
                      value={productForm.productRevenueAccountId || ''}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          productRevenueAccountId: e.target.value ? Number(e.target.value) : null,
                        })
                      }
                      placeholder="Enter Account ID"
                    />
                  </div>
                  <div className="col-span-2 space-y-4">
                    <Label>Select Teacher</Label>
                    <RadioGroup
                      value={selectedTeacherId}
                      onValueChange={setSelectedTeacherId}
                      className="grid grid-cols-2 gap-4"
                    >
                      {teachers.map((teacher) => (
                        <div key={teacher.id} className="flex items-center space-x-2 border p-4 rounded-lg">
                          <RadioGroupItem value={teacher.id} id={teacher.id} />
                          <Label htmlFor={teacher.id} className="flex-1">
                            <div className="font-medium">{teacher.name}</div>
                            <div className="text-sm text-gray-500">
                              Commission: {teacher.teacherCommissionExpenseAccountId} |
                              Percentage: {teacher.teacherPercentage}%
                            </div>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                  
                  {/* Advanced Settings Button */}
                  <div className="col-span-2">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      className="w-full flex items-center justify-center text-gray-600 hover:text-gray-900"
                    >
                      Advanced Settings
                      {showAdvanced ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
                    </Button>
                  </div>

                  {/* Advanced Settings Section */}
                  {showAdvanced && (
                    <div className="col-span-2 space-y-4 border-t pt-4">
                      <div className="space-y-2">
                        <Label htmlFor="customTeacherPercentage">
                          Custom Teacher Percentage (Overrides Default)
                        </Label>
                        <Input
                          id="customTeacherPercentage"
                          type="number"
                          step="0.01"
                          value={customTeacherPercentage || ''}
                          onChange={(e) => {
                            const value = e.target.value ? Number(e.target.value) : null;
                            setCustomTeacherPercentage(value);
                            setProductForm(prev => ({
                              ...prev,
                              teacherPercentage: value
                            }));
                          }}
                          placeholder="Enter custom percentage"
                        />
                      </div>
                    </div>
                  )}
                </div>
                <Button type="submit" className="w-full">
                  {editingProduct ? 'Update Product' : 'Add Product'}
                  {editingProduct ? (
                    <Pencil className="ml-2 h-4 w-4" />
                  ) : (
                    <Plus className="ml-2 h-4 w-4" />
                  )}
                </Button>
              </form>

              <Table className="mt-8">
                <TableHeader>
                  <TableRow>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Revenue Account</TableHead>
                    <TableHead>Commission Account</TableHead>
                    <TableHead>Percentage Account</TableHead>
                    <TableHead>Teacher %</TableHead>
                    <TableHead>Liability Account</TableHead>
                    <TableHead>Coupon Account</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>{product.productName}</TableCell>
                      <TableCell>{product.productRevenueAccountId}</TableCell>
                      <TableCell>{product.teacherCommissionExpenseAccountId}</TableCell>
                      <TableCell>{product.teacherPercentageExpenseAccountId}</TableCell>
                      <TableCell>{product.teacherPercentage}%</TableCell>
                      <TableCell>{product.teacherPercentageLiabilityAccountId}</TableCell>
                      <TableCell>{product.couponAccountId}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingProduct(product);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteProduct(product.id!)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="teachers">
              <form onSubmit={handleTeacherSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="teacherName">Teacher Name</Label>
                    <Input
                      id="teacherName"
                      value={teacherForm.name}
                      onChange={(e) =>
                        setTeacherForm({ ...teacherForm, name: e.target.value })
                      }
                      placeholder="Enter teacher name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="teacherCommissionExpenseAccountId">
                      Commission Account ID
                    </Label>
                    <Input
                      id="teacherCommissionExpenseAccountId"
                      type="number"
                      value={teacherForm.teacherCommissionExpenseAccountId || ''}
                      onChange={(e) =>
                        setTeacherForm({
                          ...teacherForm,
                          teacherCommissionExpenseAccountId: Number(e.target.value),
                        })
                      }
                      placeholder="Enter Commission Account ID"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="teacherPercentage">Percentage</Label>
                    <Input
                      id="teacherPercentage"
                      type="number"
                      step="0.01"
                      value={teacherForm.teacherPercentage || ''}
                      onChange={(e) =>
                        setTeacherForm({
                          ...teacherForm,
                          teacherPercentage: Number(e.target.value),
                        })
                      }
                      placeholder="Enter Percentage"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="teacherPercentageLiabilityAccountId">
                      Percentage Liability Account ID
                    </Label>
                    <Input
                      id="teacherPercentageLiabilityAccountId"
                      type="number"
                      value={teacherForm.teacherPercentageLiabilityAccountId || ''}
                      onChange={(e) =>
                        setTeacherForm({
                          ...teacherForm,
                          teacherPercentageLiabilityAccountId: Number(e.target.value),
                        })
                      }
                      placeholder="Enter Percentage Liability Account ID"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expenseAccountId">
                      Expense Account ID
                    </Label>
                    <Input
                      id="expenseAccountId"
                      type="number"
                      value={teacherForm.expenseAccountId || ''}
                      onChange={(e) =>
                        setTeacherForm({
                          ...teacherForm,
                          expenseAccountId: Number(e.target.value),
                        })
                      }
                      placeholder="Enter Expense Account ID"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="teacherCouponAccountId">
                      Coupon Account ID
                    </Label>
                    <Input
                      id="teacherCouponAccountId"
                      type="number"
                      value={teacherForm.couponAccountId || ''}
                      onChange={(e) =>
                        setTeacherForm({
                          ...teacherForm,
                          couponAccountId: Number(e.target.value),
                        })
                      }
                      placeholder="Enter Coupon Account ID"
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full">
                  {editingTeacher ? 'Update Teacher' : 'Add Teacher'}
                  {editingTeacher ? (
                    <Pencil className="ml-2 h-4 w-4" />
                  ) : (
                    <Plus className="ml-2 h-4 w-4" />
                  )}
                </Button>
              </form>

              <Table className="mt-8">
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Commission Account</TableHead>
                    <TableHead>Percentage</TableHead>
                    <TableHead>Liability Account</TableHead>
                    <TableHead>Expense Account</TableHead>
                    <TableHead>Coupon Account</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teachers.map((teacher) => (
                    <TableRow key={teacher.id}>
                      <TableCell>{teacher.name}</TableCell>
                      <TableCell>{teacher.teacherCommissionExpenseAccountId}</TableCell>
                      <TableCell>{teacher.teacherPercentage}%</TableCell>
                      <TableCell>{teacher.teacherPercentageLiabilityAccountId}</TableCell>
                      <TableCell>{teacher.expenseAccountId}</TableCell>
                      <TableCell>{teacher.couponAccountId}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingTeacher(teacher)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteTeacher(teacher.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}