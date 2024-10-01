import type { DatabaseRecording as RecordingResponse, ResponsesRecordingStatusResponse } from './StreamSinkClient';
import type { CancelTokenSource, AxiosResponse } from 'axios';
import type { AuthHeader } from '../../auth.service';
import { StreamSinkClient, HttpClient } from './StreamSinkClient';
import { useNuxtApp, useFetch } from "#imports";
import AuthService from '../../auth.service';

export class MyClient extends StreamSinkClient<any> {
  constructor(header: AuthHeader | null) {
    const config = useRuntimeConfig();
    const apiUrl = config.apiUrl as string;

    const client = new HttpClient({
      baseURL: apiUrl,
      headers: { ...header },
      customFetch: (input, init) => {
        const nuxtApp = useNuxtApp();
        return nuxtApp.runWithContext(async () => await useFetch(input, init));
      },
    });
    //client.instance.interceptors.response.use(value => value, unauthorizedInterceptor);
    super(client);
  }

  /**
   * Custom function to upload and cancel large files with progress indicator.
   * @param channelId Upload to which channel
   * @param file File object to upload
   * @param progress Returns the progress as number in range [0.0 ... 1.0]
   */
  channelUpload(channelId: number, file: File, progress: (pcent: number) => void): [ Promise<AxiosResponse<RecordingResponse>>, CancelTokenSource ] {
    const header = AuthService.getAuthHeader();
    const source = axios.CancelToken.source();
    const formData = new FormData();
    formData.append('file', file);

    return [ this.http.instance.post(`${apiUrl}/channels/${channelId}/upload`, formData, {
      cancelToken: source.token,
      headers: { 'Content-Type': 'multipart/form-data', ...header },
      onUploadProgress: progressEvent => progressEvent.total ? progress(progressEvent.loaded / progressEvent.total) : 0
    }), source ];
  }

  /**
   * For unclear reasons the object is not correctly parsed from this route,
   * although the returned data look fine in the browser.
   */
  async isRecording(): Promise<boolean> {
    const res = await this.http.instance.get<ResponsesRecordingStatusResponse>(`${apiUrl}/recorder`);
    return res.data.isRecording;
  }
}

export const createClient = (): MyClient => {
  const header = AuthService.getAuthHeader();
  return new MyClient(header);
};
