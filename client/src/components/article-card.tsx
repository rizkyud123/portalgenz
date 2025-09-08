import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";

interface ArticleCardProps {
  article: {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    featuredImage?: string;
    publishedAt?: string;
    createdAt: string;
    category: {
      name: string;
      slug: string;
    };
    author: {
      firstName?: string;
      lastName?: string;
      username: string;
    };
  };
}

const categoryColors: Record<string, string> = {
  politik: "bg-red-100 text-red-800",
  ekonomi: "bg-green-100 text-green-800",
  teknologi: "bg-purple-100 text-purple-800",
  olahraga: "bg-blue-100 text-blue-800",
  budaya: "bg-orange-100 text-orange-800",
  kesehatan: "bg-teal-100 text-teal-800",
};

export default function ArticleCard({ article }: ArticleCardProps) {
  const categoryColor = categoryColors[article.category.slug] || "bg-gray-100 text-gray-800";
  const timeAgo = formatDistanceToNow(new Date(article.publishedAt || article.createdAt), {
    addSuffix: true,
    locale: id,
  });

  return (
    <article className="bg-card rounded-xl shadow-sm border border-border overflow-hidden hover:shadow-md transition-shadow" data-testid={`article-card-${article.id}`}>
      <div className="aspect-video overflow-hidden">
        {article.featuredImage ? (
          <img
            src={article.featuredImage}
            alt={article.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            data-testid={`article-image-${article.id}`}
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <span className="text-muted-foreground text-sm">No image</span>
          </div>
        )}
      </div>
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-3">
          <span className={`px-2 py-1 rounded text-xs font-medium ${categoryColor}`} data-testid={`article-category-${article.id}`}>
            {article.category.name}
          </span>
          <span className="text-xs text-muted-foreground" data-testid={`article-time-${article.id}`}>
            {timeAgo}
          </span>
        </div>
        <h3 className="font-semibold text-lg mb-2 text-card-foreground line-clamp-2" data-testid={`article-title-${article.id}`}>
          {article.title}
        </h3>
        {article.excerpt && (
          <p className="text-muted-foreground text-sm mb-4 line-clamp-3" data-testid={`article-excerpt-${article.id}`}>
            {article.excerpt}
          </p>
        )}
        <Link href={`/article/${article.slug}`}>
          <button className="text-primary text-sm font-medium hover:underline" data-testid={`article-read-more-${article.id}`}>
            Baca Selengkapnya →
          </button>
        </Link>
      </div>
    </article>
  );
}
