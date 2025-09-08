import { useLocation } from "wouter";
import { 
  LayoutDashboard, 
  FileText, 
  Tag, 
  Users, 
  Image, 
  Settings, 
  LogOut 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logout } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

const sidebarItems = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Kelola Berita",
    href: "/admin/articles",
    icon: FileText,
  },
  {
    label: "Kategori",
    href: "/admin/categories",
    icon: Tag,
  },
  {
    label: "Pengguna",
    href: "/admin/users",
    icon: Users,
  },
  {
    label: "Media",
    href: "/admin/uploads",
    icon: Image,
  },
];

export default function AdminSidebar() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      toast({
        title: "Logout berhasil",
        description: "Anda telah keluar dari admin panel",
      });
      queryClient.clear();
      setLocation("/admin/login");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Gagal logout",
        variant: "destructive",
      });
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="w-64 bg-card shadow-lg border-r border-border h-full">
      <div className="p-6 border-b border-border">
        <h1 className="text-xl font-bold text-primary" data-testid="sidebar-logo">NewsPortal</h1>
        <p className="text-sm text-muted-foreground">Admin Dashboard</p>
      </div>
      
      <nav className="mt-6">
        <div className="px-4 space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href || 
              (location === "/admin" && item.href === "/admin/dashboard");
            
            return (
              <Button
                key={item.href}
                variant={isActive ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setLocation(item.href)}
                data-testid={`sidebar-${item.href.split('/').pop()}`}
              >
                <Icon className="mr-3 h-4 w-4" />
                {item.label}
              </Button>
            );
          })}
        </div>
        
        <div className="px-4 mt-8">
          <div className="border-t border-border pt-4">
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground hover:text-foreground"
              data-testid="sidebar-settings"
            >
              <Settings className="mr-3 h-4 w-4" />
              Pengaturan
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              data-testid="sidebar-logout"
            >
              <LogOut className="mr-3 h-4 w-4" />
              {logoutMutation.isPending ? "Keluar..." : "Keluar"}
            </Button>
          </div>
        </div>
      </nav>
    </div>
  );
}
