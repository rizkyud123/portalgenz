import { useQuery } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { Facebook, Twitter, Share } from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import ArticleCard from "@/components/article-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function ArticleDetail() {
  const [, params] = useRoute("/article/:slug");
  const [, setLocation] = useLocation();
  const slug = params?.slug;

  const { data: article, isLoading, error } = useQuery({
    queryKey: ["/api/articles", slug],
    enabled: !!slug,
  });

  const { data: relatedArticles = [] } = useQuery({
    queryKey: ["/api/articles", article?.id, "related"],
    enabled: !!article?.id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="aspect-video w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-foreground mb-4">Artikel tidak ditemukan</h1>
            <p className="text-muted-foreground mb-6">Artikel yang Anda cari tidak tersedia atau telah dihapus.</p>
            <Button onClick={() => setLocation("/")} data-testid="back-home-button">
              Kembali ke Beranda
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const timeAgo = formatDistanceToNow(new Date(article.publishedAt || article.createdAt), {
    addSuffix: true,
    locale: id,
  });

  const shareUrl = window.location.href;
  const shareText = article.title;

  const handleShare = (platform: string) => {
    let url = "";
    if (platform === "facebook") {
      url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    } else if (platform === "twitter") {
      url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    } else if (platform === "whatsapp") {
      url = `https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}`;
    }
    
    if (url) {
      window.open(url, "_blank", "width=600,height=400");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex mb-6 text-sm" data-testid="breadcrumb">
          <button onClick={() => setLocation("/")} className="text-primary hover:underline">
            Beranda
          </button>
          <span className="mx-2 text-muted-foreground">/</span>
          <button 
            onClick={() => setLocation(`/category/${article.category.slug}`)}
            className="text-primary hover:underline"
            data-testid="breadcrumb-category"
          >
            {article.category.name}
          </button>
          <span className="mx-2 text-muted-foreground">/</span>
          <span className="text-muted-foreground">Article</span>
        </nav>

        {/* Article Header */}
        <header className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium" data-testid="article-category">
              {article.category.name}
            </span>
            <span className="text-sm text-muted-foreground" data-testid="article-date">
              {new Date(article.publishedAt || article.createdAt).toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })} • {timeAgo}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4" data-testid="article-title">
            {article.title}
          </h1>
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-medium">
                {(article.author.firstName?.[0] || article.author.username[0]).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-sm" data-testid="article-author">
                  {article.author.firstName && article.author.lastName 
                    ? `${article.author.firstName} ${article.author.lastName}`
                    : article.author.username}
                </p>
                <p className="text-xs text-muted-foreground">Author</p>
              </div>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        {article.featuredImage && (
          <div className="mb-8">
            <img
              src={article.featuredImage}
              alt={article.title}
              className="w-full h-auto rounded-xl shadow-lg"
              data-testid="article-featured-image"
            />
          </div>
        )}

        {/* Social Share */}
        <div className="flex items-center justify-between border-y border-border py-4 mb-8">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium">Bagikan:</span>
            <Button
              size="sm"
              onClick={() => handleShare("facebook")}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              data-testid="share-facebook"
            >
              <Facebook className="h-4 w-4 mr-2" />
              Facebook
            </Button>
            <Button
              size="sm"
              onClick={() => handleShare("twitter")}
              className="bg-sky-500 hover:bg-sky-600 text-white"
              data-testid="share-twitter"
            >
              <Twitter className="h-4 w-4 mr-2" />
              Twitter
            </Button>
            <Button
              size="sm"
              onClick={() => handleShare("whatsapp")}
              className="bg-green-600 hover:bg-green-700 text-white"
              data-testid="share-whatsapp"
            >
              <Share className="h-4 w-4 mr-2" />
              WhatsApp
            </Button>
          </div>
        </div>

        {/* Article Content */}
        <div 
          className="prose prose-lg max-w-none prose-headings:text-foreground prose-p:text-foreground prose-li:text-foreground prose-strong:text-foreground"
          dangerouslySetInnerHTML={{ __html: article.content }}
          data-testid="article-content"
        />
      </article>

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-border">
          <h2 className="text-2xl font-bold text-foreground mb-6" data-testid="related-articles-title">
            Berita Terkait
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6" data-testid="related-articles-grid">
            {relatedArticles.slice(0, 4).map((relatedArticle: any) => (
              <div key={relatedArticle.id} className="bg-card rounded-xl border border-border p-6">
                {relatedArticle.featuredImage && (
                  <div className="aspect-video mb-4 overflow-hidden rounded-lg">
                    <img
                      src={relatedArticle.featuredImage}
                      alt={relatedArticle.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <h3 className="font-semibold text-lg mb-2 text-card-foreground line-clamp-2">
                  {relatedArticle.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {formatDistanceToNow(new Date(relatedArticle.publishedAt || relatedArticle.createdAt), {
                    addSuffix: true,
                    locale: id,
                  })}
                </p>
                {relatedArticle.excerpt && (
                  <p className="text-muted-foreground text-sm line-clamp-3 mb-3">
                    {relatedArticle.excerpt}
                  </p>
                )}
                <Button
                  variant="link"
                  className="p-0 text-primary"
                  onClick={() => setLocation(`/article/${relatedArticle.slug}`)}
                  data-testid={`related-article-${relatedArticle.id}`}
                >
                  Baca artikel →
                </Button>
              </div>
            ))}
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
