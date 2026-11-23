import { qs } from "./dom.ts";
import { assertNever } from "./assert.ts";
import type { Bookmark } from "@bookmarks/shared";
import type { ListState } from "./types.ts";

const statusEl = qs<HTMLParagraphElement>("#status");
const listEl = qs<HTMLUListElement>("#list");
const formEl = qs<HTMLFormElement>("#bookmark-form");
export function render(state: ListState): void {
  statusEl.textContent = label(state);
  listEl.replaceChildren(...itemsOf(state).map(toItem));
  formEl.hidden = state.status !== "success";
}
function label(state: ListState): string {
  switch (state.status) {
    case "idle":
      return "読み込みボタンを押してください";
    case "loading":
      return "読み込み中";
    case "error":
      return state.message;
    case "success":
      return `${state.items.length} 件`;
  }
}
function itemsOf(state: ListState): readonly Bookmark[] {
  switch (state.status) {
    case "idle":
    case "loading":
    case "error":
      return [];
    case "success":
      return state.items;
    default:
      return assertNever(state);
  }
}

function toItem(bookmark: Bookmark): HTMLLIElement {
  const li = document.createElement("li");
  const a = document.createElement("a");
  a.href = bookmark.url;
  a.textContent = bookmark.title;
  const button = document.createElement("button");
  button.type = "button";
  button.dataset.id = bookmark.id;
  button.textContent = "削除";
  const tags = document.createElement("span");
  tags.textContent = ` [${bookmark.tags.join(", ")}] `;
  li.append(a, tags, button);
  return li;
}
