import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { postComment } from "../api/portal.api";
import { useAuthStore } from "@/store/useAuthStore";
import type { ApiError, Comment, CreateCommentPayload } from "@/types";

export function usePostComment(projectId: string) {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const queryKey = ["projects", projectId, "comments"];

  return useMutation<Comment, ApiError, CreateCommentPayload, { previous: Comment[] | undefined }>({
    mutationFn: postComment,

    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<Comment[]>(queryKey);

      if (user) {
        const optimisticComment: Comment = {
          id: `optimistic-${Date.now()}`,
          projectId: payload.projectId,
          taskId: payload.taskId ?? null,
          author: { id: user.id, fullName: user.fullName, avatarUrl: user.avatarUrl, role: user.role },
          body: payload.body,
          createdAt: new Date().toISOString(),
        };
        queryClient.setQueryData<Comment[]>(queryKey, (current) => [
          ...(current ?? []),
          optimisticComment,
        ]);
      }

      return { previous };
    },

    onError: (error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
      toast.error(error.message || "Couldn't post your comment.");
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}
