import axios from 'axios';
import { isStr, isUnknownDict, log } from 'utils';

import { APIError } from './errors';
import { TelegraphAccount, TelegraphChild, TelegraphPage, TelegraphPageList } from './types';

interface ApiOpt {
  token?: string;
}

interface ApiReqOpt {
  path: string;
  auth: boolean;
  data?: unknown;
}

interface ApiRespOpt<R = unknown> {
  ok: boolean;
  error?: string;
  result: R;
}

export const getApi = (apiOpt?: ApiOpt) => {
  const token = apiOpt?.token;

  const apiReq = async <R = unknown>(reqOpt: ApiReqOpt) => {
    const { path, auth } = reqOpt;
    if (auth && !token) {
      throw new Error('access token not provided, use setAccessToken command or --token param');
    }

    const getData = () => {
      const { data } = reqOpt;
      if (!auth) {
        return data;
      } else {
        if (isUnknownDict(data)) {
          return { ...data, access_token: token };
        } else {
          return { access_token: token };
        }
      }
    };

    const url = `https://api.telegra.ph/${path}`;
    const reqData = getData();
    log.verbose('api req', `url=${url}`, `data=${JSON.stringify(reqData)}`);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const {
      status,
      statusText,
      data: body,
    } = await axios.post<ApiRespOpt<R>>(url, reqData ? JSON.stringify(reqData) : undefined, {
      headers: { 'Content-Type': 'application/json' },
    });
    log.verbose('api req done', `status=${status}`, `body=${JSON.stringify(body)}`);
    if (!isRespOk(status)) {
      throw new APIError(statusText, status);
    }
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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

  const createAccount = async (data: { short_name: string; author_name?: string; author_url?: string }) =>
    apiReq<TelegraphAccount>({ auth: false, path: `createAccount`, data });

  const createPage = async (data: {
    title: string;
    author_name?: string;
    author_url?: string;
    content: TelegraphChild[];
    return_content?: boolean;
  }) => apiReq<TelegraphPage>({ auth: true, path: `createPage`, data });

  const getPage = async (path: string, data?: { return_content?: boolean }) =>
    apiReq<TelegraphPage>({ auth: false, path: `getPage/${path}`, data });

  const getPageList = async (data?: { limit?: number; offset?: number }) =>
    apiReq<TelegraphPageList>({ auth: true, path: 'getPageList', data });

  return {
    createAccount,
    createPage,
    getPage,
    getPageList,
  };
};

const isRespOk = (val: number) => val >= 200 && val <= 299;
