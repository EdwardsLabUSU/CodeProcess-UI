import React from "react";

import { Slider, Handles, Tracks, Rail, Ticks } from 'react-compound-slider';

const sliderStyle = {  // Give the slider some width
    position: 'relative',
    width: '90%',
    height: 80,
    'float': 'right'
}


const railStyle = {
    position: 'absolute',
    width: '100%',
    height: 10,
    marginTop: 35,
    borderRadius: 5,
    backgroundColor: '#8B9CB6',
}

function Handle({
       handle: { id, value, percent },
       getHandleProps
   }) {
    // console.log(getHandleProps());
    // // console.log(rangeChange(id, value));
    // getHandleProps.rangeChange(id, value);
    return (
        <div
            style={{
                left: `${percent}%`,
                position: 'absolute',
                marginLeft: -15,
                marginTop: 25,
                zIndex: 2,
                width: 30,
                height: 30,
                border: 0,
                textAlign: 'center',
                cursor: 'pointer',
                borderRadius: '50%',
                // backgroundColor: '#2C4870',
                backgroundColor: '#ffc400',
                color: '#333',
            }}
            {...getHandleProps(id)}
        >
            <div style={{ fontFamily: 'Roboto', fontSize: 11, marginTop: -35 }}>
                {value}
            </div>
        </div>
    )
}


function Track({ source, target, getTrackProps }) {
    return (
        <div
            style={{
                position: 'absolute',
                height: 10,
                zIndex: 1,
                marginTop: 35,
                // backgroundColor: '#546C91',
                // backgroundColor: '#ffc400',
                backgroundColor: '#b28900',
                borderRadius: 5,
                cursor: 'pointer',
                left: `${source.percent}%`,
                width: `${target.percent - source.percent}%`,
            }}
            {...getTrackProps() /* this will set up events if you want it to be clickeable (optional) */}
        />
    )
}



function Tick({ tick, count }) {
    return (
        <div>
            <div
                style={{
                    position: 'absolute',
                    marginTop: 52,
                    marginLeft: -0.5,
                    width: 1,
                    height: 8,
                    backgroundColor: 'silver',
                    left: `${tick.percent}%`,
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    marginTop: 60,
                    fontSize: 10,
                    textAlign: 'center',
                    marginLeft: `${-(100 / count) / 2}%`,
                    width: `${100 / count}%`,
                    left: `${tick.percent}%`,
                }}
            >
                {tick.value}
            </div>
        </div>
    )
}

class DualSlider extends React.Component{
    constructor(props) {
        super(props);
    }

    render() {
        return(
            <Slider
                rootStyle={sliderStyle}
                domain={[0, this.props.max_range]}
                step={1}
                mode={2}
                values={[0, 0]}
                onChange={this.props.on_slider_change}
            >
                <Rail>
                    {({ getRailProps }) => (
                        <div style={railStyle} {...getRailProps()} />
                    )}
                </Rail>
                <Handles>
                    {({ handles, getHandleProps }) => (
                        <div className="slider-handles">
                            {handles.map(handle => (
                                <Handle
                                    key={handle.id}
                                    handle={handle}
                                    getHandleProps={getHandleProps}

                                />
                            ))}
                        </div>
                    )}
                </Handles>
                <Tracks left={false} right={false}>
                    {({ tracks, getTrackProps }) => (
                        <div className="slider-tracks">
                            {tracks.map(({ id, source, target }) => (
                                <Track
                                    key={id}
                                    source={source}
                                    target={target}
                                    getTrackProps={getTrackProps}
                                />
                            ))}
                        </div>
                    )}
                </Tracks>
                <Ticks count={this.props.max_range/200}>
                    {({ ticks }) => (
                        <div className="slider-ticks">
                            {ticks.map(tick => (
                                <Tick key={tick.id} tick={tick} count={ticks.length} />
                            ))}
                        </div>
                    )}
                </Ticks>
            </Slider>
        )
    }
}

export default DualSlider;