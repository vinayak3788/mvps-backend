import React from "react";

export default function FileLinks({ files }) {
  if (!Array.isArray(files)) {
    return <span className="text-gray-400">No files</span>;
  }

  return (
    <ul className="text-left list-disc pl-4">
      {files.map((file, idx) =>
        file?.path ? (
          <li key={idx}>
            <a
              href={file.path}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              {file.name}
            </a>
          </li>
        ) : (
          <li key={idx} className="text-red-500">
            {file?.name || "Unknown"} (missing)
          </li>
        ),
      )}
    </ul>
  );
}
