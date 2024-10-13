/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface DatabaseChannel {
    channelId: number;
    channelName: string;
    createdAt: string;
    deleted: boolean;
    displayName: string;
    fav: boolean;
    isPaused: boolean;
    minDuration: number;
    /** 1:n */
    recordings?: DatabaseRecording[];
    /** Only for query result. */
    recordingsCount: number;
    recordingsSize: number;
    skipStart: number;
    tags?: string[];
    url: string;
}

export interface DatabaseJob {
    active: boolean;
    args?: string;
    channelId: number;
    /** Unique entry, this is the actual primary key */
    channelName: string;
    command?: string;
    completedAt: string;
    createdAt: string;
    filename: string;
    filepath: string;
    info?: string;
    jobId: number;
    /** Additional information */
    pid?: number;
    progress?: string;
    recordingId: number;
    startedAt: string;
    status: DatabaseJobStatus;
    /** Default values only not to break migrations. */
    task: DatabaseJobTask;
}

export enum DatabaseJobOrder {
    JobOrderASC = "ASC",
    JobOrderDESC = "DESC",
}

export enum DatabaseJobStatus {
    StatusJobCompleted = "completed",
    StatusJobOpen = "open",
    StatusJobError = "error",
    StatusJobCanceled = "canceled",
}

export enum DatabaseJobTask {
    TaskConvert = "convert",
    TaskPreviewCover = "preview-cover",
    TaskPreviewStrip = "preview-stripe",
    TaskPreviewVideo = "preview-video",
    TaskCut = "cut",
}

export interface DatabaseRecording {
    bitRate: number;
    bookmark: boolean;
    /** @min 0 */
    channelId: number;
    channelName: string;
    createdAt: string;
    duration: number;
    filename: string;
    height: number;
    /** Total number of video packets/frames. */
    packets: number;
    pathRelative: string;
    previewCover?: string;
    previewStripe?: string;
    previewVideo?: string;
    /** @min 0 */
    recordingId: number;
    size: number;
    videoType: string;
    width: number;
}

export interface HelpersCPUInfo {
    loadCpu: HelpersCPULoad[];
}

export interface HelpersCPULoad {
    cpu: string;
    createdAt: string;
    load: number;
}

export interface HelpersDiskInfo {
    availFormattedGb: number;
    pcent: number;
    sizeFormattedGb: number;
    usedFormattedGb: number;
}

export interface HelpersNetInfo {
    createdAt: string;
    dev: string;
    receiveBytes: number;
    transmitBytes: number;
}

export interface HelpersSysInfo {
    cpuInfo: HelpersCPUInfo;
    diskInfo: HelpersDiskInfo;
    netInfo: HelpersNetInfo;
}

export interface RequestsAuthenticationRequest {
    password: string;
    username: string;
}

export interface RequestsChannelRequest {
    channelName: string;
    deleted?: boolean;
    displayName: string;
    fav?: boolean;
    isPaused: boolean;
    minDuration: number;
    skipStart: number;
    tags?: string[];
    url: string;
}

export interface RequestsChannelTagsUpdateRequest {
    tags: string[];
}

export interface RequestsCutRequest {
    deleteAfterCut: boolean;
    ends: string[];
    starts: string[];
}

export interface RequestsJobsRequest {
    skip?: number;
    sortOrder: DatabaseJobOrder;
    states: DatabaseJobStatus[];
    take?: number;
}

export interface ResponsesImportInfoResponse {
    isImporting?: boolean;
    progress?: number;
    size?: number;
}

export interface ResponsesJobWorkerStatus {
    isProcessing: boolean;
}

export interface ResponsesJobsResponse {
    jobs?: DatabaseJob[];
    skip: number;
    take: number;
    totalCount: number;
}

export interface ResponsesLoginResponse {
    token: string;
}

export interface ResponsesRecordingStatusResponse {
    isRecording: boolean;
}

export interface ResponsesServerInfoResponse {
    commit: string;
    version: string;
}

export interface ServicesChannelInfo {
    channelId: number;
    channelName: string;
    createdAt: string;
    deleted: boolean;
    displayName: string;
    fav: boolean;
    isOnline: boolean;
    isPaused: boolean;
    isRecording: boolean;
    isTerminating: boolean;
    minDuration: number;
    minRecording: number;
    preview: string;
    /** 1:n */
    recordings?: DatabaseRecording[];
    /** Only for query result. */
    recordingsCount: number;
    recordingsSize: number;
    skipStart: number;
    tags?: string[];
    url: string;
}

export interface ServicesProcessInfo {
    args?: string;
    id?: number;
    output?: string;
    path?: string;
    pid?: number;
}

export interface UploadCreatePayload {
    /** Uploaded file chunk */
    file: number[];
}

export namespace Admin {
    /**
     * @description version information
     * @tags admin
     * @name ImportList
     * @summary Returns server version information
     * @request GET:/admin/import
     * @response `200` `ResponsesImportInfoResponse` OK
     * @response `500` `any` Internal Server Error
     */
    export namespace ImportList {
        export type RequestParams = {};
        export type RequestQuery = {};
        export type RequestBody = never;
        export type RequestHeaders = {};
        export type ResponseBody = ResponsesImportInfoResponse;
    }

    /**
     * @description Return a list of channels
     * @tags admin
     * @name ImportCreate
     * @summary Run once the import of mp4 files in the recordings folder, which are not yet in the system
     * @request POST:/admin/import
     * @response `200` `void` OK
     * @response `500` `any` Internal Server Error
     */
    export namespace ImportCreate {
        export type RequestParams = {};
        export type RequestQuery = {};
        export type RequestBody = never;
        export type RequestHeaders = {};
        export type ResponseBody = void;
    }

    /**
     * @description version information
     * @tags admin
     * @name VersionList
     * @summary Returns server version information
     * @request GET:/admin/version
     * @response `200` `ResponsesServerInfoResponse` OK
     * @response `500` `any` Internal Server Error
     */
    export namespace VersionList {
        export type RequestParams = {};
        export type RequestQuery = {};
        export type RequestBody = never;
        export type RequestHeaders = {};
        export type ResponseBody = ResponsesServerInfoResponse;
    }
}

export namespace Auth {
    /**
     * @description User login
     * @tags auth
     * @name LoginCreate
     * @summary User login
     * @request POST:/auth/login
     * @response `200` `ResponsesLoginResponse` JWT token for authentication
     * @response `400` `string` Error message
     * @response `401` `string` Error message
     */
    export namespace LoginCreate {
        export type RequestParams = {};
        export type RequestQuery = {};
        export type RequestBody = RequestsAuthenticationRequest;
        export type RequestHeaders = {};
        export type ResponseBody = ResponsesLoginResponse;
    }

    /**
     * @description Create new user
     * @tags auth
     * @name SignupCreate
     * @summary Create new user
     * @request POST:/auth/signup
     * @response `200` `any` JWT token for authentication
     * @response `400` `string` Error message
     * @response `500` `string` Error message
     */
    export namespace SignupCreate {
        export type RequestParams = {};
        export type RequestQuery = {};
        export type RequestBody = RequestsAuthenticationRequest;
        export type RequestHeaders = {};
        export type ResponseBody = any;
    }
}

