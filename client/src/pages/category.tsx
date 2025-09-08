import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import ArticleCard from "@/components/article-card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

export default function Category() {
  const [, params] = useRoute("/category/:slug");
  const [, setLocation] = useLocation();
  const categorySlug = params?.slug;
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 9;

  const { data: category, isLoading: categoryLoading, error: categoryError } = useQuery({
    queryKey: ["/api/categories", categorySlug],
    enabled: !!categorySlug,
  });

  const { data: articlesData, isLoading: articlesLoading } = useQuery({
    queryKey: ["/api/articles", { 
      category: categorySlug, 
      limit, 
      offset: (currentPage - 1) * limit,
      orderBy: sortBy
    }],
    enabled: !!categorySlug,
  });

  const articles = articlesData?.articles || [];
  const totalArticles = articlesData?.total || 0;
  const totalPages = Math.ceil(totalArticles / limit);

  if (categoryLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-32 w-full mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, i) => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (categoryError || !category) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-foreground mb-4">Kategori tidak ditemukan</h1>
            <p className="text-muted-foreground mb-6">Kategori yang Anda cari tidak tersedia.</p>
            <Button onClick={() => setLocation("/")} data-testid="back-home-button">
              Kembali ke Beranda
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const categoryColors: Record<string, string> = {
    politik: "from-red-600 to-red-700",
    ekonomi: "from-green-600 to-green-700",
    teknologi: "from-purple-600 to-purple-700",
    olahraga: "from-blue-600 to-blue-700",
    budaya: "from-orange-600 to-orange-700",
    kesehatan: "from-teal-600 to-teal-700",
  };

  const gradientColor = categoryColors[category.slug] || "from-gray-600 to-gray-700";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Category Header */}
      <section className={`bg-gradient-to-r ${gradientColor} text-white`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-4xl font-bold mb-4" data-testid="category-title">
              Berita {category.name}
            </h1>
            <p className="text-lg text-white/90 mb-6" data-testid="category-description">
              {category.description || 
               `Temukan berita ${category.name.toLowerCase()} terkini, analisis mendalam, dan update terbaru dari dunia ${category.name.toLowerCase()}.`
              }
            </p>
            <div className="flex items-center space-x-4 text-sm">
              <span className="bg-white/20 px-3 py-1 rounded-full" data-testid="category-article-count">
                {totalArticles} Artikel
              </span>
              <span data-testid="category-last-updated">Terakhir diperbarui: baru saja</span>
            </div>
          </div>
        </div>
      </section>

      {/* Category Filters */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 border-b border-border">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium">Urutkan:</label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40" data-testid="sort-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Terbaru</SelectItem>
                <SelectItem value="oldest">Terlama</SelectItem>
                <SelectItem value="title">Judul A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {articlesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="bg-card rounded-xl border border-border p-6">
                <Skeleton className="aspect-video w-full mb-4" />
                <Skeleton className="h-4 w-1/4 mb-2" />
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))}
          </div>
        ) : articles.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8" data-testid="category-articles-grid">
              {articles.map((article: any) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center" data-testid="pagination">
                <nav className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                    data-testid="pagination-prev"
                  >
                    Previous
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
                    Next
                  </Button>
                </nav>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12" data-testid="no-articles">
            <p className="text-muted-foreground">
              Belum ada artikel dalam kategori {category.name}.
            </p>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
