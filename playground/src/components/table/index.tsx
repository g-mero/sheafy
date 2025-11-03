import { createMemo, For, Index } from "solid-js";

type TableProps = {
  data: string[][];
  headers?: string[];
  striped?: boolean;
};

export function Table(props: TableProps) {
  // Determine if first row should be used as headers
  const headers = createMemo(() => {
    if (props.headers) {
      return props.headers;
    }
    if (props.data.length > 0) {
      return props.data[0];
    }
    return [];
  });

  // Get data rows (excluding headers if they're from data)
  const rows = createMemo(() => {
    if (props.headers) {
      return props.data;
    }
    return props.data.slice(1);
  });

  const getRowClass = (rowIndex: number) => {
    if (!props.striped) {
      return "bg-white";
    }
    return rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50";
  };

  return (
    <div class={"overflow-auto"}>
      <table class="min-w-full bg-white border border-gray-200">
        {headers().length > 0 && (
          <thead class="bg-gray-50">
            <tr>
              <Index each={headers()}>
                {(header) => (
                  <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    {header()}
                  </th>
                )}
              </Index>
            </tr>
          </thead>
        )}
        <tbody class="bg-white divide-y divide-gray-200">
          <Index each={rows()}>
            {(row, rowIndex) => (
              <tr class={getRowClass(rowIndex)}>
                <For each={row()}>
                  {(cell) => (
                    <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900 border-b">
                      {cell}
                    </td>
                  )}
                </For>
              </tr>
            )}
          </Index>
        </tbody>
      </table>
    </div>
  );
}
