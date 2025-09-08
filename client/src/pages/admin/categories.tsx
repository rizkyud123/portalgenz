import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Tag } from "lucide-react";
import AdminSidebar from "@/components/admin/sidebar";
import AdminHeader from "@/components/admin/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const categorySchema = z.object({
  name: z.string().min(1, "Nama kategori harus diisi"),
  description: z.string().optional(),
  slug: z.string().optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

export default function AdminCategories() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation("/admin/login");
    }
  }, [isAuthenticated, authLoading, setLocation]);

  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ["/api/admin/categories"],
    enabled: isAuthenticated,
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (data: CategoryFormData) => {
      const response = await apiRequest('POST', '/api/admin/categories', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Berhasil",
        description: "Kategori berhasil dibuat",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/categories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      setIsDialogOpen(false);
      reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Gagal membuat kategori",
        variant: "destructive",
      });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async (data: CategoryFormData & { id: string }) => {
      const { id, ...updateData } = data;
      const response = await apiRequest('PUT', `/api/admin/categories/${id}`, updateData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Berhasil",
        description: "Kategori berhasil diperbarui",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/categories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      setIsDialogOpen(false);
      setEditingCategory(null);
      reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Gagal memperbarui kategori",
        variant: "destructive",
      });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/admin/categories/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Berhasil",
        description: "Kategori berhasil dihapus",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/categories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Gagal menghapus kategori",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CategoryFormData) => {
    if (editingCategory) {
      updateCategoryMutation.mutate({ ...data, id: editingCategory.id });
    } else {
      createCategoryMutation.mutate(data);
    }
  };

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setValue('name', category.name);
    setValue('description', category.description || '');
    setValue('slug', category.slug);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus kategori ini?")) {
      deleteCategoryMutation.mutate(id);
    }
  };

  const handleNewCategory = () => {
    setEditingCategory(null);
    reset();
    setIsDialogOpen(true);
  };

  if (authLoading) {
    return (
      <div className="flex h-screen bg-muted">
        <div className="w-64 bg-card">
          <Skeleton className="h-full" />
        </div>
        <div className="flex-1">
          <Skeleton className="h-full" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen bg-muted">
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader 
          title="Kategori" 
          subtitle="Kelola kategori berita"
        />

        <main className="flex-1 overflow-auto bg-background p-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle data-testid="categories-title">Daftar Kategori</CardTitle>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={handleNewCategory} data-testid="create-category-button">
                      <Plus className="h-4 w-4 mr-2" />
                      Tambah Kategori
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle data-testid="category-dialog-title">
                        {editingCategory ? "Edit Kategori" : "Tambah Kategori Baru"}
                      </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" data-testid="category-form">
                      <div>
                        <Label htmlFor="name">Nama Kategori</Label>
                        <Input
                          id="name"
                          {...register('name')}
                          placeholder="Masukkan nama kategori"
                          data-testid="category-name-input"
                        />
                        {errors.name && (
                          <p className="text-sm text-destructive mt-1" data-testid="name-error">
                            {errors.name.message}
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <Label htmlFor="slug">Slug (URL)</Label>
                        <Input
                          id="slug"
                          {...register('slug')}
                          placeholder="slug-kategori (opsional)"
                          data-testid="category-slug-input"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="description">Deskripsi</Label>
                        <Textarea
                          id="description"
                          {...register('description')}
                          placeholder="Deskripsi kategori (opsional)"
                          rows={3}
                          data-testid="category-description-input"
                        />
                      </div>
                      
                      <div className="flex justify-end space-x-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => {
                            setIsDialogOpen(false);
                            setEditingCategory(null);
                            reset();
                          }}
                          data-testid="cancel-category-button"
                        >
                          Batal
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}
                          data-testid="save-category-button"
                        >
                          {editingCategory ? "Perbarui" : "Simpan"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {categoriesLoading ? (
                <div className="p-6">
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <Skeleton className="w-8 h-8 rounded" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Skeleton className="h-8 w-16" />
                          <Skeleton className="h-8 w-16" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : categories.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Kategori</TableHead>
                        <TableHead>Slug</TableHead>
                        <TableHead>Deskripsi</TableHead>
                        <TableHead>Jumlah Artikel</TableHead>
                        <TableHead>Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categories.map((category: any) => (
                        <TableRow key={category.id} data-testid={`category-row-${category.id}`}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className={`w-8 h-8 rounded flex items-center justify-center text-white text-sm font-medium ${
                                category.slug === 'politik' ? 'bg-red-500' :
                                category.slug === 'ekonomi' ? 'bg-green-500' :
                                category.slug === 'teknologi' ? 'bg-purple-500' :
                                category.slug === 'olahraga' ? 'bg-blue-500' :
                                category.slug === 'budaya' ? 'bg-orange-500' :
                                'bg-gray-500'
                              }`}>
                                <Tag className="h-4 w-4" />
                              </div>
                              <div>
                                <p className="font-medium" data-testid={`category-name-${category.id}`}>
                                  {category.name}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <code className="text-sm bg-muted px-2 py-1 rounded" data-testid={`category-slug-${category.id}`}>
                              {category.slug}
                            </code>
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <p className="text-sm text-muted-foreground line-clamp-2" data-testid={`category-description-${category.id}`}>
                              {category.description || "-"}
                            </p>
                          </TableCell>
                          <TableCell>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800" data-testid={`category-count-${category.id}`}>
                              {category.articleCount || 0} artikel
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(category)}
                                data-testid={`edit-category-${category.id}`}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(category.id)}
                                className="text-destructive hover:text-destructive"
                                disabled={deleteCategoryMutation.isPending}
                                data-testid={`delete-category-${category.id}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground" data-testid="no-categories">
                  <Tag className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Belum ada kategori</p>
                  <Button 
                    className="mt-4" 
                    onClick={handleNewCategory}
                    data-testid="create-first-category"
                  >
                    Buat Kategori Pertama
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
