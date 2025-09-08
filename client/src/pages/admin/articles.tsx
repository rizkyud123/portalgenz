import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Eye, Edit, Trash2, Grid, List } from "lucide-react";
import AdminSidebar from "@/components/admin/sidebar";
import AdminHeader from "@/components/admin/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";

export default function AdminArticles() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedArticles, setSelectedArticles] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const limit = 10;

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation("/admin/login");
    }
  }, [isAuthenticated, authLoading, setLocation]);

  const { data: categories = [] } = useQuery({
    queryKey: ["/api/admin/categories"],
    enabled: isAuthenticated,
  });

  const { data: articlesData, isLoading: articlesLoading } = useQuery({
    queryKey: ["/api/admin/articles", { 
      search: searchQuery || undefined,
      category: selectedCategory || undefined,
      status: selectedStatus || undefined,
      orderBy: sortBy,
      limit,
      offset: (currentPage - 1) * limit 
    }],
    enabled: isAuthenticated,
  });

  const deleteArticleMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/admin/articles/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Berhasil",
        description: "Artikel berhasil dihapus",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/articles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Gagal menghapus artikel",
        variant: "destructive",
      });
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleDeleteArticle = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus artikel ini?")) {
      deleteArticleMutation.mutate(id);
    }
  };

  const toggleSelectArticle = (id: string) => {
    setSelectedArticles(prev => 
      prev.includes(id) 
        ? prev.filter(articleId => articleId !== id)
        : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const allArticleIds = articles?.map((article: any) => article.id) || [];
    setSelectedArticles(
      selectedArticles.length === allArticleIds.length ? [] : allArticleIds
    );
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

  const articles = articlesData?.articles || [];
  const totalArticles = articlesData?.total || 0;
  const totalPages = Math.ceil(totalArticles / limit);

  return (
    <div className="flex h-screen bg-muted">
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader 
          title="Kelola Berita" 
          subtitle="Buat, edit, dan kelola semua berita"
        />

        <main className="flex-1 overflow-auto bg-background p-6">
          {/* Toolbar */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <Button onClick={() => setLocation("/admin/articles/new")} data-testid="create-article-button">
                    <Plus className="h-4 w-4 mr-2" />
                    Buat Berita Baru
                  </Button>
                  {selectedArticles.length > 0 && (
                    <span className="text-sm text-muted-foreground" data-testid="selected-count">
                      {selectedArticles.length} artikel dipilih
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant={viewMode === "grid" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    data-testid="view-mode-grid"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    data-testid="view-mode-list"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <form onSubmit={handleSearch} className="relative">
                  <Input
                    placeholder="Cari judul, konten..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    data-testid="search-input"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </form>
                
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger data-testid="category-filter">
                    <SelectValue placeholder="Semua Kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Semua Kategori</SelectItem>
                    {categories.map((category: any) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger data-testid="status-filter">
                    <SelectValue placeholder="Semua Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Semua Status</SelectItem>
                    <SelectItem value="published">Diterbitkan</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger data-testid="sort-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Terbaru</SelectItem>
                    <SelectItem value="oldest">Terlama</SelectItem>
                    <SelectItem value="title">Judul A-Z</SelectItem>
                  </SelectContent>
                </Select>

                <Button type="submit" onClick={handleSearch} data-testid="search-button">
                  Cari
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Articles Table/Grid */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle data-testid="articles-list-title">Daftar Berita</CardTitle>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground" data-testid="articles-count">
                    Menampilkan {Math.min(limit, totalArticles)} dari {totalArticles} berita
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {articlesLoading ? (
                <div className="p-6">
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="w-16 h-16" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                        <Skeleton className="h-8 w-24" />
                      </div>
                    ))}
                  </div>
                </div>
              ) : articles.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={selectedArticles.length === articles.length}
                            onCheckedChange={toggleSelectAll}
                            data-testid="select-all-checkbox"
                          />
                        </TableHead>
                        <TableHead>Berita</TableHead>
                        <TableHead>Kategori</TableHead>
                        <TableHead>Penulis</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {articles.map((article: any) => (
                        <TableRow key={article.id} className="hover:bg-muted/50" data-testid={`article-row-${article.id}`}>
                          <TableCell>
                            <Checkbox
                              checked={selectedArticles.includes(article.id)}
                              onCheckedChange={() => toggleSelectArticle(article.id)}
                              data-testid={`select-article-${article.id}`}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-start space-x-4">
                              <div className="w-16 h-12 bg-muted rounded overflow-hidden flex-shrink-0">
                                {article.featuredImage ? (
                                  <img
                                    src={article.featuredImage}
                                    alt={article.title}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                    <Edit className="h-4 w-4" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium text-card-foreground line-clamp-2 mb-1">
                                  {article.title}
                                </h4>
                                <p className="text-xs text-muted-foreground">{article.slug}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              article.category.slug === 'politik' ? 'bg-red-100 text-red-800' :
                              article.category.slug === 'ekonomi' ? 'bg-green-100 text-green-800' :
                              article.category.slug === 'teknologi' ? 'bg-purple-100 text-purple-800' :
                              article.category.slug === 'olahraga' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {article.category.name}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm">
                            {article.author.firstName && article.author.lastName
                              ? `${article.author.firstName} ${article.author.lastName}`
                              : article.author.username}
                          </TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              article.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {article.status === 'published' ? 'Diterbitkan' : 'Draft'}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(article.createdAt), {
                              addSuffix: true,
                              locale: id,
                            })}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(`/article/${article.slug}`, '_blank')}
                                title="Preview"
                                data-testid={`preview-article-${article.id}`}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setLocation(`/admin/articles/${article.id}/edit`)}
                                title="Edit"
                                data-testid={`edit-article-${article.id}`}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteArticle(article.id)}
                                className="text-destructive hover:text-destructive"
                                title="Hapus"
                                disabled={deleteArticleMutation.isPending}
                                data-testid={`delete-article-${article.id}`}
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
                <div className="text-center py-12 text-muted-foreground" data-testid="no-articles">
                  <Edit className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Belum ada artikel</p>
                  <Button 
                    className="mt-4" 
                    onClick={() => setLocation("/admin/articles/new")}
                    data-testid="create-first-article"
                  >
                    Buat Artikel Pertama
                  </Button>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-border">
                  <div className="text-sm text-muted-foreground" data-testid="pagination-info">
                    Halaman {currentPage} dari {totalPages}
                  </div>
                  <div className="flex items-center space-x-2" data-testid="pagination-controls">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                      data-testid="pagination-prev"
                    >
                      Sebelumnya
                    </Button>
                    
                    {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                      const page = i + 1;
                      if (totalPages > 5 && currentPage > 3) {
                        const adjustedPage = currentPage - 2 + i;
                        if (adjustedPage <= totalPages) {
                          return (
                            <Button
                              key={adjustedPage}
                              variant={currentPage === adjustedPage ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(adjustedPage)}
                              data-testid={`pagination-${adjustedPage}`}
                            >
                              {adjustedPage}
                            </Button>
                          );
                        }
                      } else {
                        return (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            data-testid={`pagination-${page}`}
                          >
                            {page}
                          </Button>
                        );
                      }
                    })}

                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                      data-testid="pagination-next"
                    >
                      Selanjutnya
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
