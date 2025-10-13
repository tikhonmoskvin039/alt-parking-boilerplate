import { ReactNode } from "react";

import configApi from "./configs";

import type {
  MutateOptions,
  QueryObserverResult,
  RefetchOptions,
  RefetchQueryFilters,
  UndefinedInitialDataOptions,
  Updater,
  UseMutationOptions,
  UseMutationResult,
  UseQueryResult,
} from "@tanstack/react-query";
import type { AxiosError, AxiosRequestConfig } from "axios";

export type ConfigApiParams = { baseUrl?: string } & Partial<
  Record<"GET" | "POST" | "PATCH" | "PUT" | "DELETE", string>
>;

export interface ErrorData {
  message: string;
}

export interface MutationProps<Variables, Data, Context>
  extends UseMutationOptions<Data, AxiosError<ErrorData>, MutateData<Variables>, Context>,
    Pick<AxiosRequestConfig, "params" | "pathParams"> {
  config?: Omit<AxiosRequestConfig<Variables>, "params" | "pathParams">;
  cancelable?: boolean;
  errorMessage?: QueryErrorMessage<ErrorData>;
  isFormData?: boolean;
}

export type MutateData<Variables> =
  | (Pick<AxiosRequestConfig, "params" | "pathParams"> & {
      variables?: Variables;
    })
  | undefined;

export interface MutationResult<Variables, Data, Context>
  extends Omit<
    UseMutationResult<Data, AxiosError<ErrorData>, MutateData<Variables>, Context>,
    "mutate" | "mutateAsync"
  > {
  mutate: (
    data?: Variables,
    options?: Pick<AxiosRequestConfig, "params" | "pathParams"> &
      MutateOptions<Data, AxiosError<ErrorData>, MutateData<Variables>, Context>,
  ) => void;
  mutateAsync: (
    data?: Variables,
    options?: Pick<AxiosRequestConfig, "params" | "pathParams"> &
      MutateOptions<Data, AxiosError<ErrorData>, MutateData<Variables>, Context>,
  ) => Promise<Data>;
  abort: () => void;
}

export interface RequestQueryProps<Data, SelectData = Data>
  extends Omit<
      UndefinedInitialDataOptions<Data, AxiosError<ErrorData>, SelectData>,
      "queryKey" | "queryFn" | "initialData"
    >,
    Pick<AxiosRequestConfig, "params" | "pathParams"> {
  cancelable?: boolean;
  config?: Omit<AxiosRequestConfig, "params" | "pathParams">;
  queryKey?: string[];
  errorMessage?: QueryErrorMessage<ErrorData>;
}

export type RequestQueryOptions = RefetchOptions & Pick<AxiosRequestConfig, "params" | "pathParams">;

export interface RequestQueryResult<Data, SelectData = Data>
  extends Omit<UseQueryResult<SelectData, AxiosError<ErrorData>>, "refetch"> {
  refetch: (
    options?: RefetchQueryFilters & RequestQueryOptions,
  ) => Promise<QueryObserverResult<SelectData, AxiosError<ErrorData>>>;
  queryKey: string[];
  updateQueryData: (updater: Updater<Data | undefined, Data | undefined>) => void;
  abort: () => void;
  removeAllQueries: () => void;
}

export type QueryErrorMessage<Data> = ReactNode | ((error: AxiosError<Data>) => ReactNode) | boolean;

export type ConfigKeys<Config extends typeof configApi, Method extends keyof ConfigApiParams> = {
  [K in keyof Config]-?: Config[K] extends Required<Pick<ConfigApiParams, Method>> ? Config[K] : never;
};

export type ExcludeKeysFromConfig<T extends typeof configApi> = {
  [K in keyof T as T[K] extends never ? never : K]: T[K];
};

type AddMethodPostfix<T extends keyof typeof configApi, M extends keyof ConfigApiParams> = `${T}.${Lowercase<M>}`;

export type RequestKeys<M extends keyof ConfigApiParams> = AddMethodPostfix<
  keyof ExcludeKeysFromConfig<ConfigKeys<typeof configApi, M>>,
  M
>;
