import { exportEngine } from '@/modules/editor/export/exportEngine';

interface ProjectExportOptions {
  format: 'png' | 'pdf' | 'svg';
  quality?: number; // pentru PNG
  scale?: number; // pentru toate formatele
}

export async function exportProject(
  projectData: any,
  options: ProjectExportOptions
): Promise<Buffer> {
  try {
    // Prepare canvas data from project
    const canvasData = {
      width: projectData.width || 800,
      height: projectData.height || 600,
      elements: projectData.elements || [],
      background: projectData.background || '#ffffff',
    };

    // Use existing exportEngine based on format
    switch (options.format) {
      case 'png':
        return await exportEngine.exportToPNG(canvasData, {
          quality: options.quality || 0.95,
          scale: options.scale || 2,
        });

      case 'pdf':
        return await exportEngine.exportToPDF(canvasData, {
          scale: options.scale || 1,
          pageSize: 'A4',
        });

      case 'svg':
        const svgString = await exportEngine.exportToSVG(canvasData);
        return Buffer.from(svgString, 'utf-8');

      default:
        throw new Error(`Unsupported format: ${options.format}`);
    }
  } catch (error) {
    console.error('Error exporting project:', error);
    throw new Error('Failed to export project');
  }
}

// API endpoint helper
export function getExportContentType(format: string): string {
  switch (format) {
    case 'png':
      return 'image/png';
    case 'pdf':
      return 'application/pdf';
    case 'svg':
      return 'image/svg+xml';
    default:
      return 'application/octet-stream';
  }
}

export function getExportFilename(projectId: string, format: string): string {
  const timestamp = new Date().toISOString().split('T')[0];
  return `project-${projectId}-${timestamp}.${format}`;
}
