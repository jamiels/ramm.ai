import React, {useCallback, useEffect, useRef} from 'react'
import {FC} from 'react'
import {useGetCurveData} from '../../../api/pools'
import {useParams} from 'react-router-dom'
import {getCSS, getCSSVariableValue} from '../../../../_metronic/assets/ts/_utils'
import ApexCharts, {ApexOptions} from 'apexcharts'
import {useThemeMode} from '../../../../_metronic/partials'

type PropsType = {
  type: string
  title: string
}

const CurveChart: FC<PropsType> = ({type, title}) => {
  const {pool_id} = useParams()
  const {data, dataLoading} = useGetCurveData(type, pool_id)

  const chartRef = useRef<HTMLDivElement | null>(null)
  const {mode} = useThemeMode()
  const refreshChart = useCallback(() => {
    if (!chartRef.current) {
      return
    }

    const height = parseInt(getCSS(chartRef.current, 'height'))

    const chart = new ApexCharts(chartRef.current, getChartOptions(height, data))
    if (chart) {
      chart.render()
    }

    return chart
  }, [data])

  useEffect(() => {
    if (!dataLoading) {
      const chart = refreshChart()

      return () => {
        if (chart) {
          chart.destroy()
        }
      }
    }
  }, [chartRef, mode, dataLoading, refreshChart])

  const getChartOptions = (height: number, data?: any): ApexOptions => {
    const labelColor = getCSSVariableValue('--bs-gray-500')
    // const borderColor = getCSSVariableValue('--bs-gray-200')
    // const strokeColor = getCSSVariableValue('--bs-gray-300')

    // const color1Light = getCSSVariableValue('--bs-danger-light')
    // const color2Light = getCSSVariableValue('--bs-success-light')
    // const color3Light = getCSSVariableValue('--bs-primary-light')
    // const color4Light = getCSSVariableValue('--bs-info-light')

    const color1 = getCSSVariableValue('--bs-danger')
    const color2 = getCSSVariableValue('--bs-success')
    const color3 = getCSSVariableValue('--bs-primary')
    const color4 = getCSSVariableValue('--bs-info')

    let colors = [color1, color2, color3, color4]

    colors = colors.splice(0, Object.keys(data).length)

    let dataSet = Object.keys(data).map((key, index) => {
      return {
        name: key,
        data: data[key].x.map((val, sindex) => {
          return {x: val, y: data[key].y[sindex]}
        }),
      }
    })

    let chatOptions: ApexOptions = {
      tooltip: {
        fixed: {
          enabled: true,
          position: 'topLeft',
          offsetX: 0,
          offsetY: 0,
        },
        style: {
          fontSize: '12px',
        },
        enabled: true,
        shared: true,
        intersect: false
      },
      series: dataSet,
      chart: {
        type: 'line',
        fontFamily: 'inherit',
        height: height,
        toolbar: {
          show: false,
        },
        zoom: {
          enabled: false,
        },
      },
      xaxis: {
        type: 'numeric',
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
        labels: {
          show: false,
          style: {
            colors: labelColor,
            fontSize: '12px',
          },
        },
        // crosshairs: {
        //   show: false,
        //   position: 'front',
        //   stroke: {
        //     color: strokeColor,
        //     width: 1,
        //     dashArray: 3,
        //   },
        // },
      },
      yaxis: {
        labels: {
          show: true,
          style: {
            colors: labelColor,
            fontSize: '12px',
          },
          padding: 10,
          formatter: (value) => {
            return parseInt(value.toString()).toString()
          },
        },
      },
      plotOptions: {},
      legend: {
        show: true,
      },
      dataLabels: {
        enabled: false,
      },
      colors: colors,
      // markers: {
      //   colors: colors,
      //   strokeColors: colors,
      //   strokeWidth: 3,
      // },
    }
    return chatOptions
  }

  return (
    <div className={`card card-xxl-stretch mb-0 mb-xl-8`}>
      <div className='card-header border-0 pt-0'>
        <h3 className='card-title align-items-start flex-column mb-0'>
          <span className='card-label fw-bold fs-3 mb-0'>{title}</span>
        </h3>
      </div>
      <div className='card-body pt-0 px-5 py-0'>
        {dataLoading && (
          <div className='w-100 d-flex justify-content-center py-5'>
            <span className='indicator-progress mx-auto' style={{display: 'block'}}>
              Loading...
              <span className='spinner-border spinner-border-sm align-middle mx-auto'></span>
            </span>
          </div>
        )}
        {!dataLoading && <div ref={chartRef} style={{height: '300px', width: '100%'}}></div>}
      </div>
    </div>
  )
}

export default CurveChart
