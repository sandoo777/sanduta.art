import { EditorElement } from './editorStore';

interface ThumbnailOptions {
  width?: number;
  height?: number;
  quality?: number;
}

/**
 * Generates a thumbnail from the current canvas state
 * @param elements Array of editor elements
 * @param canvasSize Canvas dimensions
 * @param options Thumbnail generation options
 * @returns Base64 encoded image data URL
 */
export async function generateThumbnail(
  elements: EditorElement[],
  canvasSize: { width: number; height: number },
  options: ThumbnailOptions = {}
): Promise<string> {
  const { width = 400, height = 400, quality = 0.8 } = options;

  // Create an offscreen canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  // Fill background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);

  // Calculate scaling to fit canvas in thumbnail
  const scale = Math.min(width / canvasSize.width, height / canvasSize.height);
  const offsetX = (width - canvasSize.width * scale) / 2;
  const offsetY = (height - canvasSize.height * scale) / 2;

  // Apply transform
  ctx.save();
  ctx.translate(offsetX, offsetY);
  ctx.scale(scale, scale);

  // Sort elements by zIndex
  const sortedElements = [...elements].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

  // Render each element
  for (const element of sortedElements) {
    if (element.visible === false) continue;

    ctx.save();
    ctx.translate(element.x + element.width / 2, element.y + element.height / 2);
    ctx.rotate(((element.rotation || 0) * Math.PI) / 180);
    ctx.globalAlpha = element.opacity || 1;

    if (element.type === 'text') {
      renderText(ctx, element);
    } else if (element.type === 'shape') {
      renderShape(ctx, element);
    } else if (element.type === 'image' && element.src) {
      await renderImage(ctx, element);
    }

    ctx.restore();
  }

  ctx.restore();

  // Convert to data URL
  return canvas.toDataURL('image/jpeg', quality);
}

function renderText(ctx: CanvasRenderingContext2D, element: EditorElement) {
  const fontSize = element.fontSize || 16;
  const fontFamily = element.fontFamily || 'Inter';
  const fontWeight = element.fontWeight || 400;
  const color = element.color || '#000000';
  const textAlign = element.textAlign || 'left';

  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  ctx.fillStyle = color;
  ctx.textAlign = textAlign as CanvasTextAlign;
  ctx.textBaseline = 'middle';

  const lines = (element.content || '').split('\n');
  const lineHeight = element.lineHeight || 1.2;
  const totalHeight = lines.length * fontSize * lineHeight;
  const startY = -totalHeight / 2 + (fontSize * lineHeight) / 2;

  lines.forEach((line, index) => {
    const y = startY + index * fontSize * lineHeight;
    let x = -element.width / 2;
    if (textAlign === 'center') x = 0;
    if (textAlign === 'right') x = element.width / 2;
    ctx.fillText(line, x, y);
  });
}

function renderShape(ctx: CanvasRenderingContext2D, element: EditorElement) {
  const fill = element.fill || '#0066FF';
  const shape = element.shape || 'rectangle';

  ctx.fillStyle = fill;

  if (element.stroke) {
    ctx.strokeStyle = element.stroke;
    ctx.lineWidth = element.strokeWidth || 2;
  }

  const halfW = element.width / 2;
  const halfH = element.height / 2;

  if (shape === 'rectangle') {
    const radius = element.borderRadius || 0;
    if (radius > 0) {
      roundRect(ctx, -halfW, -halfH, element.width, element.height, radius);
    } else {
      ctx.fillRect(-halfW, -halfH, element.width, element.height);
      if (element.stroke) ctx.strokeRect(-halfW, -halfH, element.width, element.height);
    }
  } else if (shape === 'circle') {
    ctx.beginPath();
    ctx.arc(0, 0, Math.min(halfW, halfH), 0, Math.PI * 2);
    ctx.fill();
    if (element.stroke) ctx.stroke();
  } else if (shape === 'triangle') {
    ctx.beginPath();
    ctx.moveTo(0, -halfH);
    ctx.lineTo(halfW, halfH);
    ctx.lineTo(-halfW, halfH);
    ctx.closePath();
    ctx.fill();
    if (element.stroke) ctx.stroke();
  }
}

async function renderImage(ctx: CanvasRenderingContext2D, element: EditorElement) {
  return new Promise<void>((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const halfW = element.width / 2;
      const halfH = element.height / 2;

      // Apply filters
      if (element.brightness || element.contrast || element.saturation || element.blur) {
        const filters: string[] = [];
        if (element.brightness) filters.push(`brightness(${element.brightness}%)`);
        if (element.contrast) filters.push(`contrast(${element.contrast}%)`);
        if (element.saturation) filters.push(`saturate(${element.saturation}%)`);
        if (element.blur) filters.push(`blur(${element.blur}px)`);
        ctx.filter = filters.join(' ');
      }

      ctx.drawImage(img, -halfW, -halfH, element.width, element.height);
      ctx.filter = 'none';
      resolve();
    };
    img.onerror = () => resolve(); // Skip failed images
    img.src = element.src!;
  });
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.fill();
}

/**
 * Uploads thumbnail to cloud storage
 * @param dataUrl Base64 encoded image
 * @param projectId Project ID
 * @returns URL of uploaded thumbnail
 */
export async function uploadThumbnail(dataUrl: string, projectId: string): Promise<string> {
  // Convert data URL to blob
  const blob = await (await fetch(dataUrl)).blob();
  
  // Create form data
  const formData = new FormData();
  formData.append('file', blob, `thumbnail-${projectId}.jpg`);
  formData.append('projectId', projectId);

  // Upload to server
  const response = await fetch('/api/editor/thumbnail', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to upload thumbnail');
  }

  const data = await response.json();
  return data.url;
}