export namespace Channels {
    /**
     * @description Return a list of channels
     * @tags channels
     * @name ChannelsList
     * @summary Return a list of channels
     * @request GET:/channels
     * @response `200` `(ServicesChannelInfo)[]` OK
     * @response `500` `any` Internal Server Error
     */
    export namespace ChannelsList {
        export type RequestParams = {};
        export type RequestQuery = {};
        export type RequestBody = never;
        export type RequestHeaders = {};
        export type ResponseBody = ServicesChannelInfo[];
    }

    /**
     * @description Add a new channel
     * @tags channels
     * @name ChannelsCreate
     * @summary Add a new channel
     * @request POST:/channels
     * @response `200` `ServicesChannelInfo` OK
     * @response `400` `any` Bad Request
     * @response `500` `any` Internal Server Error
     */
    export namespace ChannelsCreate {
        export type RequestParams = {};
        export type RequestQuery = {};
        export type RequestBody = RequestsChannelRequest;
        export type RequestHeaders = {};
        export type ResponseBody = ServicesChannelInfo;
    }

    /**
     * @description Return the data of one channel
     * @tags channels
     * @name ChannelsDetail
     * @summary Return the data of one channel
     * @request GET:/channels/{id}
     * @response `200` `ServicesChannelInfo` OK
     * @response `500` `any` Internal Server Error
     */
    export namespace ChannelsDetail {
        export type RequestParams = {
            /** Channel id */
            id: number;
        };
        export type RequestQuery = {};
        export type RequestBody = never;
        export type RequestHeaders = {};
        export type ResponseBody = ServicesChannelInfo;
    }

    /**
     * @description Delete channel with all recordings
     * @tags channels
     * @name ChannelsDelete
     * @summary Delete channel
     * @request DELETE:/channels/{id}
     * @response `200` `any` OK
     * @response `500` `any` Internal Server Error
     */
    export namespace ChannelsDelete {
        export type RequestParams = {
            /** List of tags */
            id: number;
        };
        export type RequestQuery = {};
        export type RequestBody = never;
        export type RequestHeaders = {};
        export type ResponseBody = any;
    }

    /**
     * @description Update channel data
     * @tags channels
     * @name ChannelsPartialUpdate
     * @summary Update channel data
     * @request PATCH:/channels/{id}
     * @response `200` `DatabaseChannel` OK
     * @response `400` `any` Bad Request
     * @response `500` `any` Internal Server Error
     */
    export namespace ChannelsPartialUpdate {
        export type RequestParams = {
            /** Channel id */
            id: number;
        };
        export type RequestQuery = {};
        export type RequestBody = RequestsChannelRequest;
        export type RequestHeaders = {};
        export type ResponseBody = DatabaseChannel;
    }

    /**
     * @description Mark channel as one of favorites
     * @tags channels
     * @name FavPartialUpdate
     * @summary Mark channel as one of favorites
     * @request PATCH:/channels/{id}/fav
     * @response `200` `any` OK
     * @response `500` `any` Internal Server Error
     */
    export namespace FavPartialUpdate {
        export type RequestParams = {
            /** Channel id */
            id: number;
        };
        export type RequestQuery = {};
        export type RequestBody = never;
        export type RequestHeaders = {};
        export type ResponseBody = any;
    }

    /**
     * @description Pause channel for recording
     * @tags channels
     * @name PauseCreate
     * @summary Pause channel for recording
     * @request POST:/channels/{id}/pause
     * @response `200` `any` OK
     * @response `500` `any` Internal Server Error
     */
    export namespace PauseCreate {
        export type RequestParams = {
            /** Channel id */
            id: number;
        };
        export type RequestQuery = {};
        export type RequestBody = never;
        export type RequestHeaders = {};
        export type ResponseBody = any;
    }

    /**
     * @description Delete channel with all recordings
     * @tags channels
     * @name ResumeCreate
     * @summary Tag a channel
     * @request POST:/channels/{id}/resume
     * @response `200` `any` OK
     * @response `400` `any` Bad Request
     * @response `500` `any` Internal Server Error
     */
    export namespace ResumeCreate {
        export type RequestParams = {
            /** Channel id */
            id: number;
        };
        export type RequestQuery = {};
        export type RequestBody = never;
        export type RequestHeaders = {};
        export type ResponseBody = any;
    }

    /**
     * @description Tag a channel
     * @tags channels
     * @name TagsPartialUpdate
     * @summary Tag a channel
     * @request PATCH:/channels/{id}/tags
     * @response `200` `any` OK
     * @response `400` `any` Bad Request
     * @response `500` `any` Internal Server Error
     */
    export namespace TagsPartialUpdate {
        export type RequestParams = {
            /** Channel id */
            id: number;
        };
        export type RequestQuery = {};
        export type RequestBody = RequestsChannelTagsUpdateRequest;
        export type RequestHeaders = {};
        export type ResponseBody = any;
    }

    /**
     * @description Remove channel as one of favorites
     * @tags channels
     * @name UnfavPartialUpdate
     * @summary Remove channel as one of favorites
     * @request PATCH:/channels/{id}/unfav
     * @response `200` `any` OK
     * @response `500` `any` Internal Server Error
     */
    export namespace UnfavPartialUpdate {
        export type RequestParams = {
            /** Channel id */
            id: number;
        };
        export type RequestQuery = {};
        export type RequestBody = never;
        export type RequestHeaders = {};
        export type ResponseBody = any;
    }

    /**
     * @description Add a new channel
     * @tags channels
     * @name UploadCreate
     * @summary Add a new channel
     * @request POST:/channels/{id}/upload
     * @response `200` `DatabaseRecording` OK
     * @response `400` `any` Bad Request
     * @response `500` `any` Internal Server Error
     */
    export namespace UploadCreate {
        export type RequestParams = {
            /** Channel id */
            id: number;
        };
        export type RequestQuery = {};
        export type RequestBody = UploadCreatePayload;
        export type RequestHeaders = {};
        export type ResponseBody = DatabaseRecording;
    }
}

export namespace Info {
    /**
     * @description Get disk information
     * @tags info
     * @name DiskList
     * @summary Get disk information
     * @request GET:/info/disk
     * @response `200` `HelpersDiskInfo` OK
     * @response `500` `any` Internal Server Error
     */
    export namespace DiskList {
        export type RequestParams = {};
        export type RequestQuery = {};
        export type RequestBody = never;
        export type RequestHeaders = {};
        export type ResponseBody = HelpersDiskInfo;
    }

    /**
     * @description Get system metrics
     * @tags info
     * @name InfoDetail
     * @summary Get system metrics
     * @request GET:/info/{seconds}
     * @response `200` `HelpersSysInfo` OK
     * @response `500` `any` Internal Server Error
     */
    export namespace InfoDetail {
        export type RequestParams = {
            /** Number of seconds to measure */
            seconds: number;
        };
        export type RequestQuery = {};
        export type RequestBody = never;
        export type RequestHeaders = {};
        export type ResponseBody = HelpersSysInfo;
    }
}

export namespace Jobs {
    /**
     * @description Allow paging through jobs by providing skip, take, statuses, and sort order.
     * @tags jobs
     * @name ListCreate
     * @summary Jobs pagination
     * @request POST:/jobs/list
     * @response `200` `ResponsesJobsResponse` OK
     * @response `400` `any` Error message
     * @response `500` `any` Error message
     */
    export namespace ListCreate {
        export type RequestParams = {};
        export type RequestQuery = {};
        export type RequestBody = RequestsJobsRequest;
        export type RequestHeaders = {};
        export type ResponseBody = ResponsesJobsResponse;
    }

