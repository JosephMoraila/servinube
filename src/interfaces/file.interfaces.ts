/**
 * Interface representing a file upload progress
 * @interface
 * @property {string} name - The name of the file being uploaded
 * @property {number} progress - The upload progress percentage (0-100)
 */
export interface FileProgress {
  name: string;
  progress: number;
}

/**
 * Interface representing a file item in the file system
 * @interface
 */
export interface FileItem {
  name: string;
  isDirectory: boolean;
  mimeType?: string | null;
}

/**
 * Interface representing the state of a file preview
 * @interface
 */
export interface PreviewState {
  url: string;
  type: string;
  name: string;
}

/**
 * Interface representing the state of a delete dialog
 * @interface
 */
export interface DeleteDialogState {
  isOpen: boolean;
  fileName: string;
  isDirectory: boolean;
}
