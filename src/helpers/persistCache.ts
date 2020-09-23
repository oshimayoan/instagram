import AsyncStorage from '@react-native-community/async-storage';
import { queryCache, QueryCache, QueryKey } from 'react-query';
import { dehydrate, DehydratedState } from 'react-query/hydration';
import deepEqual from 'deep-equal';

const QUERY_KEYS = 'queryKeys';

export async function getExistingQueryKeys(): Promise<Array<unknown>> {
  let existingQueryKeys = await AsyncStorage.getItem(QUERY_KEYS);
  return existingQueryKeys ? JSON.parse(existingQueryKeys) : [];
}

export async function persistCache(queryKey: QueryKey) {
  // For now, let's skip persisting user cache
  if (queryKey === 'user') {
    return;
  }

  let dehydratedState = dehydrate(queryCache, {
    shouldDehydrate: (query) => {
      let isSameKey = deepEqual(query.queryKey, queryKey, { strict: true });
      return isSameKey && query.state.status === 'success';
    },
  }).queries;

  let existingQueryKeys = await getExistingQueryKeys();
  let isExist =
    existingQueryKeys.filter((existingKey) => deepEqual(existingKey, queryKey))
      .length > 0;

  if (!isExist) {
    let newExistingQueryKeys = [...existingQueryKeys, queryKey];
    await AsyncStorage.setItem(
      QUERY_KEYS,
      JSON.stringify(newExistingQueryKeys),
    );
  }

  let cacheCandidate = dehydratedState.slice(0, 50);
  await AsyncStorage.setItem(
    JSON.stringify(queryKey),
    JSON.stringify(cacheCandidate),
  );
}

export async function getDehydratedState(key: string): Promise<Array<unknown>> {
  let dehydratedState = await AsyncStorage.getItem(key);
  return dehydratedState ? JSON.parse(dehydratedState) : [];
}

export function baseHydrate(
  queryCache: QueryCache,
  dehydratedState: unknown,
): void {
  if (typeof dehydratedState !== 'object' || dehydratedState == null) {
    return;
  }

  const queries = (dehydratedState as DehydratedState).queries || [];

  queries.forEach((dehydratedQuery) => {
    const resolvedConfig = queryCache.getResolvedQueryConfig(
      dehydratedQuery.queryKey,
      dehydratedQuery.config,
    );

    let query = queryCache.getQueryByHash(resolvedConfig.queryHash);

    if (!query) {
      query = queryCache.createQuery(resolvedConfig);
    }

    query.setData(dehydratedQuery.data, {
      updatedAt: dehydratedQuery.updatedAt,
    });
  });
}

export function usePersistCache() {
  let hydrate = async (queryCache: QueryCache) => {
    let existingQueryKeys = await getExistingQueryKeys();

    for (let key of existingQueryKeys) {
      let dehydratedState = await getDehydratedState(JSON.stringify(key));
      let ds = { queries: dehydratedState };
      baseHydrate(queryCache, ds);
    }
  };

  return { hydrate, persist: persistCache };
}
