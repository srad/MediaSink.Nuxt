import { ContentType, type DatabaseRecording, type DatabaseRecording as RecordingResponse, type HttpResponse, type ResponsesRecordingStatusResponse } from './StreamSinkClient';
import { StreamSinkClient, HttpClient } from './StreamSinkClient';
import type { AuthHeader } from '@/services/auth.service';

export class MyClient extends StreamSinkClient<any> {
  constructor(header: AuthHeader | null, apiUrl: string) {
    const client = new HttpClient({
      baseUrl: apiUrl,
      baseApiParams: {
        headers: { ...header },
      },
    });
    super(client);
  }

  /**
   * Custom function to upload and cancel large files with progress indicator.
   * @param channelId Upload to which channel
   * @param file File object to upload
   * @param progress Returns the progress as number in range [0.0 ... 1.0]
   */
  channelUpload(channelId: number, file: File, progress: (pcent: number) => void): [Promise<HttpResponse<RecordingResponse, any>>, AbortController] {
    const controller = new AbortController();
    const signal = controller.signal;
    const formData = new FormData();
    formData.append('file', file);

    const req = this.http.request<DatabaseRecording, any>({
      path: `/channels/${channelId}/upload`,
      method: 'POST',
      body: formData,
      type: ContentType.FormData,
      signal,
    });

    return [req, controller];
  }

  /**
   * For unclear reasons the object is not correctly parsed from this route,
   * although the returned data look fine in the browser.
   */
  async isRecording(): Promise<boolean> {
    return (await this.recorder.recorderList()).data.isRecording;
  }
}

export const createClient = (authHeader: AuthHeader | null, apiUrl: string): MyClient => {
  return new MyClient(authHeader, apiUrl);
};
