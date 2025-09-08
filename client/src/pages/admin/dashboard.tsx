import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Plus, Upload, Tag, UserPlus, BarChart3, FileText, CheckCircle, Edit, Users } from "lucide-react";
import AdminSidebar from "@/components/admin/sidebar";
import AdminHeader from "@/components/admin/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";

export default function AdminDashboard() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation("/admin/login");
    }
  }, [isAuthenticated, authLoading, setLocation]);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/admin/stats"],
    enabled: isAuthenticated,
  });

  const { data: recentArticlesData, isLoading: articlesLoading } = useQuery({
    queryKey: ["/api/admin/articles", { limit: 5, offset: 0, orderBy: "newest" }],
    enabled: isAuthenticated,
  });

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

  const recentArticles = recentArticlesData?.articles || [];

  return (
    <div className="flex h-screen bg-muted">
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader 
          title="Dashboard" 
          subtitle={`Selamat datang kembali, ${user?.firstName || user?.username}`}
        />

        <main className="flex-1 overflow-auto bg-background p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card data-testid="stats-total-articles">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Berita</p>
                    {statsLoading ? (
                      <Skeleton className="h-8 w-16 mt-1" />
                    ) : (
                      <p className="text-2xl font-bold text-card-foreground">
                        {stats?.totalArticles || 0}
                      </p>
                    )}
                    <p className="text-sm text-green-600 mt-1">
                      <BarChart3 className="inline h-3 w-3 mr-1" />
                      Portal aktif
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card data-testid="stats-published-articles">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Berita Diterbitkan</p>
                    {statsLoading ? (
                      <Skeleton className="h-8 w-16 mt-1" />
                    ) : (
                      <p className="text-2xl font-bold text-card-foreground">
                        {stats?.publishedArticles || 0}
                      </p>
                    )}
                    <p className="text-sm text-green-600 mt-1">
                      <BarChart3 className="inline h-3 w-3 mr-1" />
                      Live di portal
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card data-testid="stats-draft-articles">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Draft</p>
                    {statsLoading ? (
                      <Skeleton className="h-8 w-16 mt-1" />
                    ) : (
                      <p className="text-2xl font-bold text-card-foreground">
                        {stats?.draftArticles || 0}
                      </p>
                    )}
                    <p className="text-sm text-yellow-600 mt-1">
                      <Edit className="inline h-3 w-3 mr-1" />
                      Perlu review
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Edit className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card data-testid="stats-total-users">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Pengguna</p>
                    {statsLoading ? (
                      <Skeleton className="h-8 w-16 mt-1" />
                    ) : (
                      <p className="text-2xl font-bold text-card-foreground">
                        {stats?.totalUsers || 0}
                      </p>
                    )}
                    <p className="text-sm text-blue-600 mt-1">
                      <Users className="inline h-3 w-3 mr-1" />
                      Tim editorial
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Articles & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Articles */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle data-testid="recent-articles-title">Berita Terbaru</CardTitle>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setLocation("/admin/articles")}
                      data-testid="view-all-articles"
                    >
                      Lihat Semua
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4" data-testid="recent-articles-list">
                    {articlesLoading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex items-start space-x-4 p-4 bg-muted rounded-lg">
                          <Skeleton className="w-16 h-16 rounded-lg" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                          </div>
                        </div>
                      ))
                    ) : recentArticles.length > 0 ? (
                      recentArticles.map((article: any) => (
                        <div 
                          key={article.id} 
                          className="flex items-start space-x-4 p-4 bg-muted rounded-lg hover:bg-accent transition-colors cursor-pointer"
                          onClick={() => setLocation(`/admin/articles/${article.id}/edit`)}
                          data-testid={`recent-article-${article.id}`}
                        >
                          <div className="w-16 h-16 bg-background rounded-lg overflow-hidden flex-shrink-0">
                            {article.featuredImage ? (
                              <img
                                src={article.featuredImage}
                                alt={article.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                <FileText className="h-6 w-6" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-card-foreground line-clamp-2 mb-1">
                              {article.title}
                            </h4>
                            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                article.category.slug === 'politik' ? 'bg-red-100 text-red-800' :
                                article.category.slug === 'ekonomi' ? 'bg-green-100 text-green-800' :
                                article.category.slug === 'teknologi' ? 'bg-purple-100 text-purple-800' :
                                article.category.slug === 'olahraga' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {article.category.name}
                              </span>
                              <span>
                                {formatDistanceToNow(new Date(article.createdAt), {
                                  addSuffix: true,
                                  locale: id,
                                })}
                              </span>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                article.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {article.status === 'published' ? 'Diterbitkan' : 'Draft'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Belum ada artikel</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle data-testid="quick-actions-title">Aksi Cepat</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button 
                      className="w-full justify-between"
                      onClick={() => setLocation("/admin/articles/new")}
                      data-testid="quick-action-new-article"
                    >
                      <div className="flex items-center space-x-3">
                        <Plus className="h-4 w-4" />
                        <span className="font-medium">Buat Berita Baru</span>
                      </div>
                      <span>→</span>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full justify-between"
                      onClick={() => setLocation("/admin/categories")}
                      data-testid="quick-action-add-category"
                    >
                      <div className="flex items-center space-x-3">
                        <Tag className="h-4 w-4" />
                        <span className="font-medium">Tambah Kategori</span>
                      </div>
                      <span>→</span>
                    </Button>
                    
                    {user?.role === 'admin' && (
                      <Button 
                        variant="outline" 
                        className="w-full justify-between"
                        onClick={() => setLocation("/admin/users")}
                        data-testid="quick-action-add-user"
                      >
                        <div className="flex items-center space-x-3">
                          <UserPlus className="h-4 w-4" />
                          <span className="font-medium">Tambah Pengguna</span>
                        </div>
                        <span>→</span>
                      </Button>
                    )}
                  </div>

                  {/* System Status */}
                  <div className="mt-8 pt-6 border-t border-border">
                    <h4 className="text-sm font-semibold text-card-foreground mb-4" data-testid="system-status-title">
                      Status Sistem
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Database</span>
                        <span className="text-sm text-green-600 flex items-center" data-testid="database-status">
                          <div className="w-2 h-2 bg-green-600 rounded-full mr-1"></div>
                          Online
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Storage</span>
                        <span className="text-sm text-green-600 flex items-center" data-testid="storage-status">
                          <div className="w-2 h-2 bg-green-600 rounded-full mr-1"></div>
                          Normal
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">API</span>
                        <span className="text-sm text-green-600 flex items-center" data-testid="api-status">
                          <div className="w-2 h-2 bg-green-600 rounded-full mr-1"></div>
                          Aktif
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