    /**
     * @description Stops the job processing
     * @tags jobs
     * @name PauseCreate
     * @summary Stops the job processing
     * @request POST:/jobs/pause
     * @response `200` `any` OK
     */
    export namespace PauseCreate {
        export type RequestParams = {};
        export type RequestQuery = {};
        export type RequestBody = never;
        export type RequestHeaders = {};
        export type ResponseBody = any;
    }

    /**
     * @description Start the job processing
     * @tags jobs
     * @name ResumeCreate
     * @summary Start the job processing
     * @request POST:/jobs/resume
     * @response `200` `any` OK
     */
    export namespace ResumeCreate {
        export type RequestParams = {};
        export type RequestQuery = {};
        export type RequestBody = never;
        export type RequestHeaders = {};
        export type ResponseBody = any;
    }

    /**
     * @description Interrupt job gracefully
     * @tags jobs
     * @name StopCreate
     * @summary Interrupt job gracefully
     * @request POST:/jobs/stop/{pid}
     * @response `200` `void` OK
     * @response `400` `any` Error message
     * @response `500` `any` Error message
     */
    export namespace StopCreate {
        export type RequestParams = {
            /** Process ID */
            pid: number;
        };
        export type RequestQuery = {};
        export type RequestBody = never;
        export type RequestHeaders = {};
        export type ResponseBody = void;
    }

    /**
     * @description Job worker status
     * @tags jobs
     * @name WorkerList
     * @summary Job worker status
     * @request GET:/jobs/worker
     * @response `200` `ResponsesJobWorkerStatus` OK
     */
    export namespace WorkerList {
        export type RequestParams = {};
        export type RequestQuery = {};
        export type RequestBody = never;
        export type RequestHeaders = {};
        export type ResponseBody = ResponsesJobWorkerStatus;
    }

    /**
     * @description Enqueue a preview job for a video in a channel. For now only preview jobs allowed via REST
     * @tags jobs
     * @name JobsCreate
     * @summary Enqueue a preview job
     * @request POST:/jobs/{id}
     * @response `200` `(DatabaseJob)[]` OK
     * @response `400` `any` Error message
     * @response `500` `any` Error message
     */
    export namespace JobsCreate {
        export type RequestParams = {
            /** Recording item id */
            id: string;
        };
        export type RequestQuery = {};
        export type RequestBody = never;
        export type RequestHeaders = {};
        export type ResponseBody = DatabaseJob[];
    }

    /**
     * @description Interrupt and delete job gracefully
     * @tags jobs
     * @name JobsDelete
     * @summary Interrupt and delete job gracefully
     * @request DELETE:/jobs/{id}
     * @response `200` `any` OK
     * @response `400` `any` Error message
     * @response `500` `any` Error message
     */
    export namespace JobsDelete {
        export type RequestParams = {
            /** Job id */
            id: number;
        };
        export type RequestQuery = {};
        export type RequestBody = never;
        export type RequestHeaders = {};
        export type ResponseBody = any;
    }
}

export namespace Processes {
    /**
     * @description Return a list of streaming processes
     * @tags processes
     * @name ProcessesList
     * @summary Return a list of streaming processes
     * @request GET:/processes
     * @response `200` `(ServicesProcessInfo)[]` OK
     * @response `500` `any` Internal Server Error
     */
    export namespace ProcessesList {
        export type RequestParams = {};
        export type RequestQuery = {};
        export type RequestBody = never;
        export type RequestHeaders = {};
        export type ResponseBody = ServicesProcessInfo[];
    }
}

export namespace Recorder {
    /**
     * @description Return if server is current recording.
     * @tags recorder
     * @name RecorderList
     * @summary Return if server is current recording
     * @request GET:/recorder
     * @response `200` `ResponsesRecordingStatusResponse` OK
     * @response `500` `void` Internal Server Error
     */
    export namespace RecorderList {
        export type RequestParams = {};
        export type RequestQuery = {};
        export type RequestBody = never;
        export type RequestHeaders = {};
        export type ResponseBody = ResponsesRecordingStatusResponse;
    }

    /**
     * No description
     * @tags recorder
     * @name PauseCreate
     * @summary StopRecorder server recording
     * @request POST:/recorder/pause
     * @response `200` `void` OK
     */
    export namespace PauseCreate {
        export type RequestParams = {};
        export type RequestQuery = {};
        export type RequestBody = never;
        export type RequestHeaders = {};
        export type ResponseBody = void;
    }

    /**
     * No description
     * @tags recorder
     * @name ResumeCreate
     * @summary StartRecorder server recording
     * @request POST:/recorder/resume
     * @response `200` `void` OK
     */
    export namespace ResumeCreate {
        export type RequestParams = {};
        export type RequestQuery = {};
        export type RequestBody = never;
        export type RequestHeaders = {};
        export type ResponseBody = void;
    }
}

export namespace Recordings {
    /**
     * @description Return a list of recordings.
     * @tags recordings
     * @name RecordingsList
     * @summary Return a list of recordings
     * @request GET:/recordings
     * @response `200` `(DatabaseRecording)[]` OK
     * @response `500` `any` Error message
     */
    export namespace RecordingsList {
        export type RequestParams = {};
        export type RequestQuery = {};
        export type RequestBody = never;
        export type RequestHeaders = {};
        export type ResponseBody = DatabaseRecording[];
    }

    /**
     * @description Returns all bookmarked recordings.
     * @tags recordings
     * @name BookmarksList
     * @summary Returns all bookmarked recordings
     * @request GET:/recordings/bookmarks
     * @response `200` `(DatabaseRecording)[]` OK
     * @response `500` `any` Error message
     */
    export namespace BookmarksList {
        export type RequestParams = {};
        export type RequestQuery = {};
        export type RequestBody = never;
        export type RequestHeaders = {};
        export type ResponseBody = DatabaseRecording[];
    }

    /**
     * @description Get the top N the latest recordings.
     * @tags recordings
     * @name FilterDetail
     * @summary Get the top N the latest recordings
     * @request GET:/recordings/filter/{column}/{order}/{limit}
     * @response `200` `(DatabaseRecording)[]` OK
     * @response `400` `any` Error message
     * @response `500` `any` Error message
     */
    export namespace FilterDetail {
        export type RequestParams = {
            column: string;
            /** How many recordings */
            limit?: string;
            order: string;
        };
        export type RequestQuery = {};
        export type RequestBody = never;
        export type RequestHeaders = {};
        export type ResponseBody = DatabaseRecording[];
    }

    /**
     * @description Return a list of recordings.
     * @tags recordings
     * @name GeneratePostersCreate
     * @summary Return a list of recordings
     * @request POST:/recordings/generate/posters
     * @response `200` `void` OK
     * @response `500` `any` Error message
     */
    export namespace GeneratePostersCreate {
        export type RequestParams = {};
        export type RequestQuery = {};
        export type RequestBody = never;
        export type RequestHeaders = {};
        export type ResponseBody = void;
    }

    /**
     * @description Returns if current the videos are updated.
     * @tags recordings
     * @name IsupdatingList
     * @summary Returns if current the videos are updated.
     * @request GET:/recordings/isupdating
     * @response `200` `void` OK
     * @response `500` `any` Error message
     */
    export namespace IsupdatingList {
        export type RequestParams = {};
        export type RequestQuery = {};
        export type RequestBody = never;
        export type RequestHeaders = {};
        export type ResponseBody = void;
    }

