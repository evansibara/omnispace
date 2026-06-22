import { useState } from "react";
import { Send, MessageSquareText } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/feedback/empty-state";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { formatRelativeTime } from "@/lib/formatters";
import { useProjectComments } from "../hooks/useProjectComments";
import { usePostComment } from "../hooks/usePostComment";

export function FeedbackThread({ projectId }: { projectId: string }) {
  const { data: comments, isLoading } = useProjectComments(projectId);
  const postComment = usePostComment(projectId);
  const [body, setBody] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = body.trim();
    if (!trimmed) return;
    postComment.mutate({ projectId, body: trimmed }, { onSuccess: () => setBody("") });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Feedback &amp; questions</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {isLoading && <p className="text-sm text-[var(--color-text-muted)]">Loading the thread…</p>}

        {!isLoading && comments && comments.length === 0 && (
          <EmptyState
            icon={MessageSquareText}
            title="No comments yet"
            description="Leave the first note for your project team below."
          />
        )}

        {!isLoading && comments && comments.length > 0 && (
          <ul className="flex flex-col gap-4">
            {comments.map((comment) => (
              <li key={comment.id} className="flex gap-3">
                <Avatar name={comment.author.fullName} src={comment.author.avatarUrl} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <p className="text-sm font-medium text-[var(--color-text-primary)]">
                      {comment.author.fullName}
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {formatRelativeTime(comment.createdAt)}
                    </p>
                  </div>
                  <p className="mt-0.5 text-sm text-[var(--color-text-secondary)]">{comment.body}</p>
                </div>
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-2 border-t border-[var(--color-border-subtle)] pt-4">
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Share feedback or ask a question…"
            rows={2}
            aria-label="Write a comment"
          />
          <div className="flex justify-end">
            <Button type="submit" size="sm" isLoading={postComment.isPending} disabled={!body.trim()}>
              <Send className="h-3.5 w-3.5" />
              Send
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
