import { apiClient } from '../../client';

export type StatisticsChart = {
  x: string[];
  y: number[];
};

export type Overview = {
  today: number;
  yesterday: number;
  week: number;
};

export type Statistics = {
  page_pv: Overview;
  page_uv: Overview;
  download_uv: Overview;
  update_uv: Overview;
  uv_chart: {
    download: StatisticsChart;
    update: StatisticsChart;
  };
  pv_chart: {
    download: StatisticsChart;
    update: StatisticsChart;
  };
};

export type Realtime = {
  download: StatisticsChart;
  update: StatisticsChart;
};

export class ScriptStatisticsService {
  private readonly basePath = '/script';

  /**
   * 获取脚本统计数据
   * @param scriptId - 脚本ID
   */
  async getStatistics(scriptId: number): Promise<Statistics> {
    return apiClient.getWithCookie<Statistics>(
      `${this.basePath}/${scriptId}/statistics`,
    );
  }

  /**
   * 获取实时统计数据
   * @param scriptId - 脚本ID
   */
  async getRealtime(scriptId: number): Promise<Realtime> {
    return apiClient.get<Realtime>(
      `${this.basePath}/${scriptId}/statistics/realtime`,
    );
  }
}

export const scriptStatisticsService = new ScriptStatisticsService();
