import { create } from 'zustand';
import { Template } from './templates/templateList';

export interface EditorElement {
  id: string;
  type: 'text' | 'image' | 'shape';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  opacity?: number;
  zIndex?: number;
  visible?: boolean;
  locked?: boolean;
  name?: string;
  
  // Text-specific properties
  content?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string | number;
  color?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  lineHeight?: number;
  letterSpacing?: number;
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  backgroundColor?: string;
  
  // Image-specific properties
  src?: string;
  brightness?: number;
  contrast?: number;
  saturation?: number;
  blur?: number;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none';
  
  // Shape-specific properties
  shape?: 'rectangle' | 'circle' | 'triangle';
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  strokeStyle?: 'solid' | 'dashed' | 'dotted';
  borderRadius?: number;
  shadow?: {
    offsetX: number;
    offsetY: number;
    blur: number;
    color: string;
  };
}

interface HistoryState {
  elements: EditorElement[];
  selectedElementId: string | null;
}

interface EditorStore {
  // Project info
  projectName: string | null;
  projectId: string | null;
  
  // Canvas state
  elements: EditorElement[];
  selectedElementId: string | null;
  selectedElementIds: string[]; // Multi-select
  zoom: number;
  canvasSize: { width: number; height: number };
  
  // Drag state
  isDragging: boolean;
  isResizing: boolean;
  isRotating: boolean;
  
  // History
  history: HistoryState[];
  historyIndex: number;
  
  // Actions
  setProjectName: (name: string) => void;
  setProjectId: (id: string) => void;
  setCanvasSize: (size: { width: number; height: number }) => void;
  setZoom: (zoom: number) => void;
  
  // Element actions
  addElement: (element: EditorElement) => void;
  updateElement: (id: string, updates: Partial<EditorElement>) => void;
  deleteElement: (id: string) => void;
  selectElement: (id: string | null, multi?: boolean) => void;
  selectElements: (ids: string[]) => void;
  reorderElements: (elements: EditorElement[]) => void;
  reorderLayers: (ids: string[]) => void;
  toggleLayerVisibility: (id: string) => void;
  toggleLayerLock: (id: string) => void;
  renameLayer: (id: string, name: string) => void;
  
  // Transform actions
  moveElement: (id: string, x: number, y: number) => void;
  resizeElement: (id: string, width: number, height: number) => void;
  rotateElement: (id: string, rotation: number) => void;
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;
  
  // State setters
  setIsDragging: (value: boolean) => void;
  setIsResizing: (value: boolean) => void;
  setIsRotating: (value: boolean) => void;
  
  // History actions
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  saveToHistory: () => void;
  
  // Template actions
  loadTemplate: (template: Template) => void;
}

