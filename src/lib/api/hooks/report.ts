import useSWR from 'swr';
import type { APIError } from '@/types/api';
import {
  type ReportListParams,
  type ReportListResponse,
  scriptReportService,
} from '../services/scripts/report';

export function useReportList(
  scriptId: number,
  params: ReportListParams | null,
) {
  const key = params ? ['report-list', scriptId, params] : null;

  return useSWR<ReportListResponse, APIError>(
    key,
    async () => {
      return scriptReportService.getReportList(scriptId, params!);
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 30 * 1000,
    },
  );
}
