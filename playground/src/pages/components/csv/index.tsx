import { createSignal } from 'solid-js';
import { parseCSVFromFile } from '~/csv/csv-parser';
import { FilePicker } from '~components/file-picker';
import { Table } from '~components/table';

interface ParsedResult {
  headers?: string[];
  rows: string[][];
  error?: string;
}

export default function Index() {
  const [parsedData, setParsedData] = createSignal<ParsedResult | null>(null);

  return (
    <div class="p-4 max-w-4xl mx-auto">
      <FilePicker
        onChange={async (f) => {
          if (f) {
            try {
              // Use the new encoding-aware function
              const result = await parseCSVFromFile(f, { encoding: 'auto' });
              setParsedData(result);
            } catch (error) {
              const errorMessage =
                error instanceof Error ? error.message : 'Failed to read file';
              setParsedData({ rows: [], error: errorMessage });
            }
          }
        }}
        placeholder="Select CSV File"
      />

      {parsedData() && (
        <div class="mt-4">
          <h3 class="text-lg font-semibold mb-2">Parsed Result:</h3>
          {parsedData()?.error ? (
            <div class="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              Error: {parsedData()?.error}
            </div>
          ) : (
            <Table
              data={parsedData()?.rows || []}
              headers={parsedData()?.headers}
              striped={true}
            />
          )}
        </div>
      )}
    </div>
  );
}
