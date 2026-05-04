import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/AppLayout";
import { api, type Submission, type User, type Pagination } from "@/lib/api";
import ReviewerPicker from "@/components/ReviewerPicker";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function AdminSubmissions() {
  const queryClient = useQueryClient();
  const searchParams = new URLSearchParams(window.location.search);
  const reviewerIdFilter = searchParams.get("reviewerId") || undefined;
  const { data } = useQuery<{ data: Submission[]; pagination: Pagination }>({
    queryKey: ["admin-submissions", reviewerIdFilter],
    queryFn: () => api.submissions.adminList(reviewerIdFilter ? { reviewerId: reviewerIdFilter } : undefined),
  });
  const submissions = data?.data || [];
  const { data: usersData } = useQuery<{ data: User[]; pagination: Pagination }>({
    queryKey: ["admin-users"],
    queryFn: () => api.admin.listUsers(),
  });
  const mentors = (usersData?.data || []).filter((u) => u.role === "tutor");

  const assignMut = useMutation({ mutationFn: ({ id, reviewerId }: { id: string; reviewerId: string }) => api.submissions.assign(id, reviewerId), onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-submissions"] }) });
  const statusMut = useMutation({ mutationFn: ({ id, status }: { id: string; status: string }) => api.submissions.updateStatus(id, status), onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-submissions"] }) });
  const feedbackMut = useMutation({ mutationFn: ({ id, feedback }: { id: string; feedback: string }) => api.submissions.addFeedback(id, feedback), onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-submissions"] }) });

  const [feedbackMap, setFeedbackMap] = useState<Record<string, string>>({});
  const [assignMap, setAssignMap] = useState<Record<string, string>>({});

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="font-display text-2xl font-bold">Submissions</h1>
        <div className="grid gap-4">
          {submissions.map((s) => (
            <div key={s.id} className="p-4 border rounded">
              <div className="flex justify-between">
                <div>
                  <div className="font-medium">Submission by {s.user?.firstName} {s.user?.lastName}</div>
                  <div className="text-sm text-muted-foreground">Status: {s.status} {s.reviewer ? `• Reviewer: ${s.reviewer.firstName} ${s.reviewer.lastName}` : ""}</div>
                </div>
                <div className="flex items-center gap-2">
                  <ReviewerPicker
                    mentors={mentors}
                    value={assignMap[s.id] || ""}
                    onChange={(id) => setAssignMap({ ...assignMap, [s.id]: id })}
                  />
                  <Button onClick={() => { if (!assignMap[s.id]) return toast.error("Select reviewer"); assignMut.mutate({ id: s.id, reviewerId: assignMap[s.id] }); }}>Assign</Button>
                </div>
              </div>

              <div className="mt-3 space-y-2">
                <div className="text-sm text-muted-foreground">Files:</div>
                <ul className="list-disc pl-5">
                  {s.files.map((f) => (
                    <li key={f.filename}><a href={f.url || f.path} target="_blank" rel="noreferrer" className="text-primary underline">{f.originalName}</a></li>
                  ))}
                </ul>
              </div>

              <div className="mt-3 flex gap-2">
                <Button onClick={() => statusMut.mutate({ id: s.id, status: "in_review" })}>Mark In Review</Button>
                <Button onClick={() => statusMut.mutate({ id: s.id, status: "completed" })}>Mark Completed</Button>
                <Button variant="destructive" onClick={() => statusMut.mutate({ id: s.id, status: "rejected" })}>Reject</Button>
              </div>

              <div className="mt-3">
                <Textarea placeholder="Enter feedback" value={feedbackMap[s.id] || ""} onChange={(e) => setFeedbackMap({ ...feedbackMap, [s.id]: e.target.value })} />
                <div className="mt-2 flex gap-2">
                  <Button onClick={() => { feedbackMut.mutate({ id: s.id, feedback: feedbackMap[s.id] || "" }); }}>Send Feedback</Button>
                </div>
              </div>
            </div>
          ))}
          {submissions.length === 0 && <div className="text-sm text-muted-foreground">No submissions found</div>}
        </div>
      </div>
    </AppLayout>
  );
}
