import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/AppLayout";
import { api, type User, type Pagination } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function TutorsPage() {
  const navigate = useNavigate();
  const { data } = useQuery<{ data: User[]; pagination: Pagination }>({
    queryKey: ["admin-users"],
    queryFn: () => api.admin.listUsers(),
  });
  const tutors = (data?.data || []).filter((u) => u.role === "tutor");

  const tutorIds = tutors.map((t) => t.id);
  const { data: countsData } = useQuery<Record<string, number>>({
    queryKey: ["tutor-counts", tutorIds],
    queryFn: async () => {
      const map: Record<string, number> = {};
      await Promise.all(
        tutors.map(async (t) => {
          const res = await api.submissions.adminList({ reviewerId: t.id, limit: "1" });
          map[t.id] = res.pagination.total;
        }),
      );
      return map;
    },
    enabled: tutors.length > 0,
  });

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="font-display text-2xl font-bold">Tutors</h1>
        <div className="grid gap-4">
          {tutors.map((t) => (
            <div key={t.id} className="flex items-center justify-between p-4 border rounded">
              <div>
                <div className="font-medium">{t.firstName} {t.lastName}</div>
                <div className="text-sm text-muted-foreground">{t.email}</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-sm text-muted-foreground">Assigned: {countsData?.[t.id] ?? "-"}</div>
                <Button onClick={() => navigate(`/admin/submissions?reviewerId=${t.id}`)}>View assigned</Button>
              </div>
            </div>
          ))}
          {tutors.length === 0 && <div className="text-sm text-muted-foreground">No tutors found</div>}
        </div>
      </div>
    </AppLayout>
  );
}
