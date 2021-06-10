import React, { Component } from 'react'
import {Slider, Rail, Handles, Tracks, Ticks } from 'react-compound-slider'
import { SliderRail, Handle, Track, Tick } from './sliderComp' // example render components - source below

const sliderStyle = {
    position: 'relative',
    height: '100%',
    touchAction: 'none',
    // backgroundColor: '#8B9CB6',
}



class PlaybackSlider extends Component {


    constructor(props) {
        super(props);
    }

    render() {

        return (
            <div style={{ height: 'auto', width: '10%' }}>
                <Slider
                    vertical
                    mode={2}
                    step={1}
                    domain={[0, this.props.max_range]}
                    rootStyle={sliderStyle}
                    onChange={this.props.on_slider_change}
                    values={[0, 0]}
                >
                    <Rail>
                        {({ getRailProps }) => <SliderRail getRailProps={getRailProps} />}
                    </Rail>
                    <Handles>
                        {({ handles, getHandleProps }) => (
                            <div className="slider-handles">
                                {handles.map(handle => (
                                    <Handle
                                        key={handle.id}
                                        handle={handle}
                                        domain={[0, this.props.max_range]}
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
                    <Ticks count={10}>
                        {({ ticks }) => (
                            <div className="slider-ticks">
                                {ticks.map(tick => (
                                    <Tick key={tick.id} tick={tick} />
                                ))}
                            </div>
                        )}
                    </Ticks>
                </Slider>
            </div>
        )
    }
}

export default PlaybackSlider