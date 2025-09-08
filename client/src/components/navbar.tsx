import { useState } from "react";
import { Link } from "wouter";
import { Search, Menu, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/">
                <h1 className="text-xl font-bold text-primary cursor-pointer" data-testid="logo">
                  NewsPortal
                </h1>
              </Link>
            </div>
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-4">
                <Link href="/">
                  <a className="text-foreground hover:text-primary px-3 py-2 text-sm font-medium transition-colors" data-testid="nav-home">
                    Beranda
                  </a>
                </Link>
                {categories.slice(0, 5).map((category: any) => (
                  <Link key={category.id} href={`/category/${category.slug}`}>
                    <a className="text-muted-foreground hover:text-primary px-3 py-2 text-sm font-medium transition-colors" data-testid={`nav-category-${category.slug}`}>
                      {category.name}
                    </a>
                  </Link>
                ))}
              </div>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="hidden md:block">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Cari berita..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-muted border border-border rounded-md pl-10 pr-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                data-testid="search-input"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-muted-foreground" />
              </div>
            </form>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-muted-foreground hover:text-foreground p-2"
              data-testid="mobile-menu-button"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-b border-border">
            <Link href="/">
              <a className="block text-foreground hover:text-primary px-3 py-2 text-sm font-medium" data-testid="mobile-nav-home">
                Beranda
              </a>
            </Link>
            {categories.slice(0, 5).map((category: any) => (
              <Link key={category.id} href={`/category/${category.slug}`}>
                <a className="block text-muted-foreground hover:text-primary px-3 py-2 text-sm font-medium" data-testid={`mobile-nav-category-${category.slug}`}>
                  {category.name}
                </a>
              </Link>
            ))}
            <div className="px-3 py-2">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="Cari berita..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-muted border border-border rounded-md pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                  data-testid="mobile-search-input"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-muted-foreground" />
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
