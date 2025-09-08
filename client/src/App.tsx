import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import ArticleDetail from "@/pages/article-detail";
import Category from "@/pages/category";
import AdminLogin from "@/pages/admin/login";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminArticles from "@/pages/admin/articles";
import AdminCategories from "@/pages/admin/categories";
import AdminUsers from "@/pages/admin/users";
import ArticleEditor from "@/pages/admin/article-editor";

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={Home} />
      <Route path="/article/:slug" component={ArticleDetail} />
      <Route path="/category/:slug" component={Category} />
      
      {/* Admin routes */}
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/articles" component={AdminArticles} />
      <Route path="/admin/articles/new" component={ArticleEditor} />
      <Route path="/admin/articles/:id/edit" component={ArticleEditor} />
      <Route path="/admin/categories" component={AdminCategories} />
      <Route path="/admin/users" component={AdminUsers} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
