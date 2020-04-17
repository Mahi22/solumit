import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import { useParams } from 'react-router-dom';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';
import { apply, curry } from 'ramda';
import 'react-datepicker/dist/react-datepicker.css';

import { TimeSeries } from 'pondjs';
import { styler, ChartContainer, ChartRow, YAxis, Legend, Resizable, LineChart, Charts } from 'react-timeseries-charts';

const debounce_ = curry((immediate, timeMs, fn) => {
	let timeout;

	return (...args) => {
		const later = () => {
			timeout = null;

			if (!immediate) {
				apply(fn, args);
			}
		};

		const callNow = immediate && !timeout;

		clearTimeout(timeout);
		timeout = setTimeout(later, timeMs);

		if (callNow) {
			apply(fn, args);
		}

		return timeout;
	};
});

const DEVICE_DATA = gql`
  query DeviceData($deviceId: String!, $forDate: String!) {
    deviceData(deviceId: $deviceId, forDate: $forDate) {
      max {
        output
        mains
        solar
      }
      values {
        fortime
        output
        mains
        solar
      }
    }
  }
`;


/*
  Issue Label color https://github.com/esnet/react-timeseries-charts/issues/320
*/
const style = styler([
  { key: "output", color: "#9467bd", width: 1 },
  { key: "mains", color: "red", width: 1 },
  { key: "solar", color: "#2ca02c", width: 1 }
]);

const darkAxis = {
  label: {
      stroke: "none",
      fill: "#AAA", // Default label color
      fontWeight: 200,
      fontSize: 14,
      font: '"Inconsolata", "monospace"' 
  },
  values: {
      stroke: "none",
      fill: "#888",
      fontWeight: 100,
      fontSize: 11,
      font: '"Inconsolata", "monospace"' 
  },
  ticks: {
      fill: "none",
      stroke: "#AAA",
      opacity: 0.2
  },
  axis: {
      fill: "none",
      stroke: "#AAA",
      opacity: 1
  }
};


