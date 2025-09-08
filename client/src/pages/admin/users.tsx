import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, User, Shield, UserCheck } from "lucide-react";
import AdminSidebar from "@/components/admin/sidebar";
import AdminHeader from "@/components/admin/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";

const userSchema = z.object({
  username: z.string().min(3, "Username minimal 3 karakter"),
  email: z.string().email("Email tidak valid").optional().or(z.literal("")),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  password: z.string().min(6, "Password minimal 6 karakter"),
  role: z.enum(["admin", "editor"]),
});

const updateUserSchema = userSchema.partial().extend({
  password: z.string().optional(),
});

type UserFormData = z.infer<typeof userSchema>;
type UpdateUserFormData = z.infer<typeof updateUserSchema>;

export default function AdminUsers() {
  const { user, isAuthenticated, isLoading: authLoading, isAdmin } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<UserFormData | UpdateUserFormData>({
    resolver: zodResolver(editingUser ? updateUserSchema : userSchema),
  });

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !isAdmin)) {
      setLocation("/admin/login");
    }
  }, [isAuthenticated, isAdmin, authLoading, setLocation]);

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ["/api/admin/users"],
    enabled: isAuthenticated && isAdmin,
  });

  const createUserMutation = useMutation({
    mutationFn: async (data: UserFormData) => {
      const response = await apiRequest('POST', '/api/admin/users', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Berhasil",
        description: "Pengguna berhasil dibuat",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setIsDialogOpen(false);
      reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Gagal membuat pengguna",
        variant: "destructive",
      });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async (data: UpdateUserFormData & { id: string }) => {
      const { id, ...updateData } = data;
      // Remove empty password
      if (!updateData.password) {
        delete updateData.password;
      }
      const response = await apiRequest('PUT', `/api/admin/users/${id}`, updateData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Berhasil",
        description: "Pengguna berhasil diperbarui",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setIsDialogOpen(false);
      setEditingUser(null);
      reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Gagal memperbarui pengguna",
        variant: "destructive",
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/admin/users/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Berhasil",
        description: "Pengguna berhasil dihapus",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Gagal menghapus pengguna",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: UserFormData | UpdateUserFormData) => {
    if (editingUser) {
      updateUserMutation.mutate({ ...data, id: editingUser.id } as UpdateUserFormData & { id: string });
    } else {
      createUserMutation.mutate(data as UserFormData);
    }
  };

  const handleEdit = (userData: any) => {
    setEditingUser(userData);
    setValue('username', userData.username);
    setValue('email', userData.email || '');
    setValue('firstName', userData.firstName || '');
    setValue('lastName', userData.lastName || '');
    setValue('role', userData.role);
    setValue('password', ''); // Don't pre-fill password
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string, username: string) => {
    if (id === user?.id) {
      toast({
        title: "Error",
        description: "Anda tidak dapat menghapus akun sendiri",
        variant: "destructive",
      });
      return;
    }
    
    if (confirm(`Apakah Anda yakin ingin menghapus pengguna "${username}"?`)) {
      deleteUserMutation.mutate(id);
    }
  };

  const handleNewUser = () => {
    setEditingUser(null);
    reset();
    setIsDialogOpen(true);
  };

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

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <div className="flex h-screen bg-muted">
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader 
          title="Pengguna" 
          subtitle="Kelola pengguna dan admin"
        />

        <main className="flex-1 overflow-auto bg-background p-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle data-testid="users-title">Daftar Pengguna</CardTitle>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={handleNewUser} data-testid="create-user-button">
                      <Plus className="h-4 w-4 mr-2" />
                      Tambah Pengguna
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle data-testid="user-dialog-title">
                        {editingUser ? "Edit Pengguna" : "Tambah Pengguna Baru"}
                      </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" data-testid="user-form">
                      <div>
                        <Label htmlFor="username">Username</Label>
                        <Input
                          id="username"
                          {...register('username')}
                          placeholder="Masukkan username"
                          data-testid="user-username-input"
                        />
                        {errors.username && (
                          <p className="text-sm text-destructive mt-1" data-testid="username-error">
                            {errors.username.message}
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          {...register('email')}
                          placeholder="Masukkan email (opsional)"
                          data-testid="user-email-input"
                        />
                        {errors.email && (
                          <p className="text-sm text-destructive mt-1" data-testid="email-error">
                            {errors.email.message}
                          </p>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName">Nama Depan</Label>
                          <Input
                            id="firstName"
                            {...register('firstName')}
                            placeholder="Nama depan (opsional)"
                            data-testid="user-firstname-input"
                          />
                        </div>
                        <div>
                          <Label htmlFor="lastName">Nama Belakang</Label>
                          <Input
                            id="lastName"
                            {...register('lastName')}
                            placeholder="Nama belakang (opsional)"
                            data-testid="user-lastname-input"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="role">Role</Label>
                        <Select onValueChange={(value) => setValue('role', value as 'admin' | 'editor')}>
                          <SelectTrigger data-testid="user-role-select">
                            <SelectValue placeholder="Pilih role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="editor">Editor</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.role && (
                          <p className="text-sm text-destructive mt-1" data-testid="role-error">
                            {errors.role.message}
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <Label htmlFor="password">
                          Password {editingUser && "(kosongkan jika tidak ingin mengubah)"}
                        </Label>
                        <Input
                          id="password"
                          type="password"
                          {...register('password')}
                          placeholder={editingUser ? "Password baru (opsional)" : "Masukkan password"}
                          data-testid="user-password-input"
                        />
                        {errors.password && (
                          <p className="text-sm text-destructive mt-1" data-testid="password-error">
                            {errors.password.message}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex justify-end space-x-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => {
                            setIsDialogOpen(false);
                            setEditingUser(null);
                            reset();
                          }}
                          data-testid="cancel-user-button"
                        >
                          Batal
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={createUserMutation.isPending || updateUserMutation.isPending}
                          data-testid="save-user-button"
                        >
                          {editingUser ? "Perbarui" : "Simpan"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {usersLoading ? (
                <div className="p-6">
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <Skeleton className="w-10 h-10 rounded-full" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Skeleton className="h-8 w-16" />
                          <Skeleton className="h-8 w-16" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : users.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Pengguna</TableHead>
                        <TableHead>Username</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Bergabung</TableHead>
                        <TableHead>Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((userData: any) => (
                        <TableRow key={userData.id} data-testid={`user-row-${userData.id}`}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white text-sm font-medium">
                                {userData.firstName?.[0] || userData.username[0]}
                              </div>
                              <div>
                                <p className="font-medium" data-testid={`user-name-${userData.id}`}>
                                  {userData.firstName && userData.lastName
                                    ? `${userData.firstName} ${userData.lastName}`
                                    : userData.username}
                                </p>
                                {userData.id === user?.id && (
                                  <Badge variant="outline" className="text-xs">
                                    Anda
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <code className="text-sm bg-muted px-2 py-1 rounded" data-testid={`user-username-${userData.id}`}>
                              {userData.username}
                            </code>
                          </TableCell>
                          <TableCell data-testid={`user-email-${userData.id}`}>
                            {userData.email || "-"}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={userData.role === 'admin' ? "default" : "secondary"}
                              data-testid={`user-role-${userData.id}`}
                            >
                              {userData.role === 'admin' ? (
                                <><Shield className="h-3 w-3 mr-1" /> Admin</>
                              ) : (
                                <><UserCheck className="h-3 w-3 mr-1" /> Editor</>
                              )}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground" data-testid={`user-created-${userData.id}`}>
                            {formatDistanceToNow(new Date(userData.createdAt), {
                              addSuffix: true,
                              locale: id,
                            })}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(userData)}
                                data-testid={`edit-user-${userData.id}`}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              {userData.id !== user?.id && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(userData.id, userData.username)}
                                  className="text-destructive hover:text-destructive"
                                  disabled={deleteUserMutation.isPending}
                                  data-testid={`delete-user-${userData.id}`}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground" data-testid="no-users">
                  <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Belum ada pengguna</p>
                  <Button 
                    className="mt-4" 
                    onClick={handleNewUser}
                    data-testid="create-first-user"
                  >
                    Buat Pengguna Pertama
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
