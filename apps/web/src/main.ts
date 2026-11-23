import { qs } from "./dom.ts";
import { getFormValues } from "./form.ts";
import { transition } from "./transition.ts";
import { render } from "./render.ts";
import type { Action, ListState } from "./types.ts";
import { addBookmark, removeBookmark } from "./api.ts";
import { load } from "./load.ts";

let state: ListState = { status: "idle" };

function dispatch(action: Action): void {
  state = transition(state, action);
  render(state);
}

function messageOf(e: unknown): string {
  return e instanceof Error ? e.message : "通信に失敗しました";
}

const form = qs<HTMLFormElement>("#bookmark-form");
const list = qs<HTMLUListElement>("#list");
const reload = qs<HTMLButtonElement>("#reload");
const FIELDS = ["url", "title", "tags"] as const;

reload.addEventListener("click", async () => {
  dispatch({ type: "load-started" });
  dispatch(await load());
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const values = getFormValues(form, FIELDS);
  try {
    const item = await addBookmark({
      title: values.title,
      url: values.url,
      tags: values.tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t !== ""),
      note: null,
    });
    dispatch({ type: "added", item });
    form.reset();
  } catch (e) {
    dispatch({ type: "load-failed", message: messageOf(e) });
  }
});
list.addEventListener("click", async (event) => {
  const button = event.target;
  if (!(button instanceof HTMLButtonElement)) return;
  const id = button.dataset.id;
  if (id === undefined) return;
  try {
    await removeBookmark(id);
    dispatch({ type: "removed", id });
  } catch (e) {
    dispatch({ type: "load-failed", message: messageOf(e) });
  }
});
render(state);