class Chart extends React.Component
 {
   constructor(props) {
     super(props);
     this.state = {
       max: apply(Math.max, [props.outputMax, props.mainsMax, props.solarMax]),
       active: {
         output: true,
         mains: true,
         solar: true
       },
       timerange: props.outputSeries.range()
     }
     this.handleRescale = debounce_(false, 300, this.rescale.bind(this));
   }

   handleActiveChange = key => {
     console.log('Handling key', key);
     const active = this.state.active;
     active[key] = !active[key];
     this.setState({ active });
     this.handleRescale(this.state.timerange, active);
   }

   handleTimeRangeChange = timerange => {
      this.setState({ timerange });
      this.handleRescale(timerange);
   };

   rescale(timerange, active = this.state.active) {
     console.log('handling resize');
     let max = 100;
     const maxOutput = this.props.outputSeries.crop(timerange).max("output");
     if(maxOutput > max && active.output) max = maxOutput;
     const maxMains = this.props.mainsSeries.crop(timerange).max("mains");
     if(maxMains > max && active.mains) max = maxMains;
     const maxSolar = this.props.solarSeries.crop(timerange).max("solar");
     if(maxSolar > max && active.solar) max = maxSolar;
     this.setState({ max });
   }

   renderChart = () => {
     const charts = [];
    //  const max = 2880;
     if (this.state.active.output) {
      //  const maxOutput = this.props.outputSeries.crop(this.state.timerange).max("output");
      //  if (maxOutput > max) max = maxOutput;
       charts.push(
          <LineChart
              key="output"
              axis="axis1"
              series={this.props.outputSeries}
              columns={["output"]}
              style={style}
              interpolation="curveBasis"
          />
        );
     }
     if (this.state.active.mains) {
      //  const maxOutput = this.props.outputSeries.crop(this.state.timerange).max("output");
      //  if (maxOutput > max) max = maxOutput;
       charts.push(
          <LineChart
              key="mains"
              axis="axis1"
              series={this.props.mainsSeries}
              columns={["mains"]}
              style={style}
              interpolation="curveBasis"
          />
        );
     }
     if (this.state.active.solar) {
      //  const maxOutput = this.props.outputSeries.crop(this.state.timerange).max("output");
      //  if (maxOutput > max) max = maxOutput;
       charts.push(
          <LineChart
              key="solar"
              axis="axis2"
              series={this.props.solarSeries}
              columns={["solar"]}
              style={style}
              interpolation="curveBasis"
          />
        );
     }
     return <ChartContainer
        title="Overview - Output, Mains, Solar"
        style={{
          background: "#201d1e",
          borderRadius: 8,
          borderStyle: "solid",
          borderWidth: 1,
          borderColor: "#232122"
      }}
      timeAxisStyle={darkAxis}
      titleStyle={{
        color: "#EEE",
        fontWeight: 500
      }}
      padding={20}
      paddingTop={5}
      paddingBottom={0}
      enableDragZoom
      onTimeRangeChanged={this.handleTimeRangeChange}
      timeRange={this.state.timerange}
      maxTime={this.props.outputSeries.range().end()}
      minTime={this.props.outputSeries.range().begin()}
      >
       <ChartRow height="600">
        <YAxis
            id="axis1"
            showGrid
            hideAxisLine
            transition={300}
            style={darkAxis}
            labelOffset={-10}
            min={0}
            max={this.state.max}
            format=",.0f"
            width="60"
            type="linear"
          />
          <Charts>{charts}</Charts>
          <YAxis
            id="axis2"
            hideAxisLine
            transition={300}
            style={darkAxis}
            labelOffset={12}
            min={0}
            format=",.0f"
            max={this.state.max}
            width="80"
            type="linear"
          />
       </ChartRow>
      </ChartContainer>
   }

   render() {
     const legend = [
       {
         key: "output",
         label: "Output",
         disabled: !this.state.active.output
       },
       {
         key: "mains",
         label: "Mains",
         disabled: !this.state.active.mains
       },
       {
         key: "solar",
         label: "Solar",
         disabled: !this.state.active.solar
       }
     ]

     return (
       <div>
         <div>
           <Legend
              type="line"
              style={style}
              categories={legend}
              onSelectionChange={this.handleActiveChange}
            />
         </div>
         <hr />
         <div>
           <Resizable>{this.renderChart()}</Resizable>
         </div>
       </div>
     )
   }
 }

const ChartDataContainer = () => {

  const [forDate, setForDate] = useState();
  const { id } = useParams();
  console.log(forDate);
  const { loading, error, data } = useQuery(DEVICE_DATA, {
    variables: { deviceId: id, forDate },
    skip: !forDate
  });

  console.log(data);

  return (
    <div>
      <div className="dateContainer">
        <label>Pick a Date </label>
        <DatePicker
          selected={forDate}
          onChange={setForDate}
        />
      </div>
      <hr />
      {loading && <div>Loading ...</div>}
      {error && <div>Error {error}</div>}
      {data && data.deviceData &&  <Chart
          outputMax={data.deviceData.max.output || 0}
          outputSeries={new TimeSeries({
            name: "output",
            columns: ["time", "output"],
            points: data.deviceData.values.map(({ fortime, output }) => [fortime, output])
          })}
          mainsMax={data.deviceData.max.mains || 0}
          mainsSeries={new TimeSeries({
            name: "mains",
            columns: ["time", "mains"],
            points: data.deviceData.values.map(({ fortime, mains }) => [fortime, mains])
          })}
          solarMax={data.deviceData.max.solar || 0}
          solarSeries={new TimeSeries({
            name: "solar",
            columns: ["time", "solar"],
            points: data.deviceData.values.map(({ fortime, solar }) => [fortime, solar])
          })}
        />
      }
      <style>
      {
         `
         div {
          color: white;
         }
         input {
           border: 1px solid white
         }

         .dateContainer {
           margin-left: 16px;
           margin-top: 8px;
         }
       `
      }
      </style>
    </div>
  )
}

export default ChartDataContainer;