export const useEditorStore = create<EditorStore>((set, get) => ({
  // Initial state
  projectName: null,
  projectId: null,
  elements: [],
  selectedElementId: null,
  selectedElementIds: [],
  zoom: 1,
  canvasSize: { width: 800, height: 600 },
  isDragging: false,
  isResizing: false,
  isRotating: false,
  history: [],
  historyIndex: -1,
  
  // Basic setters
  setProjectName: (name) => set({ projectName: name }),
  setProjectId: (id) => set({ projectId: id }),
  setCanvasSize: (size) => set({ canvasSize: size }),
  setZoom: (zoom) => set({ zoom }),
  
  // Element actions
  addElement: (element) => {
    set((state) => ({
      elements: [...state.elements, element],
    }));
    get().saveToHistory();
  },
  
  updateElement: (id, updates) => {
    set((state) => {
      const newElements = state.elements.map((el) =>
        el.id === id ? { ...el, ...updates } : el
      );
      return { elements: newElements };
    });
    get().saveToHistory();
  },
  
  deleteElement: (id) => {
    set((state) => ({
      elements: state.elements.filter((el) => el.id !== id),
      selectedElementId: state.selectedElementId === id ? null : state.selectedElementId,
      selectedElementIds: state.selectedElementIds.filter((elId) => elId !== id),
    }));
    get().saveToHistory();
  },
  
  selectElement: (id, multi = false) => {
    if (multi && id) {
      const currentIds = get().selectedElementIds;
      const newIds = currentIds.includes(id)
        ? currentIds.filter((i) => i !== id)
        : [...currentIds, id];
      set({ selectedElementIds: newIds, selectedElementId: id });
    } else {
      set({ selectedElementId: id, selectedElementIds: id ? [id] : [] });
    }
  },
  
  selectElements: (ids) => set({ 
    selectedElementIds: ids, 
    selectedElementId: ids.length > 0 ? ids[0] : null 
  }),
  
  reorderElements: (elements) => {
    set({ elements });
    get().saveToHistory();
  },

  reorderLayers: (ids) => {
    set((state) => {
      if (ids.length === 0) return state;
      const idToElement = Object.fromEntries(state.elements.map((el) => [el.id, el]));
      const ordered = ids
        .map((id) => idToElement[id])
        .filter((el): el is EditorElement => Boolean(el));

      // Preserve any elements not present in ids (safety fallback)
      const remaining = state.elements.filter((el) => !ids.includes(el.id));
      const newOrder = [...ordered, ...remaining];

      const topIndex = newOrder.length;
      const withZ = newOrder.map((el, index) => ({
        ...el,
        zIndex: topIndex - index,
      }));

      return { elements: withZ };
    });
    get().saveToHistory();
  },

  toggleLayerVisibility: (id) => {
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, visible: !el.visible } : el
      ),
    }));
    get().saveToHistory();
  },

  toggleLayerLock: (id) => {
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, locked: !el.locked } : el
      ),
    }));
    get().saveToHistory();
  },

  renameLayer: (id, name) => {
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, name } : el
      ),
    }));
    get().saveToHistory();
  },
  
  // Transform actions
  moveElement: (id, x, y) => {
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, x, y } : el
      ),
    }));
  },
  
  resizeElement: (id, width, height) => {
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, width, height } : el
      ),
    }));
  },
  
  rotateElement: (id, rotation) => {
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, rotation } : el
      ),
    }));
  },
  
  bringToFront: (id) => {
    const state = get();
    const maxZIndex = Math.max(...state.elements.map((el) => el.zIndex || 0));
    set({
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, zIndex: maxZIndex + 1 } : el
      ),
    });
    get().saveToHistory();
  },
  
  sendToBack: (id) => {
    const state = get();
    const minZIndex = Math.min(...state.elements.map((el) => el.zIndex || 0));
    set({
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, zIndex: minZIndex - 1 } : el
      ),
    });
    get().saveToHistory();
  },
  
  // State setters
  setIsDragging: (value) => set({ isDragging: value }),
  setIsResizing: (value) => set({ isResizing: value }),
  setIsRotating: (value) => set({ isRotating: value }),
  
  // History actions
  saveToHistory: () => {
    const state = get();
    const currentState: HistoryState = {
      elements: state.elements,
      selectedElementId: state.selectedElementId,
    };
    
    // Remove any "future" history if we're not at the end
    const newHistory = state.history.slice(0, state.historyIndex + 1);
    newHistory.push(currentState);
    
    // Limit history to 50 states
    if (newHistory.length > 50) {
      newHistory.shift();
    }
    
    set({
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },
  
  undo: () => {
    const state = get();
    if (state.historyIndex > 0) {
      const newIndex = state.historyIndex - 1;
      const previousState = state.history[newIndex];
      set({
        elements: previousState.elements,
        selectedElementId: previousState.selectedElementId,
        historyIndex: newIndex,
      });
    }
  },
  
  redo: () => {
    const state = get();
    if (state.historyIndex < state.history.length - 1) {
      const newIndex = state.historyIndex + 1;
      const nextState = state.history[newIndex];
      set({
        elements: nextState.elements,
        selectedElementId: nextState.selectedElementId,
        historyIndex: newIndex,
      });
    }
  },
  
  canUndo: () => {
    const state = get();
    return state.historyIndex > 0;
  },
  
  canRedo: () => {
    const state = get();
    return state.historyIndex < state.history.length - 1;
  },
  
  // Template actions
  loadTemplate: (template) => {
    const state = get();
    
    // Confirm if there are existing elements
    if (state.elements.length > 0) {
      const confirmed = confirm(
        'Încărcarea acestui template va șterge toate elementele existente. Continuați?'
      );
      if (!confirmed) return;
    }
    
    // Load template elements
    set({
      elements: template.elements,
      canvasSize: template.canvasSize,
      selectedElementId: null,
      selectedElementIds: [],
    });
    
    // Auto-adjust zoom to fit canvas
    const containerWidth = 1000; // Aproximare, ar trebui obținută dinamic
    const containerHeight = 700;
    const zoomWidth = containerWidth / template.canvasSize.width;
    const zoomHeight = containerHeight / template.canvasSize.height;
    const optimalZoom = Math.min(zoomWidth, zoomHeight, 1); // Nu zoom in peste 100%
    
    set({ zoom: optimalZoom });
    
    // Save to history
    get().saveToHistory();
  },
}));
