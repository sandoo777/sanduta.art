import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helpers';
import {
  exportProject,
  getExportContentType,
  getExportFilename,
} from '@/lib/export/project-exporter';

export async function POST(request: NextRequest) {
  const { user, error } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();
    const { projectData, format = 'png', quality, scale } = body;

    if (!projectData) {
      return NextResponse.json(
        { error: 'Project data is required' },
        { status: 400 }
      );
    }

    if (!['png', 'pdf', 'svg'].includes(format)) {
      return NextResponse.json(
        { error: 'Invalid format. Supported: png, pdf, svg' },
        { status: 400 }
      );
    }

    // Export project
    const buffer = await exportProject(projectData, {
      format,
      quality,
      scale,
    });

    // Return file
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': getExportContentType(format),
        'Content-Disposition': `attachment; filename="${getExportFilename(
          projectData.id || 'untitled',
          format
        )}"`,
        'Cache-Control': 'no-cache',
      },
    });
  } catch (err) {
    console.error('Error exporting project:', err);
    return NextResponse.json(
      { error: 'Failed to export project' },
      { status: 500 }
    );
  }
}
