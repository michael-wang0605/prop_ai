export function clsx(...xs: Array<string | false | undefined>) {
  return xs.filter(Boolean).join(" ");
}

export const pretty = (x: unknown) => {
  try {
    return JSON.stringify(x, null, 2);
  } catch {
    return String(x);
  }
};