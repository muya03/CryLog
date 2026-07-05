import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { Cry, CryInput, CryPatch, GetHeatmapParams, GetStatsOverviewParams, GetTrendsParams, GetWrappedParams, HealthStatus, HeatmapDay, ListCriesParams, PoemRequest, PoemResponse, StatsOverview, TrendStats, User, WrappedSummary } from './api.schemas';
import { customFetch } from '../custom-fetch';
import type { ErrorType, BodyType } from '../custom-fetch';
type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];
export declare const getHealthCheckUrl: () => string;
/**
 * @summary Health check
 */
export declare const healthCheck: (options?: RequestInit) => Promise<HealthStatus>;
export declare const getHealthCheckQueryKey: () => readonly ["/api/healthz"];
export declare const getHealthCheckQueryOptions: <TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData> & {
    queryKey: QueryKey;
};
export type HealthCheckQueryResult = NonNullable<Awaited<ReturnType<typeof healthCheck>>>;
export type HealthCheckQueryError = ErrorType<unknown>;
/**
 * @summary Health check
 */
export declare function useHealthCheck<TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetMeUrl: () => string;
/**
 * @summary Get current user profile
 */
export declare const getMe: (options?: RequestInit) => Promise<User>;
export declare const getGetMeQueryKey: () => readonly ["/api/users/me"];
export declare const getGetMeQueryOptions: <TData = Awaited<ReturnType<typeof getMe>>, TError = ErrorType<void>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMe>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getMe>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetMeQueryResult = NonNullable<Awaited<ReturnType<typeof getMe>>>;
export type GetMeQueryError = ErrorType<void>;
/**
 * @summary Get current user profile
 */
export declare function useGetMe<TData = Awaited<ReturnType<typeof getMe>>, TError = ErrorType<void>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMe>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getListUsersUrl: () => string;
/**
 * @summary List all users in the group
 */
export declare const listUsers: (options?: RequestInit) => Promise<User[]>;
export declare const getListUsersQueryKey: () => readonly ["/api/users"];
export declare const getListUsersQueryOptions: <TData = Awaited<ReturnType<typeof listUsers>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listUsers>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listUsers>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListUsersQueryResult = NonNullable<Awaited<ReturnType<typeof listUsers>>>;
export type ListUsersQueryError = ErrorType<unknown>;
/**
 * @summary List all users in the group
 */
export declare function useListUsers<TData = Awaited<ReturnType<typeof listUsers>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listUsers>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetUserProfileUrl: (userId: string) => string;
/**
 * @summary Get a user's public profile
 */
