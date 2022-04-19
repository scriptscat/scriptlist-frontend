<template>
  <q-card-section>
    <div class="flex flex-center">
      <q-card flat>
        <div class="text-body flex flex-center" style="margin-top: 20px">
          过去 7 天用户数 {{ weeklyNum }}
        </div>
      </q-card>
    </div>
    <div>
      <q-card-section align="left"> </q-card-section>
      <q-card flat bordered class="flex justify-center">
        <div style="width: 500px; height: 300px" id="realInstall"></div>
        <div style="width: 500px; height: 300px" id="realUpdate"></div>
      </q-card>
      <q-card flat bordered class="flex justify-center">
        <div style="width: 500px; height: 300px" id="install"></div>
        <div style="width: 500px; height: 300px" id="update"></div>
      </q-card>
      <q-card flat bordered class="flex justify-center">
        <div style="width: 500px; height: 300px" id="thirtyinstall"></div>
        <div style="width: 500px; height: 300px" id="thirtyupdate"></div>
      </q-card>
      <q-card flat bordered class="flex justify-center">
        <q-card-section class="q-pt-none">
          本页暂未完善,在以后也可能会提供更多数据维度<br />如果你有什么意见可以前往论坛
          <b>建议/投诉/举报</b> 板块提出.
        </q-card-section>
      </q-card>
    </div>
  </q-card-section>
</template>

<style scoped></style>

<script lang="ts">
import { defineComponent } from 'vue';
import * as echarts from 'echarts';
import { getRealtime, getStatistics } from '@App/apis/scripts';
import { useMeta } from 'quasar';

