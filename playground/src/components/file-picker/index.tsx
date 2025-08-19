import { createEffect, createSignal } from 'solid-js';

export interface FilePickerProps {
  value?: File | null;
  onChange?: (file: File | null) => void;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export function FilePicker(props: FilePickerProps) {
  const [fileInputRef, setFileInputRef] = createSignal<HTMLInputElement>();

  // Update file input when value prop changes
  createEffect(() => {
    const input = fileInputRef();
    if (input && !props.value) {
      input.value = '';
    }
  });

  const handleFileChange = (event: Event) => {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] || null;
    props.onChange?.(file);
  };

  const handleClick = () => {
    const input = fileInputRef();
    if (!props.disabled && input) {
      input.click();
    }
  };

  const handleClear = (event: Event) => {
    event.stopPropagation();
    const input = fileInputRef();
    if (input) {
      input.value = '';
    }
    props.onChange?.(null);
  };

  return (
    <div class="flex items-center gap-2">
      <input
        accept={props.accept}
        class="hidden"
        disabled={props.disabled}
        multiple={props.multiple}
        onChange={handleFileChange}
        ref={setFileInputRef}
        type="file"
      />

      <button
        class={`px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${props.className || ''}`}
        disabled={props.disabled}
        onClick={handleClick}
        type="button"
      >
        {props.placeholder || 'Choose File'}
      </button>

      {props.value && (
        <>
          <span class="text-sm text-gray-600">{props.value.name}</span>
          <button
            aria-label={`Remove file ${props.value.name}`}
            class="text-red-500 hover:text-red-700 text-sm disabled:opacity-50"
            disabled={props.disabled}
            onClick={handleClear}
            type="button"
          >
            ✕
          </button>
        </>
      )}
    </div>
  );
}
