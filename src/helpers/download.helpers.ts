import { get } from 'https';
import { createWriteStream } from 'fs-jetpack';

function isRedirect(): boolean {
    return false;
}

function getRedirectUrl(): string {
    return '';
}

export function downloadFile(url: string, dest: string): Promise<boolean> {
    return new Promise(resolve => {
       get(url, (resp) => {

           if (isRedirect()) {
                downloadFile(getRedirectUrl(), dest).then(resolve);
                return;
           }

           const writeStream = createWriteStream(dest);

           resp.pipe(writeStream);

           resp.on('error', e => resolve(false));
           writeStream.on('error', e => resolve(false));
           writeStream.on('finish', () => resolve(true));
       })
           .on('abort', () => resolve(false))
           .on('error', e => resolve(false));
    });
}