export interface DialogInputProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (value: string) => void;
  title: string;
  description: string;
  confirmText: string;
  cancelText: string;
  placeholder: string;
  typeInput: string;
}

export interface ModalPreviewFileProps {
  preview: {
    url: string;
    type: string;
    name: string;
  };
  onClose: () => void;
  onDownload: (fileName: string) => void;
}

export interface UploadProgressProps {
  uploadProgress: Array<{
    name: string;
    progress: number;
  }>;
}

export interface ContextMenuProps {
  x: number;
  y: number;
  file: string;
  isDirectory: boolean;
  onDownload: (file: string) => void;
  onDelete: (file: string, isDirectory: boolean) => void;
}

export interface ContextMenuState {
  x: number;
  y: number;
  file: string;
  isDirectory: boolean;
}