export declare const getUserProfile: (userId: string, options?: RequestInit) => Promise<User>;
export declare const getGetUserProfileQueryKey: (userId: string) => readonly [`/api/users/${string}`];
export declare const getGetUserProfileQueryOptions: <TData = Awaited<ReturnType<typeof getUserProfile>>, TError = ErrorType<unknown>>(userId: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getUserProfile>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getUserProfile>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetUserProfileQueryResult = NonNullable<Awaited<ReturnType<typeof getUserProfile>>>;
export type GetUserProfileQueryError = ErrorType<unknown>;
/**
 * @summary Get a user's public profile
 */
export declare function useGetUserProfile<TData = Awaited<ReturnType<typeof getUserProfile>>, TError = ErrorType<unknown>>(userId: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getUserProfile>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getListCriesUrl: (params?: ListCriesParams) => string;
/**
 * @summary List cry logs (own or all users)
 */
export declare const listCries: (params?: ListCriesParams, options?: RequestInit) => Promise<Cry[]>;
export declare const getListCriesQueryKey: (params?: ListCriesParams) => readonly ["/api/cries", ...ListCriesParams[]];
export declare const getListCriesQueryOptions: <TData = Awaited<ReturnType<typeof listCries>>, TError = ErrorType<unknown>>(params?: ListCriesParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listCries>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listCries>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListCriesQueryResult = NonNullable<Awaited<ReturnType<typeof listCries>>>;
export type ListCriesQueryError = ErrorType<unknown>;
/**
 * @summary List cry logs (own or all users)
 */
export declare function useListCries<TData = Awaited<ReturnType<typeof listCries>>, TError = ErrorType<unknown>>(params?: ListCriesParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listCries>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateCryUrl: () => string;
/**
 * @summary Log a new cry
 */
export declare const createCry: (cryInput: CryInput, options?: RequestInit) => Promise<Cry>;
export declare const getCreateCryMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createCry>>, TError, {
        data: BodyType<CryInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createCry>>, TError, {
    data: BodyType<CryInput>;
}, TContext>;
export type CreateCryMutationResult = NonNullable<Awaited<ReturnType<typeof createCry>>>;
export type CreateCryMutationBody = BodyType<CryInput>;
export type CreateCryMutationError = ErrorType<void>;
/**
* @summary Log a new cry
*/
export declare const useCreateCry: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createCry>>, TError, {
        data: BodyType<CryInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createCry>>, TError, {
    data: BodyType<CryInput>;
}, TContext>;
export declare const getGetCryUrl: (id: number) => string;
/**
 * @summary Get a single cry log
 */
export declare const getCry: (id: number, options?: RequestInit) => Promise<Cry>;
export declare const getGetCryQueryKey: (id: number) => readonly [`/api/cries/${number}`];
export declare const getGetCryQueryOptions: <TData = Awaited<ReturnType<typeof getCry>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCry>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getCry>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetCryQueryResult = NonNullable<Awaited<ReturnType<typeof getCry>>>;
export type GetCryQueryError = ErrorType<unknown>;
/**
 * @summary Get a single cry log
 */
export declare function useGetCry<TData = Awaited<ReturnType<typeof getCry>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCry>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getUpdateCryUrl: (id: number) => string;
/**
 * @summary Update own cry log
 */
export declare const updateCry: (id: number, cryPatch: CryPatch, options?: RequestInit) => Promise<Cry>;
export declare const getUpdateCryMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateCry>>, TError, {
        id: number;
        data: BodyType<CryPatch>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateCry>>, TError, {
    id: number;
    data: BodyType<CryPatch>;
}, TContext>;
export type UpdateCryMutationResult = NonNullable<Awaited<ReturnType<typeof updateCry>>>;
export type UpdateCryMutationBody = BodyType<CryPatch>;
export type UpdateCryMutationError = ErrorType<unknown>;
/**
* @summary Update own cry log
*/
export declare const useUpdateCry: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateCry>>, TError, {
        id: number;
        data: BodyType<CryPatch>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateCry>>, TError, {
    id: number;
    data: BodyType<CryPatch>;
}, TContext>;
export declare const getDeleteCryUrl: (id: number) => string;
/**
 * @summary Delete own cry log
 */
export declare const deleteCry: (id: number, options?: RequestInit) => Promise<void>;
export declare const getDeleteCryMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteCry>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteCry>>, TError, {
    id: number;
}, TContext>;
export type DeleteCryMutationResult = NonNullable<Awaited<ReturnType<typeof deleteCry>>>;
export type DeleteCryMutationError = ErrorType<unknown>;
/**
* @summary Delete own cry log
*/
export declare const useDeleteCry: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteCry>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteCry>>, TError, {
    id: number;
}, TContext>;
export declare const getGetHeatmapUrl: (params?: GetHeatmapParams) => string;
/**
 * @summary GitHub-style heatmap data (cries per day)
 */
export declare const getHeatmap: (params?: GetHeatmapParams, options?: RequestInit) => Promise<HeatmapDay[]>;
export declare const getGetHeatmapQueryKey: (params?: GetHeatmapParams) => readonly ["/api/stats/heatmap", ...GetHeatmapParams[]];
export declare const getGetHeatmapQueryOptions: <TData = Awaited<ReturnType<typeof getHeatmap>>, TError = ErrorType<unknown>>(params?: GetHeatmapParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getHeatmap>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getHeatmap>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetHeatmapQueryResult = NonNullable<Awaited<ReturnType<typeof getHeatmap>>>;
export type GetHeatmapQueryError = ErrorType<unknown>;
/**
 * @summary GitHub-style heatmap data (cries per day)
 */
export declare function useGetHeatmap<TData = Awaited<ReturnType<typeof getHeatmap>>, TError = ErrorType<unknown>>(params?: GetHeatmapParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getHeatmap>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetTrendsUrl: (params?: GetTrendsParams) => string;
/**
 * @summary Trend analysis - weekday/hour patterns, type breakdowns
 */
export declare const getTrends: (params?: GetTrendsParams, options?: RequestInit) => Promise<TrendStats>;
export declare const getGetTrendsQueryKey: (params?: GetTrendsParams) => readonly ["/api/stats/trends", ...GetTrendsParams[]];
export declare const getGetTrendsQueryOptions: <TData = Awaited<ReturnType<typeof getTrends>>, TError = ErrorType<unknown>>(params?: GetTrendsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getTrends>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getTrends>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetTrendsQueryResult = NonNullable<Awaited<ReturnType<typeof getTrends>>>;
export type GetTrendsQueryError = ErrorType<unknown>;
/**
 * @summary Trend analysis - weekday/hour patterns, type breakdowns
 */
export declare function useGetTrends<TData = Awaited<ReturnType<typeof getTrends>>, TError = ErrorType<unknown>>(params?: GetTrendsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getTrends>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetWrappedUrl: (params?: GetWrappedParams) => string;
/**
 * @summary Annual Cry Wrapped summary
 */
export declare const getWrapped: (params?: GetWrappedParams, options?: RequestInit) => Promise<WrappedSummary>;
export declare const getGetWrappedQueryKey: (params?: GetWrappedParams) => readonly ["/api/stats/wrapped", ...GetWrappedParams[]];
export declare const getGetWrappedQueryOptions: <TData = Awaited<ReturnType<typeof getWrapped>>, TError = ErrorType<unknown>>(params?: GetWrappedParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getWrapped>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getWrapped>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetWrappedQueryResult = NonNullable<Awaited<ReturnType<typeof getWrapped>>>;
export type GetWrappedQueryError = ErrorType<unknown>;
/**
 * @summary Annual Cry Wrapped summary
 */
export declare function useGetWrapped<TData = Awaited<ReturnType<typeof getWrapped>>, TError = ErrorType<unknown>>(params?: GetWrappedParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getWrapped>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetStatsOverviewUrl: (params?: GetStatsOverviewParams) => string;
/**
 * @summary High-level stats (total cries, avg intensity, most common type)
 */
export declare const getStatsOverview: (params?: GetStatsOverviewParams, options?: RequestInit) => Promise<StatsOverview>;
export declare const getGetStatsOverviewQueryKey: (params?: GetStatsOverviewParams) => readonly ["/api/stats/overview", ...GetStatsOverviewParams[]];
export declare const getGetStatsOverviewQueryOptions: <TData = Awaited<ReturnType<typeof getStatsOverview>>, TError = ErrorType<unknown>>(params?: GetStatsOverviewParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getStatsOverview>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getStatsOverview>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetStatsOverviewQueryResult = NonNullable<Awaited<ReturnType<typeof getStatsOverview>>>;
export type GetStatsOverviewQueryError = ErrorType<unknown>;
/**
 * @summary High-level stats (total cries, avg intensity, most common type)
 */
export declare function useGetStatsOverview<TData = Awaited<ReturnType<typeof getStatsOverview>>, TError = ErrorType<unknown>>(params?: GetStatsOverviewParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getStatsOverview>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGeneratePoemUrl: () => string;
/**
 * @summary Generate a comforting Lorca-inspired poem for the calm corner
 */
export declare const generatePoem: (poemRequest: PoemRequest, options?: RequestInit) => Promise<PoemResponse>;
export declare const getGeneratePoemMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof generatePoem>>, TError, {
        data: BodyType<PoemRequest>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof generatePoem>>, TError, {
    data: BodyType<PoemRequest>;
}, TContext>;
export type GeneratePoemMutationResult = NonNullable<Awaited<ReturnType<typeof generatePoem>>>;
export type GeneratePoemMutationBody = BodyType<PoemRequest>;
export type GeneratePoemMutationError = ErrorType<unknown>;
/**
* @summary Generate a comforting Lorca-inspired poem for the calm corner
*/
export declare const useGeneratePoem: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof generatePoem>>, TError, {
        data: BodyType<PoemRequest>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof generatePoem>>, TError, {
    data: BodyType<PoemRequest>;
}, TContext>;
export {};
//# sourceMappingURL=api.d.ts.map