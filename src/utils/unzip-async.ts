import { type Unzipped, unzip } from 'fflate';

export function asyncUnzip(data: Uint8Array) {
  return new Promise<Unzipped>((resolve, reject) => {
    unzip(data, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}
