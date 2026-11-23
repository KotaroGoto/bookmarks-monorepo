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

async function onReload(): Promise<void> {
  dispatch({ type: "load-started" });
  dispatch(await load());
}

async function onSubmit(event: SubmitEvent): Promise<void> {
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
}

async function onListClick(event: MouseEvent): Promise<void> {
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
}

reload.addEventListener("click", () => void onReload());
form.addEventListener("submit", (event) => void onSubmit(event));
list.addEventListener("click", (event) => void onListClick(event));

render(state);
