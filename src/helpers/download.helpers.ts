import { get } from "https";
import { createWriteStream } from "fs-jetpack";

function isRedirect(headers: object): boolean {
  return "location" in headers;
}

function getRedirectUrl(headers: object): string {
  //@ts-expect-error: no headers typing
  return headers.location;
}

export function downloadFile(url: string, dest: string): Promise<boolean> {
  return new Promise((resolve) => {
    get(url, (resp) => {
      if (isRedirect(resp.headers)) {
        downloadFile(getRedirectUrl(resp.headers), dest).then(resolve);
        return;
      }

      const writeStream = createWriteStream(dest);

      resp.pipe(writeStream);

      resp.on("error", () => resolve(false));
      writeStream.on("error", () => resolve(false));
      writeStream.on("finish", () => resolve(true));
    })
      .on("abort", () => resolve(false))
      .on("error", () => resolve(false));
  });
}
