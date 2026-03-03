export type UploadProgress = {
  loaded: number;
  total: number | null;
  percent: number;
};

export type UploadWithProgressOptions = {
  url: string;
  method?: string;
  body: FormData;
  onProgress?: (progress: UploadProgress) => void;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  withCredentials?: boolean;
};

export function uploadWithProgress({
  url,
  method = "POST",
  body,
  onProgress,
  headers,
  signal,
  withCredentials,
}: UploadWithProgressOptions): Promise<Response> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url);
    if (withCredentials) {
      xhr.withCredentials = true;
    }
    if (headers) {
      Object.entries(headers).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value);
      });
    }

    const reportProgress = (loaded: number, total: number | null) => {
      if (!onProgress) return;
      const percent =
        total && total > 0
          ? Math.min(100, Math.round((loaded / total) * 100))
          : 0;
      onProgress({ loaded, total, percent });
    };

    if (onProgress) {
      reportProgress(0, null);
      xhr.upload.onprogress = (event) => {
        const total = event.lengthComputable ? event.total : null;
        reportProgress(event.loaded, total);
      };
    }

    const finalize = () => {
      if (onProgress) {
        onProgress({ loaded: 1, total: 1, percent: 100 });
      }
    };

    xhr.onload = () => {
      finalize();
      resolve(
        new Response(xhr.responseText ?? "", {
          status: xhr.status,
          statusText: xhr.statusText,
        })
      );
    };

    xhr.onerror = () => {
      reject(new Error("Network error"));
    };

    xhr.onabort = () => {
      reject(new DOMException("Upload aborted", "AbortError"));
    };

    let aborted = false;
    const handleAbort = () => {
      aborted = true;
      xhr.abort();
    };

    if (signal) {
      if (signal.aborted) {
        handleAbort();
      } else {
        signal.addEventListener("abort", handleAbort);
      }
    }

    xhr.onloadend = () => {
      if (signal) {
        signal.removeEventListener("abort", handleAbort);
      }
      if (aborted) return;
    };

    xhr.send(body);
  });
}
