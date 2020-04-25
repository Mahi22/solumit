import React, { useState, useEffect } from 'react'
import { TimeSeries, avg } from 'pondjs'
import { Resizable, ChartContainer, ChartRow, Charts, YAxis, styler, BarChart, AreaChart } from 'react-timeseries-charts'
import { Typography } from '@rmwc/typography'

import { Vertical, Horizontal } from '../styles'

import { ReactComponent as IconSolar } from '../assets/solar.svg'
import { ReactComponent as IconGrid } from '../assets/grid.svg'
import { ReactComponent as IconOutput } from '../assets/output.svg'


const style = styler([
  { key: "mains", color: "#C67B00" }, //BED4EF
  { key: "solar", color: "#7ED321" },
  { key: "output", color: "#BED4EF", highlight: null, selection: null }
])

const Chart = ({ data: { values }, height, width }) => {
  const [mainsSeries, setMainSeries] = useState(null)
  const [outputSeries, setOutputSeries] = useState(null)
  const [solarSeries, setSolarSeries] = useState(null)
  // const [timeRangeSeries, setTimeRangeSeries] = useState(null)
  const [timeRange, setTimeRange] = useState(null)

  useEffect(() => {
    if (timeRange === null || (timeRange.begin() === outputSeries.range().begin() && timeRange.end() === outputSeries.range().end())) {
      setMainSeries(new TimeSeries({
        name: "mains",
        columns: ["time", "mains"],
        points: values.map(({ fortime, mains }) => [fortime, mains])
      }))
  
      setSolarSeries(new TimeSeries({
        name: "solar",
        columns: ["time", "solar"],
        points: values.map(({ fortime, solar }) => [fortime, solar])
      }))
  
      const opSeries = new TimeSeries({
        name: "output",
        columns: ["time", "output"],
        points: values.map(({ fortime, output }) => [fortime, output])
      })
  
      setOutputSeries(opSeries)
      // setTimeRangeSeries(opSeries)
      setTimeRange(opSeries.range())
    }
  }, [values])

  if (mainsSeries === null || solarSeries === null || solarSeries === null) {
    return null
  }

  // console.log(mainsSeries.toJSON())
  // const windowSize = Math.round(mainsSeries.size() / 24);
  const mainsResize = mainsSeries.fixedWindowRollup({ windowSize: `2h`, aggregation: { mains: {  mains: avg() } } })
  const solarResize = solarSeries.fixedWindowRollup({ windowSize: `2h`, aggregation: { solar: {  solar: avg() } } })
  const outputResize = outputSeries.fixedWindowRollup({ windowSize: `2h`, aggregation: { output: {  output: avg() } } })
  const maxRange = Math.max(outputSeries.max('output'), mainsResize.max('mains'), solarResize.max('solar'))

  return (
    <div style={{ height }}>
      <Horizontal center spaceBetween>
        <Vertical center flex="1">
            <Typography use="headline4">{Math.round(solarResize.avg('solar'))}</Typography>
            <IconSolar />
            <Typography use="body1">Solar</Typography>
          </Vertical>
        <Vertical center flex="1">
          <Typography use="headline4">{Math.round(mainsResize.avg('mains'))}</Typography>
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
            // onTimeRangeChanged = {timeRangeChange => {
            //   setTimeRange(timeRangeChange)
            //   setMainSeries(mainsSeries.crop(timeRangeChange))
            //   setOutputSeries(outputSeries.crop(timeRangeChange))
            //   setSolarSeries(solarSeries.crop(timeRangeChange))
            // }}
            timeRange={timeRange}
            // maxTime={timeRangeSeries.range().end()}
            // minTime={timeRangeSeries.range().begin()}
            // enableDragZoom
            // padding={2}
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
                  series={outputResize}
                  columns={{ up: ["output"], down: [] }}
                  fillOpacity={0.4}
                  width={110}
                  interpolation="curveBasis"
                />
                <BarChart
                  axis="mainsAxis"
                  style={style}
                  size={14}
                  // offset={6.5}
                  columns={["mains"]}
                  series={mainsResize}
                />
                <BarChart
                  axis="mainsAxis"
                  style={style}
                  size={14}
                  // offset={-6.5}
                  columns={["solar"]}
                  series={solarResize}
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