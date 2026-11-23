import type { Action, ListState } from "./types.ts";
export function transition(state: ListState, action: Action): ListState {
  switch (action.type) {
    case "load-started":
      return { status: "loading" };
    case "load-succeeded":
      return { status: "success", items: action.items };
    case "load-failed":
      return { status: "error", message: action.message };
    case "added":
      if (state.status !== "success") return state;
      return { status: "success", items: [action.item, ...state.items] };
    case "removed":
      if (state.status !== "success") return state;
      return {
        status: "success",
        items: state.items.filter((item) => item.id !== action.id),
      };
  }
}
