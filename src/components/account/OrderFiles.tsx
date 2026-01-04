import {
  DocumentIcon,
  ArrowDownTrayIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";

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

const validationStyles = {
  ok: "bg-green-50 text-green-700 border-green-200",
  warning: "bg-yellow-50 text-yellow-700 border-yellow-200",
  error: "bg-red-50 text-red-700 border-red-200",
};

const validationIcons = {
  ok: CheckCircleIcon,
  warning: ExclamationTriangleIcon,
  error: XCircleIcon,
};

export default function OrderFiles({ files }: OrderFilesProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Fișiere</h2>

      <div className="space-y-3">
        {files.map((file) => {
          const ValidationIcon = file.validation ? validationIcons[file.validation] : null;

          return (
            <div
              key={file.id}
              className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {/* File Preview/Icon */}
              <div className="w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                {file.previewUrl ? (
                  <Image
                    src={file.previewUrl}
                    alt={file.name}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <DocumentIcon className="w-6 h-6 text-gray-400" />
                  </div>
                )}
              </div>

              {/* File Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-500">{file.size || "N/A"}</span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-500">
                    {file.type === "editor" ? "Editor" : "Upload"}
                  </span>
                </div>

                {/* Validation Badge */}
                {file.validation && (
                  <div className="flex items-center gap-1 mt-2">
                    {ValidationIcon && (
                      <ValidationIcon className="w-4 h-4" />
                    )}
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full border ${
                        validationStyles[file.validation]
                      }`}
                    >
                      {file.validationMessage || file.validation}
                    </span>
                  </div>
                )}
              </div>

              {/* Download Button */}
              <a
                href={file.url}
                download
                className="flex-shrink-0 p-2 text-gray-600 hover:text-[#0066FF] hover:bg-blue-50 rounded-lg transition-colors"
                title="Descarcă fișier"
              >
                <ArrowDownTrayIcon className="w-5 h-5" />
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}