    /**
     * No description
     * @tags recordings
     * @name RandomDetail
     * @summary Get random videos
     * @request GET:/recordings/random/{limit}
     * @response `200` `(DatabaseRecording)[]` OK
     * @response `400` `any` Error message
     * @response `500` `any` Error message
     */
    export namespace RandomDetail {
        export type RequestParams = {
            /** How many recordings */
            limit?: string;
        };
        export type RequestQuery = {};
        export type RequestBody = never;
        export type RequestHeaders = {};
        export type ResponseBody = DatabaseRecording[];
    }

    /**
     * @description Return a list of recordings.
     * @tags recordings
     * @name UpdateinfoCreate
     * @summary Return a list of recordings
     * @request POST:/recordings/updateinfo
     * @response `200` `void` OK
     * @response `500` `any` Error message
     */
    export namespace UpdateinfoCreate {
        export type RequestParams = {};
        export type RequestQuery = {};
        export type RequestBody = never;
        export type RequestHeaders = {};
        export type ResponseBody = void;
    }

    /**
     * @description Download a file from a channel.
     * @tags recordings
     * @name DownloadDetail
     * @summary Download a file from a channel
     * @request GET:/recordings/{channelName}/{filename}/download
     * @response `200` `void` OK
     * @response `400` `any` Error message
     * @response `500` `any` Error message
     */
    export namespace DownloadDetail {
        export type RequestParams = {
            /** Channel name */
            channelName: string;
            /** Filename to generate the preview for */
            filename: string;
        };
        export type RequestQuery = {};
        export type RequestBody = never;
        export type RequestHeaders = {};
        export type ResponseBody = void;
    }

    /**
     * @description Return a list of recordings for a particular channel.
     * @tags recordings
     * @name RecordingsDetail
     * @summary Return a list of recordings for a particular channel
     * @request GET:/recordings/{id}
     * @response `200` `DatabaseRecording` OK
     * @response `400` `any` Error message
     * @response `500` `any` Error message
     */
    export namespace RecordingsDetail {
        export type RequestParams = {
            /** Recording item id */
            id: number;
        };
        export type RequestQuery = {};
        export type RequestBody = never;
        export type RequestHeaders = {};
        export type ResponseBody = DatabaseRecording;
    }

    /**
     * @description Delete recording
     * @tags recordings
     * @name RecordingsDelete
     * @summary Delete recording
     * @request DELETE:/recordings/{id}
     * @response `200` `void` OK
     * @response `400` `any` Error message
     * @response `500` `any` Error message
     */
    export namespace RecordingsDelete {
        export type RequestParams = {
            /** Recording item id */
            id: number;
        };
        export type RequestQuery = {};
        export type RequestBody = never;
        export type RequestHeaders = {};
        export type ResponseBody = void;
    }

    /**
     * @description Cut a video and merge all defined segments
     * @tags recordings
     * @name CutCreate
     * @summary Cut a video and merge all defined segments
     * @request POST:/recordings/{id}/cut
     * @response `200` `DatabaseJob` OK
     * @response `400` `any` Error message
     * @response `500` `any` Error message
     */
    export namespace CutCreate {
        export type RequestParams = {
            /** Recording item id */
            id: number;
        };
        export type RequestQuery = {};
        export type RequestBody = RequestsCutRequest;
        export type RequestHeaders = {};
        export type ResponseBody = DatabaseJob;
    }

    /**
     * @description Bookmark a certain video in a channel.
     * @tags recordings
     * @name FavPartialUpdate
     * @summary Bookmark a certain video in a channel
     * @request PATCH:/recordings/{id}/fav
     * @response `200` `void` OK
     * @response `400` `any` Error message
     * @response `500` `any` Error message
     */
    export namespace FavPartialUpdate {
        export type RequestParams = {
            /** Recording item id */
            id: number;
        };
        export type RequestQuery = {};
        export type RequestBody = never;
        export type RequestHeaders = {};
        export type ResponseBody = void;
    }

    /**
     * @description Generate preview for a certain video in a channel.
     * @tags recordings
     * @name PreviewCreate
     * @summary Generate preview for a certain video in a channel
     * @request POST:/recordings/{id}/preview
     * @response `200` `(DatabaseJob)[]` OK
     * @response `400` `any` Error message
     * @response `500` `any` Error message
     */
    export namespace PreviewCreate {
        export type RequestParams = {
            /** Recording item id */
            id: number;
        };
        export type RequestQuery = {};
        export type RequestBody = never;
        export type RequestHeaders = {};
        export type ResponseBody = DatabaseJob[];
    }

    /**
     * @description Bookmark a certain video in a channel.
     * @tags recordings
     * @name UnfavPartialUpdate
     * @summary Bookmark a certain video in a channel
     * @request PATCH:/recordings/{id}/unfav
     * @response `200` `void` OK
     * @response `400` `any` Error message
     * @response `500` `any` Error message
     */
    export namespace UnfavPartialUpdate {
        export type RequestParams = {
            /** Recording item id */
            id: number;
        };
        export type RequestQuery = {};
        export type RequestBody = never;
        export type RequestHeaders = {};
        export type ResponseBody = void;
    }

    /**
     * @description Cut a video and merge all defined segments
     * @tags recordings
     * @name ConvertCreate
     * @summary Cut a video and merge all defined segments
     * @request POST:/recordings/{id}/{mediaType}/convert
     * @response `200` `DatabaseJob` OK
     * @response `400` `any` Error message
     * @response `500` `any` Error message
     */
    export namespace ConvertCreate {
        export type RequestParams = {
            /** Recording item id */
            id: number;
            /** Media type to convert to: 720, 1080, mp3 */
            mediaType: string;
        };
        export type RequestQuery = {};
        export type RequestBody = never;
        export type RequestHeaders = {};
        export type ResponseBody = DatabaseJob;
    }
}

export namespace User {
    /**
     * @description Get user profile
     * @tags user
     * @name ProfileCreate
     * @summary Get user profile
     * @request POST:/user/profile
     * @response `200` `any` OK
     * @response `400` `any` Bad Request
     */
    export namespace ProfileCreate {
        export type RequestParams = {};
        export type RequestQuery = {};
        export type RequestBody = never;
        export type RequestHeaders = {};
        export type ResponseBody = any;
    }
}

export type QueryParamsType = Record<string | number, any>;
export type ResponseFormat = keyof Omit<Body, "body" | "bodyUsed">;

export interface FullRequestParams extends Omit<RequestInit, "body"> {
    /** set parameter to `true` for call `securityWorker` for this request */
    secure?: boolean;
    /** request path */
    path: string;
    /** content type of request body */
    type?: ContentType;
    /** query params */
    query?: QueryParamsType;
    /** format of response (i.e. response.json() -> format: "json") */
    format?: ResponseFormat;
    /** request body */
    body?: unknown;
    /** base url */
    baseUrl?: string;
    /** request cancellation token */
    cancelToken?: CancelToken;
}

export type RequestParams = Omit<FullRequestParams, "body" | "method" | "query" | "path">;

export interface ApiConfig<SecurityDataType = unknown> {
    baseUrl?: string;
    baseApiParams?: Omit<RequestParams, "baseUrl" | "cancelToken" | "signal">;
    securityWorker?: (securityData: SecurityDataType | null) => Promise<RequestParams | void> | RequestParams | void;
    customFetch?: typeof fetch;
}

