import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/AppLayout";
import { api, type User, type Pagination } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Select } from "@/components/ui/select";

export default function AdminUsers() {
  const queryClient = useQueryClient();
  const { data } = useQuery<{ data: User[]; pagination: Pagination }>({
    queryKey: ["admin-users"],
    queryFn: () => api.admin.listUsers(),
  });
  const users = data?.data || [];

  const updateRole = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) => api.admin.updateRole(id, role),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  const deleteUser = useMutation({
    mutationFn: (id: string) => api.admin.deleteUser(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="font-display text-2xl font-bold">Users</h1>
        <div className="grid gap-4">
          {users.map((u) => (
            <div key={u.id} className="flex items-center justify-between p-4 border rounded">
              <div>
                <div className="font-medium">{u.firstName} {u.lastName}</div>
                <div className="text-sm text-muted-foreground">{u.email}</div>
              </div>
              <div className="flex items-center gap-3">
                <select className="rounded-md border px-2 py-1" value={u.role} onChange={(e) => updateRole.mutate({ id: u.id, role: e.target.value })}>
                  <option value="admin">admin</option>
                  <option value="tutor">tutor</option>
                  <option value="student">student</option>
                </select>
                <Button variant="destructive" onClick={() => { if (confirm("Delete user?")) deleteUser.mutate(u.id); }}>
                  Delete
                </Button>
              </div>
            </div>
          ))}
          {users.length === 0 && <div className="text-sm text-muted-foreground">No users found</div>}
        </div>
      </div>
    </AppLayout>
  );
}
