import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, Eye, Upload, ArrowLeft } from "lucide-react";
import AdminSidebar from "@/components/admin/sidebar";
import AdminHeader from "@/components/admin/header";
import RichTextEditor from "@/components/rich-text-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const articleSchema = z.object({
  title: z.string().min(1, "Judul artikel harus diisi"),
  slug: z.string().optional(),
  excerpt: z.string().optional(),
  content: z.string().min(1, "Konten artikel harus diisi"),
  categoryId: z.string().min(1, "Kategori harus dipilih"),
  featuredImage: z.string().optional(),
  status: z.enum(["draft", "published"]),
});

type ArticleFormData = z.infer<typeof articleSchema>;

export default function ArticleEditor() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [, params] = useRoute("/admin/articles/:id/edit");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const articleId = params?.id;
  const isEditing = !!articleId;
  const [content, setContent] = useState("");
  const [featuredImagePreview, setFeaturedImagePreview] = useState<string>("");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<ArticleFormData>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      status: "draft",
    },
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation("/admin/login");
    }
  }, [isAuthenticated, authLoading, setLocation]);

  const { data: categories = [] } = useQuery({
    queryKey: ["/api/admin/categories"],
    enabled: isAuthenticated,
  });

  const { data: article, isLoading: articleLoading } = useQuery({
    queryKey: ["/api/admin/articles", articleId],
    enabled: isAuthenticated && isEditing,
  });

  const uploadImageMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const response = await apiRequest('POST', '/api/admin/upload', formData);
      return response.json();
    },
    onSuccess: (data) => {
      setValue('featuredImage', data.filePath);
      setFeaturedImagePreview(data.filePath);
      toast({
        title: "Berhasil",
        description: "Gambar berhasil diupload",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Gagal mengupload gambar",
        variant: "destructive",
      });
    },
  });

  const createArticleMutation = useMutation({
    mutationFn: async (data: ArticleFormData) => {
      const response = await apiRequest('POST', '/api/admin/articles', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Berhasil",
        description: "Artikel berhasil dibuat",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/articles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      setLocation("/admin/articles");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Gagal membuat artikel",
        variant: "destructive",
      });
    },
  });

  const updateArticleMutation = useMutation({
    mutationFn: async (data: ArticleFormData) => {
      const response = await apiRequest('PUT', `/api/admin/articles/${articleId}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Berhasil",
        description: "Artikel berhasil diperbarui",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/articles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      setLocation("/admin/articles");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Gagal memperbarui artikel",
        variant: "destructive",
      });
    },
  });

  // Populate form when editing
  useEffect(() => {
    if (article && isEditing) {
      setValue('title', article.title);
      setValue('slug', article.slug);
      setValue('excerpt', article.excerpt || '');
      setValue('categoryId', article.categoryId);
      setValue('featuredImage', article.featuredImage || '');
      setValue('status', article.status);
      setContent(article.content);
      setFeaturedImagePreview(article.featuredImage || '');
    }
  }, [article, isEditing, setValue]);

  // Auto-generate slug from title
  const watchedTitle = watch('title');
  useEffect(() => {
    if (watchedTitle && !isEditing) {
      const slug = watchedTitle
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setValue('slug', slug);
    }
  }, [watchedTitle, isEditing, setValue]);

  const onSubmit = (data: ArticleFormData) => {
    const submitData = { ...data, content };
    
    if (isEditing) {
      updateArticleMutation.mutate(submitData);
    } else {
      createArticleMutation.mutate(submitData);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "Ukuran file maksimal 5MB",
          variant: "destructive",
        });
        return;
      }
      uploadImageMutation.mutate(file);
    }
  };

  const handlePreview = () => {
    const formData = watch();
    const previewData = { ...formData, content };
    // Store in localStorage for preview
    localStorage.setItem('articlePreview', JSON.stringify(previewData));
    window.open('/article/preview', '_blank');
  };

  if (authLoading || (isEditing && articleLoading)) {
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
          title={isEditing ? "Edit Artikel" : "Buat Artikel Baru"}
          subtitle={isEditing ? `Edit: ${article?.title}` : "Tulis artikel baru untuk portal berita"}
        />

        <main className="flex-1 overflow-auto bg-background p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setLocation("/admin/articles")}
                data-testid="back-to-articles"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali ke Daftar Artikel
              </Button>
              
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePreview}
                  data-testid="preview-article"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
                <Button
                  type="submit"
                  disabled={createArticleMutation.isPending || updateArticleMutation.isPending}
                  data-testid="save-article"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isEditing ? "Perbarui" : "Simpan"}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle data-testid="article-content-title">Konten Artikel</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="title">Judul Artikel</Label>
                      <Input
                        id="title"
                        {...register('title')}
                        placeholder="Masukkan judul artikel yang menarik"
                        data-testid="article-title-input"
                      />
                      {errors.title && (
                        <p className="text-sm text-destructive mt-1" data-testid="title-error">
                          {errors.title.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="slug">Slug URL</Label>
                      <Input
                        id="slug"
                        {...register('slug')}
                        placeholder="url-friendly-slug"
                        data-testid="article-slug-input"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        URL artikel: /article/{watch('slug') || 'slug-artikel'}
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="excerpt">Ringkasan</Label>
                      <Textarea
                        id="excerpt"
                        {...register('excerpt')}
                        placeholder="Ringkasan singkat artikel (opsional)"
                        rows={3}
                        data-testid="article-excerpt-input"
                      />
                    </div>

                    <div>
                      <Label>Konten Artikel</Label>
                      <RichTextEditor
                        value={content}
                        onChange={setContent}
                        placeholder="Tulis konten artikel di sini..."
                        data-testid="article-content-editor"
                      />
                      {errors.content && (
                        <p className="text-sm text-destructive mt-1" data-testid="content-error">
                          {errors.content.message}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Publish Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle data-testid="publish-settings-title">Pengaturan Publikasi</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select onValueChange={(value) => setValue('status', value as 'draft' | 'published')}>
                        <SelectTrigger data-testid="article-status-select">
                          <SelectValue placeholder="Pilih status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="published">Terbitkan</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.status && (
                        <p className="text-sm text-destructive mt-1" data-testid="status-error">
                          {errors.status.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="category">Kategori</Label>
                      <Select onValueChange={(value) => setValue('categoryId', value)}>
                        <SelectTrigger data-testid="article-category-select">
                          <SelectValue placeholder="Pilih kategori" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category: any) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.categoryId && (
                        <p className="text-sm text-destructive mt-1" data-testid="category-error">
                          {errors.categoryId.message}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Featured Image */}
                <Card>
                  <CardHeader>
                    <CardTitle data-testid="featured-image-title">Gambar Utama</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {featuredImagePreview && (
                      <div className="aspect-video overflow-hidden rounded-lg border">
                        <img
                          src={featuredImagePreview}
                          alt="Featured image preview"
                          className="w-full h-full object-cover"
                          data-testid="featured-image-preview"
                        />
                      </div>
                    )}
                    
                    <div>
                      <Label htmlFor="featuredImage">Upload Gambar</Label>
                      <Input
                        id="featuredImage"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploadImageMutation.isPending}
                        data-testid="featured-image-input"
                      />
                      {uploadImageMutation.isPending && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Mengupload...
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Article Stats */}
                {isEditing && article && (
                  <Card>
                    <CardHeader>
                      <CardTitle data-testid="article-stats-title">Statistik Artikel</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Dibuat:</span>
                        <span data-testid="article-created-date">
                          {new Date(article.createdAt).toLocaleDateString('id-ID')}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Terakhir diubah:</span>
                        <span data-testid="article-updated-date">
                          {new Date(article.updatedAt).toLocaleDateString('id-ID')}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Penulis:</span>
                        <span data-testid="article-author">
                          {article.author.firstName && article.author.lastName
                            ? `${article.author.firstName} ${article.author.lastName}`
                            : article.author.username}
                        </span>
                      </div>
                      {article.status === 'published' && article.publishedAt && (
                        <div className="flex justify-between text-sm">
                          <span>Dipublikasi:</span>
                          <span data-testid="article-published-date">
                            {new Date(article.publishedAt).toLocaleDateString('id-ID')}
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