export interface HttpResponse<D extends unknown, E extends unknown = unknown> extends Response {
    data: D;
    error: E;
}

type CancelToken = Symbol | string | number;

export enum ContentType {
    Json = "application/json",
    FormData = "multipart/form-data",
    UrlEncoded = "application/x-www-form-urlencoded",
    Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
    public baseUrl: string = "/api/v1";
    private securityData: SecurityDataType | null = null;
    private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
    private abortControllers = new Map<CancelToken, AbortController>();
    private customFetch = (...fetchParams: Parameters<typeof fetch>) => fetch(...fetchParams);

    private baseApiParams: RequestParams = {
        credentials: "same-origin",
        headers: {},
        redirect: "follow",
        referrerPolicy: "no-referrer",
    };

    constructor(apiConfig: ApiConfig<SecurityDataType> = {}) {
        Object.assign(this, apiConfig);
    }

    public setSecurityData = (data: SecurityDataType | null) => {
        this.securityData = data;
    };

    protected encodeQueryParam(key: string, value: any) {
        const encodedKey = encodeURIComponent(key);
        return `${encodedKey}=${encodeURIComponent(typeof value === "number" ? value : `${value}`)}`;
    }

    protected addQueryParam(query: QueryParamsType, key: string) {
        return this.encodeQueryParam(key, query[key]);
    }

    protected addArrayQueryParam(query: QueryParamsType, key: string) {
        const value = query[key];
        return value.map((v: any) => this.encodeQueryParam(key, v)).join("&");
    }

    protected toQueryString(rawQuery?: QueryParamsType): string {
        const query = rawQuery || {};
        const keys = Object.keys(query).filter((key) => "undefined" !== typeof query[key]);
        return keys.map((key) => (Array.isArray(query[key]) ? this.addArrayQueryParam(query, key) : this.addQueryParam(query, key))).join("&");
    }

    protected addQueryParams(rawQuery?: QueryParamsType): string {
        const queryString = this.toQueryString(rawQuery);
        return queryString ? `?${queryString}` : "";
    }

    private contentFormatters: Record<ContentType, (input: any) => any> = {
        [ContentType.Json]: (input: any) => (input !== null && (typeof input === "object" || typeof input === "string") ? JSON.stringify(input) : input),
        [ContentType.Text]: (input: any) => (input !== null && typeof input !== "string" ? JSON.stringify(input) : input),
        [ContentType.FormData]: (input: any) =>
            Object.keys(input || {}).reduce((formData, key) => {
                const property = input[key];
                formData.append(key, property instanceof Blob ? property : typeof property === "object" && property !== null ? JSON.stringify(property) : `${property}`);
                return formData;
            }, new FormData()),
        [ContentType.UrlEncoded]: (input: any) => this.toQueryString(input),
    };

    protected mergeRequestParams(params1: RequestParams, params2?: RequestParams): RequestParams {
        return {
            ...this.baseApiParams,
            ...params1,
            ...(params2 || {}),
            headers: {
                ...(this.baseApiParams.headers || {}),
                ...(params1.headers || {}),
                ...((params2 && params2.headers) || {}),
            },
        };
    }

    protected createAbortSignal = (cancelToken: CancelToken): AbortSignal | undefined => {
        if (this.abortControllers.has(cancelToken)) {
            const abortController = this.abortControllers.get(cancelToken);
            if (abortController) {
                return abortController.signal;
            }
            return void 0;
        }

        const abortController = new AbortController();
        this.abortControllers.set(cancelToken, abortController);
        return abortController.signal;
    };

    public abortRequest = (cancelToken: CancelToken) => {
        const abortController = this.abortControllers.get(cancelToken);

        if (abortController) {
            abortController.abort();
            this.abortControllers.delete(cancelToken);
        }
    };

    public request = async <T = any, E = any>({ body, secure, path, type, query, format, baseUrl, cancelToken, ...params }: FullRequestParams): Promise<T> => {
        const secureParams = ((typeof secure === "boolean" ? secure : this.baseApiParams.secure) && this.securityWorker && (await this.securityWorker(this.securityData))) || {};
        const requestParams = this.mergeRequestParams(params, secureParams);
        const queryString = query && this.toQueryString(query);
        const payloadFormatter = this.contentFormatters[type || ContentType.Json];
        const responseFormat = format || requestParams.format;

        return this.customFetch(`${baseUrl || this.baseUrl || ""}${path}${queryString ? `?${queryString}` : ""}`, {
            ...requestParams,
            headers: {
                ...(requestParams.headers || {}),
                ...(type && type !== ContentType.FormData ? { "Content-Type": type } : {}),
            },
            signal: (cancelToken ? this.createAbortSignal(cancelToken) : requestParams.signal) || null,
            body: typeof body === "undefined" || body === null ? null : payloadFormatter(body),
        }).then(async (response) => {
            const r = response.clone() as HttpResponse<T, E>;
            r.data = null as unknown as T;
            r.error = null as unknown as E;

            const data = !responseFormat
                ? r
                : await response[responseFormat]()
                      .then((data) => {
                          if (r.ok) {
                              r.data = data;
                          } else {
                              r.error = data;
                          }
                          return r;
                      })
                      .catch((e) => {
                          r.error = e;
                          return r;
                      });

            if (cancelToken) {
                this.abortControllers.delete(cancelToken);
            }

            if (!response.ok) throw data;
            return data.data;
        });
    };
}

/**
 * @title No title
 * @baseUrl /api/v1
 * @contact
 */
export class StreamSinkClient<SecurityDataType extends unknown> {
    http: HttpClient<SecurityDataType>;

    constructor(http: HttpClient<SecurityDataType>) {
        this.http = http;
    }

