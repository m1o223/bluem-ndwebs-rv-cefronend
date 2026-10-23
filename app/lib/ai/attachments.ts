export type Attachment = { name: string; type: string; data: string };
export type LocalAttachment = Attachment & { id: string; size: number; width?: number; height?: number };
export const FILE_LIMITS = { count: 4, fileBytes: 2 * 1024 * 1024, totalBytes: 2560 * 1024, bodyBytes: 3700000 };
export const FILE_TYPES: Record<string, string> = {
  jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", pdf: "application/pdf", txt: "text/plain",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
};
export const imageAccept = ".jpg,.jpeg,.png,.webp";
export const documentAccept = ".pdf,.docx,.txt,.xlsx";
export const attachmentUrl = (file: Attachment) => `data:${file.type};base64,${file.data}`;
export const wireAttachment = ({ name, type, data }: Attachment): Attachment => ({ name, type, data });

export async function readAttachment(file: File, signal: AbortSignal, onProgress: (value: number) => void): Promise<LocalAttachment> {
  const type = FILE_TYPES[file.name.split(".").at(-1)?.toLowerCase() || ""];
  if (!type || (file.type && file.type !== type && file.type !== "application/octet-stream")) throw new Error("Choose JPEG, PNG, WebP, PDF, DOCX, TXT or XLSX files.");
  if (!file.size || file.size > FILE_LIMITS.fileBytes) throw new Error("Each file must be nonempty and no larger than 2 MB.");
  if (file.name.length > 120 || /[\\/\x00-\x1f\x7f\u202a-\u202e\u2066-\u2069]/.test(file.name)) throw new Error("Please shorten or rename this file before attaching it.");
  const data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    const abort = () => reader.abort();
    const clean = () => { clearTimeout(timer); signal.removeEventListener("abort", abort); };
    const timer = setTimeout(abort, 15000);
    reader.onprogress = event => { if (event.lengthComputable) onProgress(Math.round(event.loaded / event.total * 100)); };
    reader.onload = () => { clean(); resolve(String(reader.result).split(",")[1]); };
    reader.onerror = () => { clean(); reject(new Error("Unable to read this file. Please select it again.")); };
    reader.onabort = () => { clean(); reject(new Error("File preparation cancelled.")); };
    signal.addEventListener("abort", abort, { once: true });
    if (signal.aborted) { clean(); reject(new Error("File preparation cancelled.")); return; }
    reader.readAsDataURL(file);
  });
  const result: LocalAttachment = { id: crypto.randomUUID(), name: file.name, type, data, size: file.size };
  if (type.startsWith("image/")) {
    const image = new Image();
    image.src = attachmentUrl(result);
    await image.decode().catch(() => { throw new Error("This image cannot be opened. Choose JPEG, PNG or WebP."); });
    if (image.naturalWidth * image.naturalHeight > 16000000) throw new Error("Please resize this image to 16 megapixels or less.");
    result.width = image.naturalWidth; result.height = image.naturalHeight;
  }
  signal.throwIfAborted();
  return result;
}
