import { ContentType, type DatabaseRecording, type DatabaseRecording as RecordingResponse, type HttpResponse, type ResponsesRecordingStatusResponse } from './StreamSinkClient';
import type { AuthHeader } from '@/services/auth.service';
import { StreamSinkClient, HttpClient } from './StreamSinkClient';
import AuthService from '@/services/auth.service';
import { useNuxtApp } from "#imports";

export class MyClient extends StreamSinkClient<any> {
  constructor(header: AuthHeader | null) {
    const { $config } = useNuxtApp();
    const client = new HttpClient({
      baseUrl: $config.public.apiUrl,
      baseApiParams: {
        headers: { ...header }
      },
      customFetch: (input, init) => {
        return fetch(input, init);
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
  channelUpload(channelId: number, file: File, progress: (pcent: number) => void, tokenCookie: CookieRef<string>): [ Promise<HttpResponse<RecordingResponse, any>>, AbortSignal ] {
    const controller = new AbortController();
    const signal = controller.signal;
    const formData = new FormData();
    formData.append('file', file);

    const req = this.http.request<DatabaseRecording, any>({
      path: `/channels/${channelId}/upload`,
      method: "POST",
      body: formData,
      type: ContentType.FormData,
      signal,
    });

    return [ req, signal ];
  }

  /**
   * For unclear reasons the object is not correctly parsed from this route,
   * although the returned data look fine in the browser.
   */
  async isRecording(): Promise<boolean> {
    const res = await this.http.request<ResponsesRecordingStatusResponse, any>({ path: `/recorder`, method: "GET" });
    return res.isRecording;
  }
}

export const createClient = (tokenCookie: CookieRef<string>): MyClient => {
  const auth = new AuthService(tokenCookie);
  return new MyClient(auth.getAuthHeader());
};