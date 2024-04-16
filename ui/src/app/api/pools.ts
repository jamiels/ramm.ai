import useSWR from 'swr'
import {useMemo} from 'react'
import {endpoints, fetcher, poster} from '../utils/axios'

// ----------------------------------------------------------------------

export function useGetPoolsList() {

  const {data, isLoading, error} = useSWR(endpoints.pools.list, fetcher)

  const memoizedValue = useMemo(
    () => ({
      pools: data,
      poolsLoading: isLoading,
      poolsError: error,
      poolsEmpty: !isLoading && !data,
    }),
    [data, error, isLoading]
  )

  return memoizedValue
}

export async function getPoolsList() {
  return await fetcher(endpoints.pools.list);
}

export async function getExpandPoolsList(pool_id: string, amount: number) {
  return await fetcher(`${endpoints.pools.expand}/${pool_id}/${amount}`);
}

export function useGetTransactions(pool_id: string | undefined) {

  const URL = `${endpoints.pools.transaction}/${pool_id}`;

  const { data, isLoading, error } = useSWR(URL, fetcher);

  const memoizedValue = useMemo(
    () => ({
      transactions: data || [],
      transactionsLoading: isLoading,
      transactionsError: error,
      transactionsEmpty: !isLoading && !data,
    }),
    [data, error, isLoading]
  )

  return memoizedValue
}

export async function getTransactions(pool_id: string) {
  const URL = `${endpoints.pools.transaction}/${pool_id}`;
  let transactions = await fetcher(URL);
  return transactions;
}

export function useGetCurveData(type: string, pool_id: string | undefined) {
  const URL = `${type}/${pool_id}`;

  const { data, isLoading, error } = useSWR(URL, fetcher);

  const memoizedValue = useMemo(
    () => ({
      data: data || [],
      dataLoading: isLoading,
      dataError: error,
      dataEmpty: !isLoading && !data,
    }),
    [data, error, isLoading]
  )

  return memoizedValue
}

export async function simulateData(pool_id, {buys, sells, buy_sells}) {
  const URL = `${endpoints.pools.simulate}/${pool_id}/${buys}/${sells}/${buy_sells}`;
  let res = await fetcher(URL);
  return res;
}

export async function createPool(body: object) {
  const URL = `${endpoints.pools.create}`;
  let res = await poster([URL, body, {}]);
  return res;
}