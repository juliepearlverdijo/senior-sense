'use client'

import { useState } from 'react'

import { color } from 'd3-color';
import { interpolateRgb } from 'd3-interpolate';
// @ts-ignore
import LiquidFillGauge from 'react-liquid-gauge';

interface WellBeingMetrics {
  physicalActivity: number;
  needForAssistance: number;
  conversationalLevel: number;
}

const startColor = '#97AFC5'; // cornflowerblue
const endColor = '#97AFC5';
const radius = 50;
const interpolate = interpolateRgb(startColor, endColor);

export default function InsightsLiquidGauge() {
  const [values, setValues] = useState < WellBeingMetrics > ({
    physicalActivity: 50,
    needForAssistance: 30,
    conversationalLevel: 20,
  });
  const [fillColors, setFillColors] = useState<any>({
    physicalActivity: interpolate(values.physicalActivity / 100),
    needForAssistance: interpolate(values.needForAssistance / 100),
    conversationalLevel: interpolate(values.conversationalLevel / 100),
  });

  const [gradientStops, setGradientStops] = useState<any>({
    physicalActivity: [{
        key: '0%',
        stopColor: color(fillColors?.physicalActivity) ? color(fillColors.physicalActivity)!.darker(0.5).toString() : '',
        stopOpacity: 1,
        offset: '0%'
      },
      {
        key: '50%',
        stopColor: fillColors.physicalActivity,
        stopOpacity: 0.75,
        offset: '50%'
      },
      {
        key: '100%',
        stopColor: color(fillColors?.physicalActivity) ? color(fillColors.physicalActivity)!.brighter(0.5).toString() : '',
        stopOpacity: 0.5,
        offset: '100%'
      }
    ],
    needForAssistance: [{
        key: '0%',
        stopColor: color(fillColors?.needForAssistance) ? color(fillColors.needForAssistance)!.darker(0.5).toString() : '',
        stopOpacity: 1,
        offset: '0%'
      },
      {
        key: '50%',
        stopColor: fillColors.needForAssistance,
        stopOpacity: 0.75,
        offset: '50%'
      },
      {
        key: '100%',
        stopColor: color(fillColors?.needForAssistance) ? color(fillColors.needForAssistance)!.brighter(0.5).toString() : '',
        stopOpacity: 0.5,
        offset: '100%'
      }
    ],
    conversationalLevel: [{
        key: '0%',
        stopColor: color(fillColors.conversationalLevel) ? color(fillColors.conversationalLevel)!.darker(0.5).toString() : '',
        stopOpacity: 1,
        offset: '0%'
      },
      {
        key: '50%',
        stopColor: fillColors.conversationalLevel,
        stopOpacity: 0.75,
        offset: '50%'
      },
      {
        key: '100%',
        stopColor: color(fillColors?.conversationalLevel) ? color(fillColors.conversationalLevel)!.brighter(0.5).toString() : '',
        stopOpacity: 0.5,
        offset: '100%'
      }
    ],
  })

  
  return (
    <div className="flex justify-between mt-12">
			<div className="flex flex-col items-center">
				<LiquidFillGauge
          className="mx-auto"
          width={radius * 2}
          height={radius * 2}
          value={values.physicalActivity}
          percent="%"
          textSize={1}
          textOffsetX={0}
          textOffsetY={0}
          textRenderer={(props:any) => {
              const value = Math.round(props.value);
              const radius = Math.min(props.height / 2, props.width / 2);
              const textPixels = (props.textSize * radius / 2);
              const valueStyle = {
                  fontSize: textPixels
              };
              const percentStyle = {
                  fontSize: textPixels * 0.6
              };

              return (
                  <tspan>
                      <tspan className="value" style={valueStyle}>{value}</tspan>
                      <tspan style={percentStyle}>{props.percent}</tspan>
                  </tspan>
              );
          }}
          riseAnimation
          waveAnimation
          waveFrequency={2}
          waveAmplitude={1}
          gradient
          gradientStops={gradientStops.physicalActivity}
          circleStyle={{
              fill: fillColors.physicalActivity
          }}
          waveStyle={{
              fill: fillColors.physicalActivity
          }}
          textStyle={{
              fill: color('#444') ? color('#444')!.toString() : '',
              fontFamily: 'Poppins'
          }}
          waveTextStyle={{
              fill: color('#fff') ? color('#fff')!.toString() : '',
              fontFamily: 'Poppins'
          }}
          onClick={() => {
              //this.setState({ value: Math.random() * 100 });
          }}
      	/>
      	<h3 className="mt-5 text-base">Physical Activity</h3>
     	 <p className="text-accent text-2xl font-semibold pt-2">50%</p>
			</div>
      <div className="flex flex-col items-center">
				<LiquidFillGauge
          className="mx-auto"
          width={radius * 2}
          height={radius * 2}
          value={values.needForAssistance}
          percent="%"
          textSize={1}
          textOffsetX={0}
          textOffsetY={0}
          textRenderer={(props:any) => {
              const value = Math.round(props.value);
              const radius = Math.min(props.height / 2, props.width / 2);
              const textPixels = (props.textSize * radius / 2);
              const valueStyle = {
                  fontSize: textPixels
              };
              const percentStyle = {
                  fontSize: textPixels * 0.6
              };

              return (
                  <tspan>
                      <tspan className="value" style={valueStyle}>{value}</tspan>
                      <tspan style={percentStyle}>{props.percent}</tspan>
                  </tspan>
              );
          }}
          riseAnimation
          waveAnimation
          waveFrequency={2}
          waveAmplitude={1}
          gradient
          gradientStops={gradientStops.needForAssistance}
          circleStyle={{
              fill: fillColors.needForAssistance
          }}
          waveStyle={{
              fill: fillColors.needForAssistance
          }}
          textStyle={{
              fill: color('#444') ? color('#444')!.toString() : '',
              fontFamily: 'Poppins'
          }}
          waveTextStyle={{
              fill: color('#fff') ? color('#fff')!.toString() : '',
              fontFamily: 'Poppins'
          }}
          onClick={() => {
              //this.setState({ value: Math.random() * 100 });
          }}
      	/>
      	<h3 className="mt-5 text-base">Need for Assistance</h3>
     	 <p className="text-accent text-2xl font-semibold pt-2">30%</p>
			</div> 
			<div className="flex flex-col items-center">
				<LiquidFillGauge
          className="mx-auto"
          width={radius * 2}
          height={radius * 2}
          value={values.conversationalLevel}
          percent="%"
          textSize={1}
          textOffsetX={0}
          textOffsetY={0}
          textRenderer={(props:any) => {
              const value = Math.round(props.value);
              const radius = Math.min(props.height / 2, props.width / 2);
              const textPixels = (props.textSize * radius / 2);
              const valueStyle = {
                  fontSize: textPixels
              };
              const percentStyle = {
                  fontSize: textPixels * 0.6
              };

              return (
                  <tspan>
                      <tspan className="value" style={valueStyle}>{value}</tspan>
                      <tspan style={percentStyle}>{props.percent}</tspan>
                  </tspan>
              );
          }}
          riseAnimation
          waveAnimation
          waveFrequency={2}
          waveAmplitude={1}
          gradient
          gradientStops={gradientStops.conversationalLevel}
          circleStyle={{
              fill: fillColors.conversationalLevel
          }}
          waveStyle={{
              fill: fillColors.conversationalLevel
          }}
          textStyle={{
              fill: color('#444') ? color('#444')!.toString() : '',
              fontFamily: 'Poppins'
          }}
          waveTextStyle={{
              fill: color('#444') ? color('#fff')!.toString() : '',
              fontFamily: 'Poppins'
          }}
          onClick={() => {
              //this.setState({ value: Math.random() * 100 });
          }}
      	/>
      	<h3 className="mt-5 text-base">Conversational Level</h3>
     	 <p className="text-accent text-2xl font-semibold pt-2">20%</p>
			</div>  
    </div>
  )
}