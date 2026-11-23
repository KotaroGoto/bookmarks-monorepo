import { z } from "zod";
export const Bookmark = z.object({
  id: z.string(),
  title: z.string().min(1),
  url: z.url(),
  tags: z.array(z.string()),
  note: z.string().nullable(),
  createdAt: z.iso.datetime(),
});
export type Bookmark = z.infer<typeof Bookmark>;
export const CreateBookmark = Bookmark.omit({
  id: true,
  createdAt: true,
}).extend({
  tags: z.array(z.string()).default([]),
  note: z.string().nullable().default(null),
});
export const UpdateBookmark = Bookmark.omit({
  id: true,
  createdAt: true,
}).partial();
export type CreateBookmark = z.infer<typeof CreateBookmark>;
export type UpdateBookmark = z.infer<typeof UpdateBookmark>;
export type ErrorBody = {
  error: {
    code: "not_found" | "invalid_body" | "unauthorized";
    message: string;
  };
};
