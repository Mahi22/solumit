import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import moment from 'moment'
import { TimeSeries, TimeRange, Index } from 'pondjs'
import { Resizable, ChartContainer, ChartRow, Charts, YAxis, styler, BarChart, AreaChart } from 'react-timeseries-charts'
import { Typography } from '@rmwc/typography'

import { Vertical, Horizontal } from '../styles'

import { ReactComponent as IconSolar } from '../assets/solar.svg'
import { ReactComponent as IconGrid } from '../assets/grid.svg'
import { ReactComponent as IconOutput } from '../assets/output.svg'

const EnergyLabel = styled(Typography)`
  font-weight: 100;
`

const EnergyValue = styled(Typography)`
  font-weight: 700;
  font-size: 42px;
`

const style = styler([
  { key: "mains", color: "#C67B00" }, //BED4EF
  { key: "solar", color: "#7ED321" },
  { key: "output", color: "#BED4EF", highlight: null, selection: null }
])

const Chart = ({ data, height, width, size = 18, offset = 7.5 }) => {
  const [mainsSeries, setMainSeries] = useState(null)
  const [outputSeries, setOutputSeries] = useState(null)
  const [solarSeries, setSolarSeries] = useState(null)
  const [energy, setEnergy] = useState('')
  const [timeRange, setTimeRange] = useState(null)

  useEffect(() => {
    setMainSeries(new TimeSeries({
      name: "mains",
      columns: ["index", "mains"],
      points: data.map(({ fortime, mains }) => {
        return [Index.getIndexString("2h", new Date(parseInt(fortime))), mains]
      })
    }))

    setSolarSeries(new TimeSeries({
      name: "solar",
      columns: ["index", "solar"],
      points: data.map(({ fortime, solar }) => [Index.getIndexString("2h", new Date(parseInt(fortime))), solar])
    }))

    const opSeries = new TimeSeries({
      name: "output",
      columns: ["time", "output"],
      points: data.map(({ fortime, output }) => [parseInt(fortime), output])
    })

    setOutputSeries(opSeries)
    // setTimeRange(opSeries.range())
    // const beginTime = moment(forDate).startOf('day')
    // const endTime = moment(forDate).add(addDays, 'days').endOf('day')
    setTimeRange(opSeries.range())
    setEnergy(data.reduce((acc, { energy }) => acc + energy, 0))
  }, [data])

  if (mainsSeries === null || solarSeries === null || solarSeries === null) {
    return null
  }

  const maxRange = Math.max(outputSeries.max('output'), mainsSeries.max('mains'), solarSeries.max('solar'))

  return (
    <div style={{ height }}>
      <Vertical center style={{ backgroundColor: '#F5F5F5', color: '#626262', padding: 8 }}>
        <EnergyLabel use="body2">
          Today's Energy Generation is
        </EnergyLabel>
        <EnergyValue use="headline3">
          {energy.toFixed(2)} kWh
        </EnergyValue>
      </Vertical>
      <Horizontal center spaceBetween>
        <Vertical center flex="1">
            <Typography use="headline4">{Math.round(solarSeries.avg('solar'))}</Typography>
            <IconSolar />
            <Typography use="body1">Solar</Typography>
          </Vertical>
        <Vertical center flex="1">
          <Typography use="headline4">{Math.round(mainsSeries.avg('mains'))}</Typography>
          <IconGrid />
          <Typography use="body1">Grid</Typography>
        </Vertical>
        <Vertical center flex="1">
          <Typography use="headline4">{Math.round(outputSeries.avg('output'))}</Typography>
          <IconOutput />
          <Typography use="body1">Inverter</Typography>
        </Vertical>
      </Horizontal>
      <div style={{ height: height - 185 }}>
        <Resizable>
          <ChartContainer
            timeRange={timeRange}
            hideTimeAxis={false}
          >
            <ChartRow height={height - 185} width={width} axisMargin={0}>
              <YAxis
                id="mainsAxis"
                label="Energy"
                min={0}
                max={maxRange}
                visible={false}
                type="linear"
              />
              <YAxis
                id="outputAxis"
                label="Energy"
                min={0}
                max={maxRange}
                visible={false}
                type="linear"
              />
              <Charts>
                <AreaChart
                  axis="outputAxis"
                  style={style.areaChartStyle()}
                  series={outputSeries}
                  columns={{ up: ["output"], down: [] }}
                  fillOpacity={0.4}
                  interpolation="curveLinear"
                />
                <BarChart
                  axis="mainsAxis"
                  style={style}
                  size={size}
                  offset={offset}
                  columns={["mains"]}
                  series={mainsSeries}
                />
                <BarChart
                  axis="mainsAxis"
                  style={style}
                  size={size}
                  offset={-1 * offset}
                  columns={["solar"]}
                  series={solarSeries}
                />
              </Charts>
            </ChartRow>
          </ChartContainer>
        </Resizable>
      </div>
    </div>
  )
}

export default Chart
