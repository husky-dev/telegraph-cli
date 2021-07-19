/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable @typescript-eslint/consistent-type-assertions */
import axios, { AxiosRequestConfig } from 'axios';
import { isStr, isUnknownDict } from 'utils';
import { APIError } from './errors';

interface ApiOpt {
  token?: string;
}

interface ApiReqOpt {
  method: 'POST' | 'GET';
  path: string;
  auth: boolean;
  data?: unknown;
  params?: Record<string, string | number | boolean>;
}

interface ApiRespOpt<R = unknown> {
  ok: boolean;
  error?: string;
  result: R;
}

export const getApi = (apiOpt?: ApiOpt) => {
  const token = apiOpt?.token;

  const apiReq = async <R = unknown>(reqOpt: ApiReqOpt) => {
    const { method, path, data, auth } = reqOpt;
    if (auth && !token) {
      throw new Error('access token not provided, use setAccessToken command or --token param');
    }
    const url = `https://api.telegra.ph/${path}`;
    const params = reqOpt.params ? { ...reqOpt.params, access_token: token } : { access_token: token };
    const config: AxiosRequestConfig = { data, params };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const {
      status,
      statusText,
      data: body,
    } = method === 'GET' ? await axios.get<ApiRespOpt<R>>(url, config) : await axios.post<ApiRespOpt<R>>(url, config);
    if (!isRespOk(status)) {
      throw new APIError(statusText, status);
    }
    if (!body) {
      throw new Error('Resonse body is empty');
    }
    if (!isUnknownDict(body)) {
      throw new Error('Wrong response format: not a directory');
    }
    if (typeof body.ok !== 'boolean') {
      throw new Error('Wrong response format: ok field is not boolean');
    }
    if (!body.ok) {
      const message = isStr(body.error) ? body.error : 'Unknown error';
      throw new Error(message);
    }
    return body.result;
  };

  return {
    getPage: async (path: string, params?: { return_content?: boolean }) =>
      apiReq({ auth: false, method: 'GET', path: `getPage/${path}`, params }),
    getPageList: async (params?: { limit?: number; offset?: number }) =>
      apiReq({ auth: true, method: 'GET', path: 'getPageList', params }),
  };
};

const isRespOk = (val: number) => val >= 200 && val <= 299;
