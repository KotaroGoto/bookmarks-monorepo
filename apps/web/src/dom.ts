export function qs<T extends Element>(
  selector: string,
  root: ParentNode = document,
): T {
  const el = root.querySelector<T>(selector);
  if (!el) {
    throw new Error(`要素が見つかりません: ${selector}`);
  }
  return el;
}
