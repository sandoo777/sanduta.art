"use client";

import { ArrowDownTrayIcon, DocumentIcon, CheckCircleIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";

interface OrderFile {
  id: string;
  name: string;
  url: string;
  previewUrl?: string;
  type: "upload" | "editor";
  size?: string;
  validation?: "ok" | "warning" | "error";
  validationMessage?: string;
}

interface OrderFilesProps {
  files: OrderFile[];
}

export default function OrderFiles({ files }: OrderFilesProps) {
  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getValidationIcon = (validation?: string) => {
    switch (validation) {
      case "ok":
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      case "warning":
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />;
      case "error":
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getValidationColor = (validation?: string) => {
    switch (validation) {
      case "ok":
        return "bg-green-50 border-green-200";
      case "warning":
        return "bg-yellow-50 border-yellow-200";
      case "error":
        return "bg-red-50 border-red-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  if (files.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Fișiere</h3>
        <p className="text-gray-600">Nu există fișiere atașate la această comandă.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900">Fișiere</h3>
      </div>

      <div className="p-6 space-y-4">
        {files.map((file) => (
          <div
            key={file.id}
            className={`border rounded-lg p-4 ${getValidationColor(file.validation)}`}
          >
            <div className="flex items-start gap-4">
              {/* Preview */}
              {file.previewUrl ? (
                <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-white border border-gray-200 overflow-hidden">
                  <img
                    src={file.previewUrl}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-white border border-gray-200 flex items-center justify-center">
                  <DocumentIcon className="w-8 h-8 text-gray-400" />
                </div>
              )}

              {/* File Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </h4>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-500">
                        {file.type === "upload" ? "Încărcat" : "Din editor"}
                      </span>
                      {file.size && (
                        <>
                          <span className="text-gray-300">•</span>
                          <span className="text-xs text-gray-500">{file.size}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {file.validation && (
                      <div className="flex items-center gap-1">
                        {getValidationIcon(file.validation)}
                      </div>
                    )}
                    <button
                      onClick={() => handleDownload(file.url, file.name)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      title="Descarcă fișier"
                    >
                      <ArrowDownTrayIcon className="w-4 h-4" />
                      <span className="hidden sm:inline">Descarcă</span>
                    </button>
                  </div>
                </div>

                {/* Validation Message */}
                {file.validationMessage && (
                  <p className="mt-2 text-xs text-gray-600">
                    {file.validationMessage}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
