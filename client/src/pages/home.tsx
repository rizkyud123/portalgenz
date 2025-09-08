import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import ArticleCard from "@/components/article-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const [, setLocation] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 6;

  // Get search query from URL
  const urlParams = new URLSearchParams(window.location.search);
  const searchQuery = urlParams.get('search') || "";

  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
  });

  const { data: featuredArticle, isLoading: featuredLoading } = useQuery({
    queryKey: ["/api/articles/featured/latest"],
  });

  const { data: articlesData, isLoading: articlesLoading } = useQuery({
    queryKey: selectedCategory 
      ? ["/api/articles", "category", selectedCategory, limit, (currentPage - 1) * limit]
      : searchQuery
      ? ["/api/articles", "search", searchQuery, limit, (currentPage - 1) * limit]
      : ["/api/articles", limit, (currentPage - 1) * limit],
  });

  const articles = articlesData?.articles || [];
  const totalArticles = articlesData?.total || 0;
  const totalPages = Math.ceil(totalArticles / limit);

  const handleCategoryFilter = (categorySlug: string) => {
    setSelectedCategory(categorySlug);
    setCurrentPage(1);
    // Update URL without search param when filtering by category
    if (categorySlug) {
      setLocation(`/?category=${categorySlug}`);
    } else {
      setLocation('/');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="text-white">
              {featuredLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-8 w-3/4 bg-white/20" />
                  <Skeleton className="h-4 w-full bg-white/20" />
                  <Skeleton className="h-4 w-2/3 bg-white/20" />
                  <Skeleton className="h-10 w-40 bg-white/20" />
                </div>
              ) : featuredArticle ? (
                <>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4" data-testid="featured-title">
                    {featuredArticle.title}
                  </h2>
                  <p className="text-lg mb-6 text-primary-foreground/90" data-testid="featured-excerpt">
                    {featuredArticle.excerpt}
                  </p>
                  <div className="flex items-center space-x-4 mb-6">
                    <span className="bg-white/20 px-3 py-1 rounded-full text-sm" data-testid="featured-category">
                      {featuredArticle.category.name}
                    </span>
                    <span className="text-sm" data-testid="featured-date">
                      {new Date(featuredArticle.publishedAt || featuredArticle.createdAt).toLocaleDateString('id-ID')}
                    </span>
                  </div>
                  <Button 
                    className="bg-white text-primary hover:bg-gray-100 transition"
                    onClick={() => setLocation(`/article/${featuredArticle.slug}`)}
                    data-testid="featured-read-more"
                  >
                    Baca Selengkapnya
                  </Button>
                </>
              ) : (
                <div className="text-center py-12">
                  <h2 className="text-2xl font-bold mb-4">Selamat Datang di NewsPortal</h2>
                  <p className="text-lg">Portal berita terpercaya untuk informasi terkini</p>
                </div>
              )}
            </div>
            <div className="hidden lg:block">
              {featuredArticle?.featuredImage && (
                <img
                  src={featuredArticle.featuredImage}
                  alt={featuredArticle.title}
                  className="rounded-xl shadow-2xl w-full h-auto"
                  data-testid="featured-image"
                />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Latest News Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-foreground" data-testid="latest-news-title">
            {searchQuery ? `Hasil pencarian: "${searchQuery}"` : 'Berita Terbaru'}
          </h2>
          <div className="flex space-x-2 overflow-x-auto">
            <Button
              variant={selectedCategory === "" ? "default" : "outline"}
              size="sm"
              onClick={() => handleCategoryFilter("")}
              data-testid="filter-all"
            >
              Semua
            </Button>
            {categories.slice(0, 4).map((category: any) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.slug ? "default" : "outline"}
                size="sm"
                onClick={() => handleCategoryFilter(category.slug)}
                data-testid={`filter-${category.slug}`}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        {articlesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {Array.from({ length: 6 }).map((_, i) => (
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8" data-testid="articles-grid">
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
              {searchQuery ? 'Tidak ada artikel yang ditemukan untuk pencarian ini.' : 'Belum ada artikel yang tersedia.'}
            </p>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
