import axios, { AxiosRequestConfig } from 'axios';
import globalConfig from '../../config';

// ----------------------------------------------------------------------
const API_URL = globalConfig.REACT_APP_API_URL

const axiosInstance = axios.create({ baseURL: API_URL });

axiosInstance.interceptors.response.use(
  (res) => res,
  (error) => Promise.reject((error.response && error.response.data) || 'Something went wrong')
);

export default axiosInstance;

// ----------------------------------------------------------------------

export const fetcher = async (args: string | [string, AxiosRequestConfig]) => {
  const [url, config] = Array.isArray(args) ? args : [args];
  const res = await axiosInstance.get(`${API_URL}/${url}`, { ...config });
  return res.data;
};

// ----------------------------------------------------------------------

export const poster = async (args: string | [string, object, AxiosRequestConfig]) => {
  const [url, body, config] = Array.isArray(args) ? args : [args];
  const res = await axiosInstance.post(`${API_URL}/${url}`, body, { ...config });
  return res.data;
};

// ----------------------------------------------------------------------

export const endpoints = {
  pools: {
    list: 'pools',
    transaction: 'pool/tx',
    price_curve: 'price-curve',
    treasury_curve: 'treasury-curve',
    bonding_curve: 'bonding-curve',
    expand: 'expand',
    create: 'create-pool',
    simulate: 'simulate',
    download: 'pools/csv/:pool_id',
  }
};