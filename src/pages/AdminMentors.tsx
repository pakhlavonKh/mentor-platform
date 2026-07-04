import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/AppLayout";
import { api, type User, type Pagination } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Power, PowerOff } from "lucide-react";

export default function AdminMentors() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    password: "",
  });

  const { data } = useQuery<{ data: User[]; pagination: Pagination }>({
    queryKey: ["admin-mentors"],
    queryFn: () => api.admin.listMentors(),
  });
  const mentors = data?.data || [];

  const createMentor = useMutation({
    mutationFn: (payload: typeof formData) => api.admin.createMentor(payload),
    onSuccess: () => {
      toast.success("Mentor created successfully");
      setFormData({ email: "", firstName: "", lastName: "", password: "" });
      setShowCreateForm(false);
      queryClient.invalidateQueries({ queryKey: ["admin-mentors"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create mentor");
    },
  });

  const deactivateMentor = useMutation({
    mutationFn: (id: string) => api.admin.deactivateMentor(id),
    onSuccess: () => {
      toast.success("Mentor deactivated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-mentors"] });
    },
  });

  const reactivateMentor = useMutation({
    mutationFn: (id: string) => api.admin.reactivateMentor(id),
    onSuccess: () => {
      toast.success("Mentor reactivated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-mentors"] });
    },
  });

  const deleteMentor = useMutation({
    mutationFn: (id: string) => api.admin.deleteMentor(id),
    onSuccess: () => {
      toast.success("Mentor deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-mentors"] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.firstName || !formData.lastName || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }
    createMentor.mutate(formData);
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold">{t("admin.mentors") || "Mentors"}</h1>
            <p className="text-muted-foreground mt-1">Create and manage mentor accounts</p>
          </div>
          <Button onClick={() => setShowCreateForm(!showCreateForm)} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Mentor
          </Button>
        </div>

        {showCreateForm && (
          <Card>
            <CardHeader>
              <CardTitle>Create New Mentor</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input
                    placeholder="Email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                  <Input
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                  />
                  <Input
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                  />
                  <Input
                    placeholder="Password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={createMentor.isPending}>
                    {createMentor.isPending ? "Creating..." : "Create Mentor"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4">
          {mentors.map((mentor) => (
            <Card key={mentor.id} className={mentor.isActive ? "" : "opacity-60"}>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="font-medium">{mentor.firstName} {mentor.lastName}</div>
                        <div className="text-sm text-muted-foreground">{mentor.email}</div>
                      </div>
                      {!mentor.isActive && (
                        <Badge variant="outline" className="text-destructive">
                          Deactivated
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {mentor.isActive ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deactivateMentor.mutate(mentor.id)}
                        disabled={deactivateMentor.isPending}
                        className="gap-1"
                      >
                        <PowerOff className="h-4 w-4" />
                        Deactivate
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => reactivateMentor.mutate(mentor.id)}
                        disabled={reactivateMentor.isPending}
                        className="gap-1"
                      >
                        <Power className="h-4 w-4" />
                        Reactivate
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        if (confirm("Are you sure you want to delete this mentor?")) {
                          deleteMentor.mutate(mentor.id);
                        }
                      }}
                      disabled={deleteMentor.isPending}
                      className="gap-1"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {mentors.length === 0 && (
            <div className="text-center py-12 text-sm text-muted-foreground">
              No mentors found. Create your first mentor using the button above.
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
