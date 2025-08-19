export function isXlsxByMime(file: File): boolean {
  return (
    file.type ===
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
}
