import type { APIDataResponse, APIListResponse } from '../http';

export type SearchResponse = APIListResponse<Script>;

export interface Script {
  id: number;
}
