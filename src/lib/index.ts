/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable @typescript-eslint/consistent-type-assertions */
import axios, { AxiosRequestConfig } from 'axios';
import { isStr, isUnknownDict } from 'utils';
import { APIError } from './errors';

interface ApiOpt {
  token: string;
}

interface ApiReqOpt {
  method: 'POST' | 'GET';
  path: string;
  data?: unknown;
  params?: Record<string, string | number>;
}

interface ApiRespOpt<R = unknown> {
  ok: boolean;
  error?: string;
  result: R;
}

export const getApi = ({ token }: ApiOpt) => {
  const apiReq = async <R = unknown>(reqOpt: ApiReqOpt) => {
    const { method, path, data } = reqOpt;
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
    getPageList: async (params?: { limit?: number; offset?: number }) => apiReq({ method: 'GET', path: 'getPageList', params }),
  };
};

const isRespOk = (val: number) => val >= 200 && val <= 299;

export * from './errors';
