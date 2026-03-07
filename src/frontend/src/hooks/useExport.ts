import { useInternetIdentity } from "./useInternetIdentity";

export interface ExportableContent {
  blob?: Blob;
  url?: string;
  fileName?: string;
  mimeType?: string;
}

export function useExport() {
  const { identity } = useInternetIdentity();

  const exportContent = (content: ExportableContent): string => {
    const principal = identity?.getPrincipal().toString() ?? "anonymous";
    // Encode principal as a watermark suffix in the filename
    const watermarkHash = btoa(principal)
      .replace(/[^a-zA-Z0-9]/g, "")
      .slice(0, 12);
    const timestamp = Date.now();

    const baseName = content.fileName
      ? content.fileName.replace(/\.[^.]+$/, "")
      : "void-creation";
    const ext = content.mimeType
      ? `.${content.mimeType.split("/")[1] || "bin"}`
      : content.fileName
        ? `.${content.fileName.split(".").pop()}`
        : ".bin";

    const watermarkedName = `${baseName}_vms_${watermarkHash}_${timestamp}${ext}`;

    let downloadUrl: string;
    let shouldRevoke = false;

    if (content.blob) {
      downloadUrl = URL.createObjectURL(content.blob);
      shouldRevoke = true;
    } else if (content.url) {
      downloadUrl = content.url;
    } else {
      return "No content to export";
    }

    const anchor = document.createElement("a");
    anchor.href = downloadUrl;
    anchor.download = watermarkedName;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);

    if (shouldRevoke) {
      setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
    }

    return watermarkedName;
  };

  return { exportContent };
}
