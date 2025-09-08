import { Link } from "wouter";
import { Facebook, Twitter, Instagram, Youtube } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function Footer() {
  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
  });

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-xl font-bold mb-4" data-testid="footer-logo">NewsPortal</h3>
            <p className="text-gray-300 mb-4" data-testid="footer-description">
              Portal berita terpercaya yang menyajikan informasi terkini dari berbagai bidang dengan akurat dan terpercaya.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-white transition" data-testid="social-facebook">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition" data-testid="social-twitter">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition" data-testid="social-instagram">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition" data-testid="social-youtube">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4" data-testid="footer-categories-title">Kategori</h4>
            <ul className="space-y-2 text-sm">
              {categories.slice(0, 6).map((category: any) => (
                <li key={category.id}>
                  <Link href={`/category/${category.slug}`}>
                    <a className="text-gray-300 hover:text-white transition" data-testid={`footer-category-${category.slug}`}>
                      {category.name}
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4" data-testid="footer-about-title">Tentang</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-300 hover:text-white transition" data-testid="footer-about-us">Tentang Kami</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition" data-testid="footer-contact">Kontak</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition" data-testid="footer-privacy">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition" data-testid="footer-terms">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-300">
          <p data-testid="footer-copyright">&copy; 2024 NewsPortal. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