export default defineComponent({
  setup() {
    useMeta({ title: '统计' });
    return {};
  },
  data() {
    return {
      myChart: <echarts.ECharts[]>[],
      theWeekInstall: <string[][]>[],
      lastWeeklyInstall: <string[][]>[],
      theWeekUpdate: <string[][]>[],
      lastWeeklyUpdate: <string[][]>[],
      thirtyDayInstall: <string[][]>[],
      thirtyDayUpdate: <string[][]>[],
      weeklyNum: 0,
      cat: require('assets/cat.png'),
      id: parseInt(<string>this.$route.params.id),
      close: false,
    };
  },
  created() {
    if (process.env.SERVER) {
      return;
    }
    getStatistics(this.id)
      .then((response) => {
        if (response.data.code == 0) {
          this.theWeekInstall.push(
            response.data.data.download.uv.x,
            response.data.data.download.uv.y
          );
          this.lastWeeklyInstall.push(
            response.data.data.download['uv-lastweekly'].x,
            response.data.data.download['uv-lastweekly'].y
          );
          this.theWeekUpdate.push(
            response.data.data.update.uv.x,
            response.data.data.update.uv.y
          );
          this.lastWeeklyUpdate.push(
            response.data.data.update['uv-lastweekly'].x,
            response.data.data.update['uv-lastweekly'].y
          );
          this.thirtyDayInstall.push(
            response.data.data.download.pv.x,
            response.data.data.download.pv.y
          );
          this.thirtyDayUpdate.push(
            response.data.data.update.pv.x,
            response.data.data.update.pv.y
          );
          this.seven_day(
            'install',
            '安装',
            this.theWeekInstall,
            this.lastWeeklyInstall
          );
          this.seven_day(
            'update',
            '更新',
            this.theWeekUpdate,
            this.lastWeeklyUpdate
          );
          this.thirty_day(
            'thirtyinstall',
            '过去30日安装',
            this.thirtyDayInstall
          );
          this.thirty_day('thirtyupdate', '过去30日更新', this.thirtyDayUpdate);
          this.weeklyNum = response.data.data.member.num;
        }
      })
      .catch((error: any) => {
        console.log(error);
        this.$q.notify('系统错误');
      });
    this.fn();
  },
  unmounted() {
    this.close = true;
  },
  mounted() {
    this.close = false;
    this.real_time('realInstall', '实时下载数据', 0);
    this.real_time('realUpdate', '实时更新数据', 1);
  },
  methods: {
    fn() {
      getRealtime(this.id)
        .then((response) => {
          if (response.data.code == 0) {
            this.myChart[0].setOption({
              series: [{ data: response.data.data.download.y }],
            });
            this.myChart[1].setOption({
              series: [{ data: response.data.data.update.y }],
            });
          }
        })
        .catch((error) => {
          console.log(error);
        });
      !this.close &&
        setTimeout(() => {
          this.fn();
        }, 5000);
    },
    real_time(name: string, title: string, id: number) {
      var chartDom = document.getElementById(name);
      this.myChart[id] = echarts.init(<HTMLElement>chartDom);
      var option;
      option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#283b56',
            },
          },
        },
        legend: {},
        toolbox: {
          show: true,
        },
        dataZoom: {
          show: false,
          start: 0,
          end: 100,
        },
        xAxis: [
          {
            type: 'category',
            boundaryGap: true,
            data: [
              '15分钟前',
              '14分钟前',
              '13分钟前',
              '12分钟前',
              '11分钟前',
              '10分钟前',
              '9分钟前',
              '8分钟前',
              '7分钟前',
              '6分钟前',
              '5分钟前',
              '4分钟前',
              '3分钟前',
              '2分钟前',
              '1分钟前',
            ],
          },
        ],
        yAxis: [
          {
            type: 'value',
            scale: true,
            min: 0,
            boundaryGap: [1, 1],
          },
        ],
        series: [
          {
            name: title,
            type: 'bar',
            data: [],
          },
        ],
      };
      option && this.myChart[id].setOption(option);
    },

    seven_day(
      name: string,
      title: string,
      week: string[][],
      lastweek: string[][]
    ) {
      var chartDom = document.getElementById(name);
      var myChart = echarts.init(<HTMLElement>chartDom);
      var option;

      const colors = ['#5470C6', '#EE6666'];
      option = {
        color: colors,
        tooltip: {
          trigger: 'none',
          axisPointer: {
            type: 'cross',
          },
        },
        legend: {},
        grid: {
          top: 70,
          bottom: 50,
        },
        xAxis: [
          {
            type: 'category',
            axisTick: {
              alignWithLabel: true,
            },
            axisLine: {
              onZero: false,
              lineStyle: {
                color: colors[1],
              },
            },
            axisPointer: {
              label: {
                formatter: function (params: {
                  value: string;
                  seriesData: { data: string }[];
                }) {
                  return (
                    params.value +
                    (params.seriesData.length
                      ? ':' + params.seriesData[0].data
                      : '')
                  );
                },
              },
            },
            // prettier-ignore
            data:lastweek[0],
          },
          {
            type: 'category',
            axisTick: {
              alignWithLabel: true,
            },
            axisLine: {
              onZero: false,
              lineStyle: {
                color: colors[0],
              },
            },
            axisPointer: {
              label: {
                formatter: function (params: {
                  value: string;
                  seriesData: { data: string }[];
                }) {
                  return (
                    params.value +
                    (params.seriesData.length
                      ? ':' + params.seriesData[0].data
                      : '')
                  );
                },
              },
            },
            data: week[0],
          },
        ],
        yAxis: [
          {
            type: 'value',
          },
        ],
        series: [
          {
            name: '本周' + title,
            type: 'line',
            xAxisIndex: 1,
            smooth: true,
            emphasis: {
              focus: 'series',
            },
            data: week[1],
          },
          {
            name: '上周' + title,
            type: 'line',
            smooth: true,
            emphasis: {
              focus: 'series',
            },
            data: lastweek[1],
          },
        ],
      };
      option && myChart.setOption(option);
    },

    thirty_day(name: string, title: string, week: any[]) {
      var chartDom = document.getElementById(name);
      var myChart = echarts.init(<HTMLElement>chartDom);
      var option;
      option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#283b56',
            },
          },
        },
        legend: {},
        toolbox: {
          show: true,
        },
        dataZoom: {
          show: false,
          start: 0,
          end: 100,
        },
        xAxis: [
          {
            type: 'category',
            boundaryGap: true,
            data: week[0],
          },
        ],
        yAxis: [
          {
            type: 'value',
            scale: true,
            min: 0,
            boundaryGap: [1, 1],
          },
        ],
        series: [
          {
            name: title,
            type: 'line',
            data: week[1],
          },
        ],
      };
      option && myChart.setOption(option);
    },
  },
});
</script>
