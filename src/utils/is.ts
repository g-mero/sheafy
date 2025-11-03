export const isNumber = (value: any): value is number => {
  try {
    return Number(value) === value;
  } catch {
    return false;
  }
};

export function isXlsxByMime(file: File): boolean {
  return (
    file.type ===
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
}
