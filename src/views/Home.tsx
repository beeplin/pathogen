import { computed, defineComponent, ref } from '@vue/composition-api'
import 'echarts/lib/chart/line'
import 'echarts/lib/component/title'
import VueECharts from 'vue-echarts'
import VueSlider from 'vue-slider-component'
import 'vue-slider-component/theme/default.css'

export default defineComponent({
  name: 'Home',

  setup() {
    const length = ref(100)
    const top = ref(3000)
    const initialPathogenInput = ref(10)
    const pathogenReproductionRate = ref(1.5)
    const immunityCurve = ref(0)
    const immunityDelay = ref(1)
    const immunityCoefX = ref(1)
    const immunityCoefY = ref(1)

    const atan1 = Math.atan(1)
    const log2 = Math.log(2)

    const calculateImmunity = (pathogenLoad: number) => {
      const x = pathogenLoad / 50 / immunityCoefX.value
      const type = immunityCurve.value
      const y =
        type < 0
          ? Math.atan(x) / atan1
          : type == 0
          ? Math.log(x + 1) / log2
          : Math.pow(x, type)
      return y * immunityCoefY.value * 50
    }

    const loads = computed(() => {
      const pathogen: number[] = [initialPathogenInput.value]
      const immunity: number[] = [0]
      const rate = pathogenReproductionRate.value
      const delay = immunityDelay.value
      for (let i = 1; i < length.value; i++) {
        pathogen[i] = Math.max(pathogen[i - 1] * rate - immunity[i - 1], 0)
        immunity[i] = i >= delay ? calculateImmunity(pathogen[i - delay]) : 0
      }
      return { pathogen, immunity }
    })

    const incubationPeriod = computed(() =>
      loads.value.pathogen.findIndex(v => v > top.value),
    )

    return () => (
      <div>
        <VueECharts
          options={{
            title: {
              text: '病原体繁殖时序 by beeplin',
            },
            tooltip: {},
            animationDuration: 0,
            legend: {
              // data: ['销量'],
            },
            xAxis: {
              data: [...Array(length.value).keys()],
            },
            yAxis: {
              type: 'value',
              min: 0,
              max: Math.max(...loads.value.pathogen) > 3000 ? 3000 : 'dataMax',
            },
            series: [
              {
                name: '病原体',
                type: 'line',
                lineStyle: { color: 'red' },
                data: loads.value.pathogen,
              },
              {
                name: '免疫响应',
                type: 'line',
                lineStyle: { color: 'green' },
                data: loads.value.immunity,
              },
            ],
          }}
          style="width: 100%;"
        />
        <div>
          潜伏期：
          {incubationPeriod.value === -1 ? '无限' : incubationPeriod.value}
        </div>

        <div style="margin: 60px; ">
          <VueSlider
            tooltip="always"
            tooltipFormatter={(v: string) => `病原体初始剂量：${v}`}
            min={0}
            max={top.value}
            interval={1}
            vModel={initialPathogenInput.value}
            style="margin-bottom: 40px;"
          />
          <VueSlider
            tooltip="always"
            tooltipFormatter={(v: string) => `病原体复制速度：${v}`}
            min={0}
            max={5}
            interval={0.1}
            vModel={pathogenReproductionRate.value}
            style="margin-bottom: 40px;"
          />
          <VueSlider
            tooltip="always"
            tooltipFormatter={(v: string) => `免疫响应曲线：${v}`}
            min={-0.1}
            max={1}
            interval={0.1}
            vModel={immunityCurve.value}
            style="margin-bottom: 40px;"
          />
          <VueSlider
            tooltip="always"
            tooltipFormatter={(v: string) => `免疫响应延迟：${v}`}
            min={0}
            max={10}
            interval={1}
            vModel={immunityDelay.value}
            style="margin-bottom: 40px;"
          />
          <div style="display: flex; flex-direction: row;">
            <VueSlider
              direction="btt"
              height={350}
              tooltip="always"
              tooltipFormatter={(v: string) => `免疫响应系数Y：${v}`}
              tooltipPlacement="right"
              min={0}
              max={5}
              interval={0.1}
              vModel={immunityCoefY.value}
              style="padding-right: 80px;"
            />
            <VueECharts
              options={{
                title: {
                  text: '人体免疫响应曲线',
                },
                tooltip: {},
                animationDuration: 0,
                legend: {
                  // data: ['销量'],
                },
                xAxis: {
                  // type: 'value',
                  data: [...Array(2000).keys()],
                  interval: 100,
                  min: 0,
                  max: 2000,
                },
                yAxis: {
                  type: 'value',
                  min: 0,
                  max: 800,
                },
                series: [
                  {
                    name: '免疫响应',
                    type: 'line',
                    lineStyle: { color: 'black' },
                    data: [...Array(2000).keys()].map(calculateImmunity),
                  },
                ],
              }}
              style="flex: auto 1 1; "
            />
          </div>
          <VueSlider
            tooltip="always"
            tooltipFormatter={(v: string) => `免疫响应系数X：${v}`}
            min={0}
            max={5}
            interval={0.1}
            vModel={immunityCoefX.value}
          />
        </div>
      </div>
    )
  },
})
