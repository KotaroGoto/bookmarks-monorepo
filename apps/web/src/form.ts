// フォームの入力値を、名前をキーにした文字列のオブジェクトとして取り出す
export function getFormValues<K extends string>(
  form: HTMLFormElement,
  names: readonly K[],
): Record<K, string> {
  const data = new FormData(form);
  const out = {} as Record<K, string>;
  for (const name of names) {
    const value = data.get(name);
    out[name] = typeof value === "string" ? value : "";
  }
  return out;
}
