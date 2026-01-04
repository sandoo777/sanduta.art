import { EditorElement } from './editorStore';

export interface ProjectCanvas {
  width: number;
  height: number;
  background?: string;
}

export interface ProjectVersion {
  versionId: string;
  timestamp: Date;
  elements: EditorElement[];
  canvas: ProjectCanvas;
}

export interface Project {
  id: string;
  name: string;
  userId: string | null;
  createdAt: Date;
  updatedAt: Date;
  thumbnailUrl: string | null;
  elements: EditorElement[];
  canvas: ProjectCanvas;
  versions: ProjectVersion[];
}

export interface ProjectMetadata {
  id: string;
  name: string;
  thumbnailUrl: string | null;
  updatedAt: Date;
  createdAt: Date;
}

export type SaveStatus = 'saved' | 'saving' | 'error' | 'idle';
