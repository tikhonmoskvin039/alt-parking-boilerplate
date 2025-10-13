/* eslint-disable react-hooks/refs */
import { addToast } from "@heroui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios, { CanceledError } from "axios";
import { useAuthState } from "providers";
import QueryString from "qs";
import { useCallback, useEffect, useMemo, useRef } from "react";

import configApi from "./configs";

import type {
  ConfigKeys,
  ErrorData,
  ExcludeKeysFromConfig,
  MutateData,
  MutationProps,
  MutationResult,
  QueryErrorMessage,
  RequestKeys,
  RequestQueryOptions,
  RequestQueryProps,
  RequestQueryResult,
} from "./api.types";
import type { MutateOptions, Query, RefetchQueryFilters, Updater, UseMutationResult } from "@tanstack/react-query";
import type { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";

const defaultBaseUrl = import.meta.env.REACT_APP_API_URL || `${window.location.protocol}//${window.location.host}/api`;

declare module "axios" {
  interface AxiosRequestConfig {
    pathParams?: Record<string, string | number | undefined | null>;
  }
}

const client = axios.create({
  headers: { "Content-type": "application/json" },
  paramsSerializer: (params) => QueryString.stringify(params, { arrayFormat: "repeat" }),
});

client.interceptors.request.use((config) => {
  const authToken = localStorage.getItem("authToken");
  config.headers.Authorization = authToken ? `Bearer ${authToken}` : "";
  return config;
});

const getUrlWithPathParams = (path: string, params?: Record<string, string | number | undefined | null>) =>
  Object.entries(params || {}).reduce(
    (acc, [key, value]) => acc?.replace(`:${key}`, encodeURIComponent(String(value))),
    path,
  );

const getConfigMutationWithError = <Data, Variables, Context>(
  props?: MutateOptions<Data, AxiosError<ErrorData>, MutateData<Variables>, Context>,
): MutateOptions<Data, AxiosError<ErrorData>, MutateData<Variables>, Context> => {
  return {
    ...props,
    onError: (error, ...rest) => {
      if (!(error instanceof CanceledError)) {
        props?.onError?.(error, ...rest);
      }
    },
  };
};

const getOptionsMutationWithError = <Data, Variables, Context>(
  props?: Omit<MutationProps<Variables, Data, Context>, "key" | "config" | "cancelable">,
): Omit<MutationProps<Variables, Data, Context>, "key" | "config" | "cancelable"> => {
  return {
    ...props,
    onError: (error, ...rest) => {
      if (!(error instanceof CanceledError)) {
        props?.onError?.(error, ...rest);
      }
    },
  };
};

const useErrorMessages = ({
  error,
  isError,
  errorMessage,
}: {
  error: AxiosError<ErrorData> | null;
  isError: boolean;
  errorMessage?: QueryErrorMessage<ErrorData>;
}) => {
  const { logout } = useAuthState();

  const ignoredCanceledError = useMemo(() => (error instanceof CanceledError ? null : error), [error]);

  useEffect(() => {
    if (errorMessage && ignoredCanceledError && error?.response?.status !== 401) {
      const defaultMessage =
        typeof errorMessage === "boolean" || typeof errorMessage === "function"
          ? error?.response?.data.message
          : errorMessage;

      addToast({
        title: "Ошибка",
        description: typeof errorMessage === "function" ? errorMessage(ignoredCanceledError) : defaultMessage,
        color: "danger",
      });
    }
  }, [error?.response, errorMessage, ignoredCanceledError]);

  useEffect(() => {
    if (error?.response?.status === 401) {
      logout();
    }
  }, [error?.response?.status, isError, logout]);

  return {
    error: ignoredCanceledError,
    isError: error instanceof CanceledError ? false : isError,
  };
};

const useMutationHandlers = <Data, Variables, Context>({
  mutate: defaultMutate,
  mutateAsync: defaultMutateAsync,
}: Pick<UseMutationResult<Data, AxiosError<ErrorData>, MutateData<Variables>, Context>, "mutate" | "mutateAsync">) => {
  const handleMutate = useCallback(
    (
      variables?: Variables,
      mutateOptions?: MutateOptions<Data, AxiosError<ErrorData>, MutateData<Variables>, Context> &
        Pick<AxiosRequestConfig<Data>, "pathParams" | "params">,
    ) => {
      defaultMutate(
        {
          variables,
          params: mutateOptions?.params,
          pathParams: mutateOptions?.pathParams,
        },
        getConfigMutationWithError<Data, Variables, Context>(mutateOptions),
      );
    },
    [defaultMutate],
  );

  const handleMutateAsync = useCallback(
    (
      variables?: Variables,
      mutateOptions?: MutateOptions<Data, AxiosError<ErrorData>, MutateData<Variables>, Context> &
        Pick<AxiosRequestConfig<Data>, "pathParams" | "params">,
    ) =>
      defaultMutateAsync(
        {
          variables,
          params: mutateOptions?.params,
          pathParams: mutateOptions?.pathParams,
        },
        getConfigMutationWithError<Data, Variables, Context>(mutateOptions),
      ),
    [defaultMutateAsync],
  );

  return { mutate: handleMutate, mutateAsync: handleMutateAsync };
};

export const useApi = <Data, Variables = unknown>(key: keyof typeof configApi, cancelable?: boolean) => {
  const configApiParams = configApi[key];
  const abortController = useRef<AbortController | null>(null);

  const baseUrl = "baseUrl" in configApiParams ? configApiParams.baseUrl : defaultBaseUrl;

  const cancelRequest = useCallback(() => {
    if (cancelable) {
      abortController.current?.abort();
      abortController.current = new AbortController();
    }
  }, [cancelable]);

  const get = async (config?: AxiosRequestConfig) => {
    cancelRequest();

    if (!("GET" in configApiParams)) {
      throw Error(`Добавьте GET в конфиг api для ключа "${key}"`);
    }

    const { data } = await client.get<Data>(
      baseUrl + getUrlWithPathParams(String(configApiParams.GET), config?.pathParams),
      {
        ...config,
        signal: abortController.current?.signal,
      },
    );
    return data;
  };

  const post = async (variables?: Variables, config?: AxiosRequestConfig<Variables>) => {
    cancelRequest();

    if (!("POST" in configApiParams)) {
      throw Error(`Добавьте POST в конфиг api для ключа "${key}"`);
    }

    const { data } = await client.post<Data, AxiosResponse<Data>, Variables>(
      baseUrl + getUrlWithPathParams(String(configApiParams.POST), config?.pathParams),
      variables,
      {
        ...config,
        signal: abortController.current?.signal,
      },
    );
    return data;
  };

  const put = async (variables?: Variables, config?: AxiosRequestConfig<Variables>) => {
    cancelRequest();

    if (!("PUT" in configApiParams)) {
      throw Error(`Добавьте PUT в конфиг api для ключа "${key}"`);
    }

    const { data } = await client.put<Data, AxiosResponse<Data>, Variables>(
      baseUrl + getUrlWithPathParams(String(configApiParams.PUT), config?.pathParams),
      variables,
      {
        ...config,
        signal: abortController.current?.signal,
      },
    );
    return data;
  };

  const patch = async (variables?: Variables, config?: AxiosRequestConfig<Variables>) => {
    cancelRequest();

    if (!("PATCH" in configApiParams)) {
      throw Error(`Добавьте PATCH в конфиг api для ключа "${key}"`);
    }

    const { data } = await client.patch<Data, AxiosResponse<Data>, Variables>(
      baseUrl + getUrlWithPathParams(String(configApiParams.PATCH), config?.pathParams),
      variables,
      { ...config, signal: abortController.current?.signal },
    );
    return data;
  };

  const deleteMethod = async (config?: AxiosRequestConfig<Variables>) => {
    cancelRequest();

    if (!("DELETE" in configApiParams)) {
      throw Error(`Добавьте DELETE в конфиг api для ключа "${key}"`);
    }

    const { data } = await client.delete<Data>(
      baseUrl + getUrlWithPathParams(String(configApiParams.DELETE), config?.pathParams),
      {
        ...config,
        signal: abortController.current?.signal,
      },
    );
    return data;
  };

  return {
    get,
    post,
    put,
    patch,
    deleteMethod,
    abort: () => abortController.current?.abort(),
  };
};

export const useRequestQuery = <Data = unknown, Variables = unknown, SelectData = Data>(
  key: RequestKeys<"GET"> | RequestKeys<"POST">,
  props?: RequestQueryProps<Data, SelectData>,
): RequestQueryResult<Data, SelectData> => {
  const { config, cancelable, queryKey: defaultQueryKey, errorMessage, params, pathParams, ...options } = props || {};
  const axiosConfig = useRef<RequestQueryOptions>(undefined);
  const { GET, POST } =
    configApi[
      key.split(".")[0] as keyof ExcludeKeysFromConfig<ConfigKeys<typeof configApi, "GET">> &
        keyof ExcludeKeysFromConfig<ConfigKeys<typeof configApi, "POST">>
    ];
  const queryClient = useQueryClient();
  const { get, post, abort } = useApi<Data, Variables>(key.split(".")[0] as keyof typeof configApi, cancelable);

  const queryKey = useMemo(
    () =>
      defaultQueryKey || [
        key +
          getUrlWithPathParams(key.split(".")[1] === "post" ? POST : GET, {
            ...pathParams,
            ...axiosConfig.current?.pathParams,
          }) +
          new URLSearchParams({
            ...params,
            ...axiosConfig.current?.params,
          }).toString() +
          (config?.data ? JSON.stringify(config?.data) : ""),
      ],
    [GET, POST, config?.data, defaultQueryKey, key, params, pathParams],
  );

  const queryFn = useCallback(() => {
    switch (key.split(".")[1]) {
      case "post":
        return post(config?.data, {
          ...config,
          params: { ...axiosConfig.current?.params, ...params },
          pathParams: { ...axiosConfig.current?.pathParams, ...pathParams },
        });

      default:
        return get({
          ...config,
          params: { ...axiosConfig.current?.params, ...params },
          pathParams: { ...axiosConfig.current?.pathParams, ...pathParams },
        });
    }
  }, [config, get, key, params, pathParams, post]);

  const {
    refetch: defaultRefetch,
    error,
    isError,
    ...other
  } = useQuery<Data, AxiosError<ErrorData>, SelectData>({ queryKey, queryFn, ...options }, queryClient);

  const refetch = useCallback(
    (refetchOptions?: RefetchQueryFilters & RequestQueryOptions) => {
      axiosConfig.current = refetchOptions;
      return defaultRefetch(refetchOptions);
    },
    [defaultRefetch],
  );

  const updateQueryData = useCallback(
    (updater: Updater<Data | undefined, Data | undefined>) => queryClient.setQueryData<Data>(queryKey, updater),
    [queryClient, queryKey],
  );

  const removeAllQueries = useCallback(() => {
    queryClient.removeQueries({
      predicate: (query: Query) => Boolean(query.queryKey.find((value) => (value as string).includes(key))),
    });
  }, [key, queryClient]);

  const errors = useErrorMessages({ error, isError, errorMessage });

  return {
    refetch,
    queryKey,
    updateQueryData,
    abort,
    removeAllQueries,
    ...errors,
    ...other,
  };
};

export const useRequestMutation = <Variables = unknown, Data = unknown, Context = unknown>(
  key: RequestKeys<"GET"> | RequestKeys<"POST"> | RequestKeys<"PUT"> | RequestKeys<"PATCH"> | RequestKeys<"DELETE">,
  props?: MutationProps<Variables, Data, Context>,
): MutationResult<Variables, Data, Context> => {
  const { config, cancelable, errorMessage, params, pathParams, isFormData, ...options } = props || {};
  const { get, post, put, deleteMethod, patch, abort } = useApi<Data, Variables>(
    key.split(".")[0] as keyof typeof configApi,
    cancelable,
  );

  const mutationFn = (data?: MutateData<Variables>) => {
    const requestParams = {
      ...config,
      params: { ...params, ...data?.params },
      pathParams: { ...pathParams, ...data?.pathParams },
    };

    if (isFormData) {
      requestParams.headers = {
        "Content-Type": "multipart/form-data",
      };
    }

    switch (key.split(".")[1]) {
      case "get":
        return get(requestParams);
      case "put":
        return put(data?.variables, requestParams);
      case "patch":
        return patch(data?.variables, requestParams);
      case "delete":
        return deleteMethod({
          ...requestParams,
          data: config?.data || data?.variables,
        });
      default:
        return post(data?.variables, requestParams);
    }
  };

  const { mutate, mutateAsync, error, isError, ...other } = useMutation<
    Data,
    AxiosError<ErrorData>,
    MutateData<Variables>,
    Context
  >({ mutationFn, ...getOptionsMutationWithError(options) });

  const mutateHandlers = useMutationHandlers({ mutate, mutateAsync });
  const errors = useErrorMessages({ error, isError, errorMessage });

  return { abort, ...errors, ...mutateHandlers, ...other };
};