    admin = {
        /**
         * @description version information
         *
         * @tags admin
         * @name ImportList
         * @summary Returns server version information
         * @request GET:/admin/import
         * @response `200` `ResponsesImportInfoResponse` OK
         * @response `500` `any` Internal Server Error
         */
        importList: (params: RequestParams = {}) =>
            this.http.request<ResponsesImportInfoResponse, any>({
                path: `/admin/import`,
                method: "GET",
                type: ContentType.Json,
                format: "json",
                ...params,
            }),

        /**
         * @description Return a list of channels
         *
         * @tags admin
         * @name ImportCreate
         * @summary Run once the import of mp4 files in the recordings folder, which are not yet in the system
         * @request POST:/admin/import
         * @response `200` `void` OK
         * @response `500` `any` Internal Server Error
         */
        importCreate: (params: RequestParams = {}) =>
            this.http.request<void, any>({
                path: `/admin/import`,
                method: "POST",
                type: ContentType.Json,
                ...params,
            }),

        /**
         * @description version information
         *
         * @tags admin
         * @name VersionList
         * @summary Returns server version information
         * @request GET:/admin/version
         * @response `200` `ResponsesServerInfoResponse` OK
         * @response `500` `any` Internal Server Error
         */
        versionList: (params: RequestParams = {}) =>
            this.http.request<ResponsesServerInfoResponse, any>({
                path: `/admin/version`,
                method: "GET",
                type: ContentType.Json,
                format: "json",
                ...params,
            }),
    };
    auth = {
        /**
         * @description User login
         *
         * @tags auth
         * @name LoginCreate
         * @summary User login
         * @request POST:/auth/login
         * @response `200` `ResponsesLoginResponse` JWT token for authentication
         * @response `400` `string` Error message
         * @response `401` `string` Error message
         */
        loginCreate: (AuthenticationRequest: RequestsAuthenticationRequest, params: RequestParams = {}) =>
            this.http.request<ResponsesLoginResponse, string>({
                path: `/auth/login`,
                method: "POST",
                body: AuthenticationRequest,
                type: ContentType.Json,
                format: "json",
                ...params,
            }),

        /**
         * @description Create new user
         *
         * @tags auth
         * @name SignupCreate
         * @summary Create new user
         * @request POST:/auth/signup
         * @response `200` `any` JWT token for authentication
         * @response `400` `string` Error message
         * @response `500` `string` Error message
         */
        signupCreate: (AuthenticationRequest: RequestsAuthenticationRequest, params: RequestParams = {}) =>
            this.http.request<any, string>({
                path: `/auth/signup`,
                method: "POST",
                body: AuthenticationRequest,
                type: ContentType.Json,
                format: "json",
                ...params,
            }),
    };
    channels = {
        /**
         * @description Return a list of channels
         *
         * @tags channels
         * @name ChannelsList
         * @summary Return a list of channels
         * @request GET:/channels
         * @response `200` `(ServicesChannelInfo)[]` OK
         * @response `500` `any` Internal Server Error
         */
        channelsList: (params: RequestParams = {}) =>
            this.http.request<ServicesChannelInfo[], any>({
                path: `/channels`,
                method: "GET",
                type: ContentType.Json,
                format: "json",
                ...params,
            }),

        /**
         * @description Add a new channel
         *
         * @tags channels
         * @name ChannelsCreate
         * @summary Add a new channel
         * @request POST:/channels
         * @response `200` `ServicesChannelInfo` OK
         * @response `400` `any` Bad Request
         * @response `500` `any` Internal Server Error
         */
        channelsCreate: (ChannelRequest: RequestsChannelRequest, params: RequestParams = {}) =>
            this.http.request<ServicesChannelInfo, any>({
                path: `/channels`,
                method: "POST",
                body: ChannelRequest,
                type: ContentType.Json,
                format: "json",
                ...params,
            }),

        /**
         * @description Return the data of one channel
         *
         * @tags channels
         * @name ChannelsDetail
         * @summary Return the data of one channel
         * @request GET:/channels/{id}
         * @response `200` `ServicesChannelInfo` OK
         * @response `500` `any` Internal Server Error
         */
        channelsDetail: (id: number, params: RequestParams = {}) =>
            this.http.request<ServicesChannelInfo, any>({
                path: `/channels/${id}`,
                method: "GET",
                format: "json",
                ...params,
            }),

        /**
         * @description Delete channel with all recordings
         *
         * @tags channels
         * @name ChannelsDelete
         * @summary Delete channel
         * @request DELETE:/channels/{id}
         * @response `200` `any` OK
         * @response `500` `any` Internal Server Error
         */
        channelsDelete: (id: number, params: RequestParams = {}) =>
            this.http.request<any, any>({
                path: `/channels/${id}`,
                method: "DELETE",
                type: ContentType.Json,
                format: "json",
                ...params,
            }),

        /**
         * @description Update channel data
         *
         * @tags channels
         * @name ChannelsPartialUpdate
         * @summary Update channel data
         * @request PATCH:/channels/{id}
         * @response `200` `DatabaseChannel` OK
         * @response `400` `any` Bad Request
         * @response `500` `any` Internal Server Error
         */
        channelsPartialUpdate: (id: number, ChannelRequest: RequestsChannelRequest, params: RequestParams = {}) =>
            this.http.request<DatabaseChannel, any>({
                path: `/channels/${id}`,
                method: "PATCH",
                body: ChannelRequest,
                type: ContentType.Json,
                format: "json",
                ...params,
            }),

        /**
         * @description Mark channel as one of favorites
         *
         * @tags channels
         * @name FavPartialUpdate
         * @summary Mark channel as one of favorites
         * @request PATCH:/channels/{id}/fav
         * @response `200` `any` OK
         * @response `500` `any` Internal Server Error
         */
        favPartialUpdate: (id: number, params: RequestParams = {}) =>
            this.http.request<any, any>({
                path: `/channels/${id}/fav`,
                method: "PATCH",
                type: ContentType.Json,
                format: "json",
                ...params,
            }),

        /**
         * @description Pause channel for recording
         *
         * @tags channels
         * @name PauseCreate
         * @summary Pause channel for recording
         * @request POST:/channels/{id}/pause
         * @response `200` `any` OK
         * @response `500` `any` Internal Server Error
         */
        pauseCreate: (id: number, params: RequestParams = {}) =>
            this.http.request<any, any>({
                path: `/channels/${id}/pause`,
                method: "POST",
                type: ContentType.Json,
                format: "json",
                ...params,
            }),

        /**
         * @description Delete channel with all recordings
         *
         * @tags channels
         * @name ResumeCreate
         * @summary Tag a channel
         * @request POST:/channels/{id}/resume
         * @response `200` `any` OK
         * @response `400` `any` Bad Request
         * @response `500` `any` Internal Server Error
         */
        resumeCreate: (id: number, params: RequestParams = {}) =>
            this.http.request<any, any>({
                path: `/channels/${id}/resume`,
                method: "POST",
                type: ContentType.Json,
                format: "json",
                ...params,
            }),

        /**
         * @description Tag a channel
         *
         * @tags channels
         * @name TagsPartialUpdate
         * @summary Tag a channel
         * @request PATCH:/channels/{id}/tags
         * @response `200` `any` OK
         * @response `400` `any` Bad Request
         * @response `500` `any` Internal Server Error
         */
        tagsPartialUpdate: (id: number, ChannelTagsUpdateRequest: RequestsChannelTagsUpdateRequest, params: RequestParams = {}) =>
            this.http.request<any, any>({
                path: `/channels/${id}/tags`,
                method: "PATCH",
                body: ChannelTagsUpdateRequest,
                type: ContentType.Json,
                ...params,
            }),

        /**
         * @description Remove channel as one of favorites
         *
         * @tags channels
         * @name UnfavPartialUpdate
         * @summary Remove channel as one of favorites
         * @request PATCH:/channels/{id}/unfav
         * @response `200` `any` OK
         * @response `500` `any` Internal Server Error
         */
        unfavPartialUpdate: (id: number, params: RequestParams = {}) =>
            this.http.request<any, any>({
                path: `/channels/${id}/unfav`,
                method: "PATCH",
                type: ContentType.Json,
                format: "json",
                ...params,
            }),

        /**
         * @description Add a new channel
         *
         * @tags channels
         * @name UploadCreate
         * @summary Add a new channel
         * @request POST:/channels/{id}/upload
         * @response `200` `DatabaseRecording` OK
         * @response `400` `any` Bad Request
         * @response `500` `any` Internal Server Error
         */
        uploadCreate: (id: number, data: UploadCreatePayload, params: RequestParams = {}) =>
            this.http.request<DatabaseRecording, any>({
                path: `/channels/${id}/upload`,
                method: "POST",
                body: data,
                type: ContentType.FormData,
                format: "json",
                ...params,
            }),
    };
    info = {
        /**
         * @description Get disk information
         *
         * @tags info
         * @name DiskList
         * @summary Get disk information
         * @request GET:/info/disk
         * @response `200` `HelpersDiskInfo` OK
         * @response `500` `any` Internal Server Error
         */
        diskList: (params: RequestParams = {}) =>
            this.http.request<HelpersDiskInfo, any>({
                path: `/info/disk`,
                method: "GET",
                type: ContentType.Json,
                format: "json",
                ...params,
            }),

        /**
         * @description Get system metrics
         *
         * @tags info
         * @name InfoDetail
         * @summary Get system metrics
         * @request GET:/info/{seconds}
         * @response `200` `HelpersSysInfo` OK
         * @response `500` `any` Internal Server Error
         */
        infoDetail: (seconds: number, params: RequestParams = {}) =>
            this.http.request<HelpersSysInfo, any>({
                path: `/info/${seconds}`,
                method: "GET",
                type: ContentType.Json,
                format: "json",
                ...params,
            }),
    };
    jobs = {
        /**
         * @description Allow paging through jobs by providing skip, take, statuses, and sort order.
         *
         * @tags jobs
         * @name ListCreate
         * @summary Jobs pagination
         * @request POST:/jobs/list
         * @response `200` `ResponsesJobsResponse` OK
         * @response `400` `any` Error message
         * @response `500` `any` Error message
         */
        listCreate: (JobsRequest: RequestsJobsRequest, params: RequestParams = {}) =>
            this.http.request<ResponsesJobsResponse, any>({
                path: `/jobs/list`,
                method: "POST",
                body: JobsRequest,
                type: ContentType.Json,
                format: "json",
                ...params,
            }),

        /**
         * @description Stops the job processing
         *
         * @tags jobs
         * @name PauseCreate
         * @summary Stops the job processing
         * @request POST:/jobs/pause
         * @response `200` `any` OK
         */
        pauseCreate: (params: RequestParams = {}) =>
            this.http.request<any, any>({
                path: `/jobs/pause`,
                method: "POST",
                ...params,
            }),

        /**
         * @description Start the job processing
         *
         * @tags jobs
         * @name ResumeCreate
         * @summary Start the job processing
         * @request POST:/jobs/resume
         * @response `200` `any` OK
         */
        resumeCreate: (params: RequestParams = {}) =>
            this.http.request<any, any>({
                path: `/jobs/resume`,
                method: "POST",
                ...params,
            }),

        /**
         * @description Interrupt job gracefully
         *
         * @tags jobs
         * @name StopCreate
         * @summary Interrupt job gracefully
         * @request POST:/jobs/stop/{pid}
         * @response `200` `void` OK
         * @response `400` `any` Error message
         * @response `500` `any` Error message
         */
        stopCreate: (pid: number, params: RequestParams = {}) =>
            this.http.request<void, any>({
                path: `/jobs/stop/${pid}`,
                method: "POST",
                type: ContentType.Json,
                ...params,
            }),

        /**
         * @description Job worker status
         *
         * @tags jobs
         * @name WorkerList
         * @summary Job worker status
         * @request GET:/jobs/worker
         * @response `200` `ResponsesJobWorkerStatus` OK
         */
        workerList: (params: RequestParams = {}) =>
            this.http.request<ResponsesJobWorkerStatus, any>({
                path: `/jobs/worker`,
                method: "GET",
                format: "json",
                ...params,
            }),

        /**
         * @description Enqueue a preview job for a video in a channel. For now only preview jobs allowed via REST
         *
         * @tags jobs
         * @name JobsCreate
         * @summary Enqueue a preview job
         * @request POST:/jobs/{id}
         * @response `200` `(DatabaseJob)[]` OK
         * @response `400` `any` Error message
         * @response `500` `any` Error message
         */
        jobsCreate: (id: string, params: RequestParams = {}) =>
            this.http.request<DatabaseJob[], any>({
                path: `/jobs/${id}`,
                method: "POST",
                type: ContentType.Json,
                format: "json",
                ...params,
            }),

        /**
         * @description Interrupt and delete job gracefully
         *
         * @tags jobs
         * @name JobsDelete
         * @summary Interrupt and delete job gracefully
         * @request DELETE:/jobs/{id}
         * @response `200` `any` OK
         * @response `400` `any` Error message
         * @response `500` `any` Error message
         */
        jobsDelete: (id: number, params: RequestParams = {}) =>
            this.http.request<any, any>({
                path: `/jobs/${id}`,
                method: "DELETE",
                type: ContentType.Json,
                format: "json",
                ...params,
            }),
    };
    processes = {
        /**
         * @description Return a list of streaming processes
         *
         * @tags processes
         * @name ProcessesList
         * @summary Return a list of streaming processes
         * @request GET:/processes
         * @response `200` `(ServicesProcessInfo)[]` OK
         * @response `500` `any` Internal Server Error
         */
        processesList: (params: RequestParams = {}) =>
            this.http.request<ServicesProcessInfo[], any>({
                path: `/processes`,
                method: "GET",
                type: ContentType.Json,
                format: "json",
                ...params,
            }),
    };
    recorder = {
        /**
         * @description Return if server is current recording.
         *
         * @tags recorder
         * @name RecorderList
         * @summary Return if server is current recording
         * @request GET:/recorder
         * @response `200` `ResponsesRecordingStatusResponse` OK
         * @response `500` `void` Internal Server Error
         */
        recorderList: (params: RequestParams = {}) =>
            this.http.request<ResponsesRecordingStatusResponse, void>({
                path: `/recorder`,
                method: "GET",
                format: "json",
                ...params,
            }),

        /**
         * No description
         *
         * @tags recorder
         * @name PauseCreate
         * @summary StopRecorder server recording
         * @request POST:/recorder/pause
         * @response `200` `void` OK
         */
        pauseCreate: (params: RequestParams = {}) =>
            this.http.request<void, any>({
                path: `/recorder/pause`,
                method: "POST",
                ...params,
            }),

        /**
         * No description
         *
         * @tags recorder
         * @name ResumeCreate
         * @summary StartRecorder server recording
         * @request POST:/recorder/resume
         * @response `200` `void` OK
         */
        resumeCreate: (params: RequestParams = {}) =>
            this.http.request<void, any>({
                path: `/recorder/resume`,
                method: "POST",
                ...params,
            }),
    };
    recordings = {
        /**
         * @description Return a list of recordings.
         *
         * @tags recordings
         * @name RecordingsList
         * @summary Return a list of recordings
         * @request GET:/recordings
         * @response `200` `(DatabaseRecording)[]` OK
         * @response `500` `any` Error message
         */
        recordingsList: (params: RequestParams = {}) =>
            this.http.request<DatabaseRecording[], any>({
                path: `/recordings`,
                method: "GET",
                type: ContentType.Json,
                format: "json",
                ...params,
            }),

        /**
         * @description Returns all bookmarked recordings.
         *
         * @tags recordings
         * @name BookmarksList
         * @summary Returns all bookmarked recordings
         * @request GET:/recordings/bookmarks
         * @response `200` `(DatabaseRecording)[]` OK
         * @response `500` `any` Error message
         */
        bookmarksList: (params: RequestParams = {}) =>
            this.http.request<DatabaseRecording[], any>({
                path: `/recordings/bookmarks`,
                method: "GET",
                type: ContentType.Json,
                format: "json",
                ...params,
            }),

        /**
         * @description Get the top N the latest recordings.
         *
         * @tags recordings
         * @name FilterDetail
         * @summary Get the top N the latest recordings
         * @request GET:/recordings/filter/{column}/{order}/{limit}
         * @response `200` `(DatabaseRecording)[]` OK
         * @response `400` `any` Error message
         * @response `500` `any` Error message
         */
        filterDetail: (column: string, order: string, limit?: string, params: RequestParams = {}) =>
            this.http.request<DatabaseRecording[], any>({
                path: `/recordings/filter/${column}/${order}/${limit}`,
                method: "GET",
                type: ContentType.Json,
                format: "json",
                ...params,
            }),

        /**
         * @description Return a list of recordings.
         *
         * @tags recordings
         * @name GeneratePostersCreate
         * @summary Return a list of recordings
         * @request POST:/recordings/generate/posters
         * @response `200` `void` OK
         * @response `500` `any` Error message
         */
        generatePostersCreate: (params: RequestParams = {}) =>
            this.http.request<void, any>({
                path: `/recordings/generate/posters`,
                method: "POST",
                type: ContentType.Json,
                ...params,
            }),

        /**
         * @description Returns if current the videos are updated.
         *
         * @tags recordings
         * @name IsupdatingList
         * @summary Returns if current the videos are updated.
         * @request GET:/recordings/isupdating
         * @response `200` `void` OK
         * @response `500` `any` Error message
         */
        isupdatingList: (params: RequestParams = {}) =>
            this.http.request<void, any>({
                path: `/recordings/isupdating`,
                method: "GET",
                type: ContentType.Json,
                ...params,
            }),

        /**
         * No description
         *
         * @tags recordings
         * @name RandomDetail
         * @summary Get random videos
         * @request GET:/recordings/random/{limit}
         * @response `200` `(DatabaseRecording)[]` OK
         * @response `400` `any` Error message
         * @response `500` `any` Error message
         */
        randomDetail: (limit?: string, params: RequestParams = {}) =>
            this.http.request<DatabaseRecording[], any>({
                path: `/recordings/random/${limit}`,
                method: "GET",
                type: ContentType.Json,
                format: "json",
                ...params,
            }),

        /**
         * @description Return a list of recordings.
         *
         * @tags recordings
         * @name UpdateinfoCreate
         * @summary Return a list of recordings
         * @request POST:/recordings/updateinfo
         * @response `200` `void` OK
         * @response `500` `any` Error message
         */
        updateinfoCreate: (params: RequestParams = {}) =>
            this.http.request<void, any>({
                path: `/recordings/updateinfo`,
                method: "POST",
                type: ContentType.Json,
                ...params,
            }),

        /**
         * @description Download a file from a channel.
         *
         * @tags recordings
         * @name DownloadDetail
         * @summary Download a file from a channel
         * @request GET:/recordings/{channelName}/{filename}/download
         * @response `200` `void` OK
         * @response `400` `any` Error message
         * @response `500` `any` Error message
         */
        downloadDetail: (channelName: string, filename: string, params: RequestParams = {}) =>
            this.http.request<void, any>({
                path: `/recordings/${channelName}/${filename}/download`,
                method: "GET",
                type: ContentType.Json,
                ...params,
            }),

        /**
         * @description Return a list of recordings for a particular channel.
         *
         * @tags recordings
         * @name RecordingsDetail
         * @summary Return a list of recordings for a particular channel
         * @request GET:/recordings/{id}
         * @response `200` `DatabaseRecording` OK
         * @response `400` `any` Error message
         * @response `500` `any` Error message
         */
        recordingsDetail: (id: number, params: RequestParams = {}) =>
            this.http.request<DatabaseRecording, any>({
                path: `/recordings/${id}`,
                method: "GET",
                type: ContentType.Json,
                format: "json",
                ...params,
            }),

        /**
         * @description Delete recording
         *
         * @tags recordings
         * @name RecordingsDelete
         * @summary Delete recording
         * @request DELETE:/recordings/{id}
         * @response `200` `void` OK
         * @response `400` `any` Error message
         * @response `500` `any` Error message
         */
        recordingsDelete: (id: number, params: RequestParams = {}) =>
            this.http.request<void, any>({
                path: `/recordings/${id}`,
                method: "DELETE",
                type: ContentType.Json,
                ...params,
            }),

        /**
         * @description Cut a video and merge all defined segments
         *
         * @tags recordings
         * @name CutCreate
         * @summary Cut a video and merge all defined segments
         * @request POST:/recordings/{id}/cut
         * @response `200` `DatabaseJob` OK
         * @response `400` `any` Error message
         * @response `500` `any` Error message
         */
        cutCreate: (id: number, CutRequest: RequestsCutRequest, params: RequestParams = {}) =>
            this.http.request<DatabaseJob, any>({
                path: `/recordings/${id}/cut`,
                method: "POST",
                body: CutRequest,
                type: ContentType.Json,
                format: "json",
                ...params,
            }),

        /**
         * @description Bookmark a certain video in a channel.
         *
         * @tags recordings
         * @name FavPartialUpdate
         * @summary Bookmark a certain video in a channel
         * @request PATCH:/recordings/{id}/fav
         * @response `200` `void` OK
         * @response `400` `any` Error message
         * @response `500` `any` Error message
         */
        favPartialUpdate: (id: number, params: RequestParams = {}) =>
            this.http.request<void, any>({
                path: `/recordings/${id}/fav`,
                method: "PATCH",
                type: ContentType.Json,
                ...params,
            }),

        /**
         * @description Generate preview for a certain video in a channel.
         *
         * @tags recordings
         * @name PreviewCreate
         * @summary Generate preview for a certain video in a channel
         * @request POST:/recordings/{id}/preview
         * @response `200` `(DatabaseJob)[]` OK
         * @response `400` `any` Error message
         * @response `500` `any` Error message
         */
        previewCreate: (id: number, params: RequestParams = {}) =>
            this.http.request<DatabaseJob[], any>({
                path: `/recordings/${id}/preview`,
                method: "POST",
                type: ContentType.Json,
                format: "json",
                ...params,
            }),

        /**
         * @description Bookmark a certain video in a channel.
         *
         * @tags recordings
         * @name UnfavPartialUpdate
         * @summary Bookmark a certain video in a channel
         * @request PATCH:/recordings/{id}/unfav
         * @response `200` `void` OK
         * @response `400` `any` Error message
         * @response `500` `any` Error message
         */
        unfavPartialUpdate: (id: number, params: RequestParams = {}) =>
            this.http.request<void, any>({
                path: `/recordings/${id}/unfav`,
                method: "PATCH",
                type: ContentType.Json,
                ...params,
            }),

        /**
         * @description Cut a video and merge all defined segments
         *
         * @tags recordings
         * @name ConvertCreate
         * @summary Cut a video and merge all defined segments
         * @request POST:/recordings/{id}/{mediaType}/convert
         * @response `200` `DatabaseJob` OK
         * @response `400` `any` Error message
         * @response `500` `any` Error message
         */
        convertCreate: (id: number, mediaType: string, params: RequestParams = {}) =>
            this.http.request<DatabaseJob, any>({
                path: `/recordings/${id}/${mediaType}/convert`,
                method: "POST",
                type: ContentType.Json,
                format: "json",
                ...params,
            }),
    };
    user = {
        /**
         * @description Get user profile
         *
         * @tags user
         * @name ProfileCreate
         * @summary Get user profile
         * @request POST:/user/profile
         * @response `200` `any` OK
         * @response `400` `any` Bad Request
         */
        profileCreate: (params: RequestParams = {}) =>
            this.http.request<any, any>({
                path: `/user/profile`,
                method: "POST",
                type: ContentType.Json,
                format: "json",
                ...params,
            }),
    };
}
