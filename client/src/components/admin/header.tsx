import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
}

export default function AdminHeader({ title, subtitle }: AdminHeaderProps) {
  const { user } = useAuth();

  return (
    <header className="bg-card shadow-sm border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-card-foreground" data-testid="admin-header-title">
            {title}
          </h2>
          {subtitle && (
            <p className="text-sm text-muted-foreground" data-testid="admin-header-subtitle">
              {subtitle}
            </p>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" className="relative" data-testid="notifications-button">
            <Bell className="h-4 w-4" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-destructive rounded-full"></span>
          </Button>
          
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-medium">
              {user?.firstName?.[0] || user?.username?.[0] || "A"}
            </div>
            <div className="text-right">
              <p className="text-sm font-medium" data-testid="current-user-name">
                {user?.firstName && user?.lastName 
                  ? `${user.firstName} ${user.lastName}` 
                  : user?.username || "Admin User"}
              </p>
              <p className="text-xs text-muted-foreground" data-testid="current-user-role">
                {user?.role === 'admin' ? 'Administrator' : 'Editor'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
