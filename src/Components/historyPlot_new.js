import React from 'react';
import * as d3 from 'd3';
import BaseIDE from "../lib/codeMirror";

class CodePlot extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            'data': [...this.props.data],
            'loaded': this.props.loaded,
            'xAxisSelection': true,
            'yAxisSelection': true,
            'plotting': true,
            'status': '',
            'zoom': 1,
            'ctrlPress': false,
            'mode': 'brush'
        }

        //
        this.pointColor = '#3585ff'
        // this.margin = {top: '2%', right: '2%', bottom: '2%', left: '2%'};
        this.margin = {top: 20, right: 15, bottom: 60, left: 100};
        // this.outerWidth = 800;
        // this.outerHeight = 600;
        this.outerHeight = window.innerHeight * 0.6
        this.outerWidth = window.innerWidth * 0.6 * 0.7
        // this.outerWidth = '80%';
        // this.outerHeight = '80%';
        this.width = this.outerWidth - this.margin.left - this.margin.right;
        this.height = this.outerHeight - this.margin.top - this.margin.bottom;
        // this.width = '76%'
        // this.height = '76%'
        this.max_x_domain = null;
        this.max_y_domain = null;

        this.x = null;
        this.y = null;

        this.lastBrushSelection = null;
        this.brushStartPoint = null;

        this.createPlot = this.createPlot.bind(this);
        this.initScales = this.initScales.bind(this);
        this.getData = this.getData.bind(this);
        this.createCanvasWithSVG = this.createCanvasWithSVG.bind(this);
        this.addBrushEventToSVG = this.addBrushEventToSVG.bind(this);

        // Add brush event to axis...
        this.brushCanvas = this.brushCanvas.bind(this);
        this.addBrushXEvent = this.addBrushXEvent.bind(this);
        this.addBrushYEvent = this.addBrushYEvent.bind(this);
        this.addBrushXYEvent = this.addBrushXYEvent.bind(this);
        this.addBrushEvent = this.addBrushEvent.bind(this);
        // D3 Brush start, brush and brush-end event.
        this.startBrushEvent = this.startBrushEvent.bind(this);
        this.brushEvent = this.brushEvent.bind(this);
        this.endBrushEvent = this.endBrushEvent.bind(this);
        // Clear selection.
        this.clearSelection = this.clearSelection.bind(this);
        this.removeBrushEvent = this.removeBrushEvent.bind(this);
        this.changeBrushAction = this.changeBrushAction.bind(this);
        // Zoom
        this.resetCanvas = this.resetCanvas.bind(this);

        this.addPlaybackLine = this.addPlaybackLine.bind(this);
        this.enableDrag = this.enableDrag.bind(this)
        this.enableBrush = this.enableBrush.bind(this)
        this.enableZoom = this.enableZoom.bind(this)

        this.shortcutKeys = this.shortcutKeys.bind(this);
        this.changeSelection = this.changeSelection.bind(this);

        this.svgParent = null;
        this.canvasParent = null;
        this.loadingScreen = null;

        this.pointHeight = 0;
        this.data = this.state.data;
        this.selection = null;
    }

    enableDrag() {
        // console.log("Pressed contril")
        this.loadingScreen.style('z-index', 0)
        this.canvasParent.style('z-index', 2);
        this.svgParent.style('z-index', 1);
        this.setState({'ctrlPress': true, 'mode': 'pan'});
        this.clearSelection();
        this.clearPlayBack();
        this.changeSelection();
    }

    changeSelection(){
        let y1 = 0;
        let y2 = this.max_y_domain;
        if(this.selection !== null) {
            y1 = this.selection.y1;
            y2 = this.selection.y2;
        }
        this.props.change_selection({
            'y1': y1,
            'y2': y2,
            'x1': 0,
            'x2': 0
        });
    }
    enableBrush() {
        if(this.state.mode === 'brush')
            return
        this.loadingScreen.style('z-index', 0);
        this.canvasParent.style('z-index', 1);
        this.svgParent.style('z-index', 2);
        this.addBrushXEvent();
        this.clearPlayBack();
        // this.selection = null;
        // this.changeSelection();
        this.props.resetPlayBack(true);
        this.setState({'ctrlPress': false, 'mode': 'brush'});
        this.addPlaybackLine();
    }

    enableZoom() {
        this.clearSelection();
        this.loadingScreen.style('z-index', 0)
        this.canvasParent.style('z-index', 1);
        this.svgParent.style('z-index', 2);
        this.setState({'ctrlPress': false, 'mode': 'zoom'}, this.addBrushXYEvent);
        this.addBrushXYEvent();
        this.props.resetPlayBack(true)
        this.clearPlayBack();
        this.addPlaybackLine();
    }

    resetCanvas() {
        const zoom_func = this.zoom_function;
        this.canvasParent
            .call(zoom_func.transform, d3.zoomIdentity);
        this.clearSelection();
        this.setState({'zoom': 1});
        this.selection = null;
        this.clearSelection();
        this.props.resetPlayBack(true);
        this.clearPlayBack();
        this.addPlaybackLine();
        // else if(this.state.mode === 'brush')
    }


    shortcutKeys(event) {
        if (event.keyCode === 83) this.enableBrush();
        else if (event.keyCode === 90) this.enableZoom();
        else if (event.keyCode === 80) this.enableDrag();
        else if (event.keyCode === 67) this.clearSelection();
        else if (event.keyCode === 82) this.resetCanvas();
    }

    componentDidMount() {
        this.initScales(this.state.data);
        this.createPlot();
        document.addEventListener('keydown', this.shortcutKeys, false);
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.shortcutKeys, false);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const line = d3.select('.playback-line');
        if (!line.empty()) {
            // console.log("Progress got: ", this.props.playBackProgress)
            let zy = this.lastTransform.rescaleY(this.y);
            const line_y = this.props.selection.y1;
            const increment = parseInt(line_y) + this.props.playBackProgress;
            line.attr('y1', zy(increment) + this.margin.top)
                .attr('y2', zy(increment) + this.margin.top);
        }
    }


    getData() {
        this.setState({
            'data': this.props.data
        })
        return [...this.state.data];
    }



    clearSelection() {
        this.changeSelection();
        d3.selectAll('.brush-line').remove();
    }

    clearPlayBack(){
        d3.selectAll('.playback-line').remove();
    }

    addBrushEventToSVG(toolsList, canvas, svg) {

        const svgChartParent = d3.select('svg');
        canvas.style('z-index', 0);
        svgChartParent.style('z-index', 1);
        this.svgParent = svgChartParent;
        this.canvasParent = canvas;
        this.addBrushXEvent();

        // const brushSvg = svg
        //     .append("g")
        //     .attr("class", "brush-xy");
        //
        // const brush = d3.brush().extent([[0, 0], [this.width, this.height]])
        //     .on("start", this.startBrushEvent)
        //     .on("brush", (event) => this.brushEvent(event, svg));
        //
        // brush.on("end", (event) => this.endBrushEvent(event, brushSvg, brush))
        //     .on("start.nokey", function () {
        //         d3.select(window).on("keydown.brush keyup.brush", null);
        //     });
        //
        // brushSvg.call(brush);

    }

    removeBrushEvent() {
        this.clearSelection();
        // if(this.state.mode !== 'zoom')
        d3.select('.brush-xy').remove();
        d3.select('.brush-x').remove();
        d3.select('.brush-y').remove();
    }

    addBrushEvent(axis, brushFunc) {
        const svg = d3.select('.svg-plot-group');
        this.removeBrushEvent();
        const brushSvg = svg
            .append("g")
            .attr("class", "brush-" + axis);

        this.brushStartPoint = null;
        this.lastBrushSelection = null;
        const brush = brushFunc().extent([[0, 0], [this.width, this.height]])
            .on("start", (event) => this.startBrushEvent(event, axis))
            .on('brush', (event) => this.brushEvent(event, svg, axis))
            .on('end', (event) => this.endBrushEvent(event, brushSvg, brush, axis))
            .on("start.nokey", function () {
                d3.select(window).on("keyUp.brush keyDown.brush", null);
            });
        brushSvg.call(brush);
    }

    addBrushXEvent() {
        this.addBrushEvent("x", d3.brushX);
    }

    addBrushYEvent() {
        this.addBrushEvent("y", d3.brushY);
    }

    addBrushXYEvent() {
        this.addBrushEvent("xy", d3.brush);
    }


    startBrushEvent(event, dim = "xy") {
        const _this = this;
        _this.clearSelection();
        // _this.brushStartPoint = null;
        // _this.lastBrushSelection = null;

        const sourceEvent = event.sourceEvent;
        const selection = event.selection;
        if (sourceEvent && sourceEvent.type === 'mousedown') {
            _this.brushStartPoint = {
                mouse: {
                    x: sourceEvent.screenX,
                    y: sourceEvent.screenY
                },
                x: null,
                y: null
            }
            if (dim === "xy") {
                _this.brushStartPoint.x = selection[0][0];
                _this.brushStartPoint.y = selection[0][1];
            } else if (dim === "x") {
                _this.brushStartPoint.x = selection[0];
                _this.brushStartPoint.y = 0;
            } else if (dim === "y") {
                _this.brushStartPoint.x = 0;
                _this.brushStartPoint.y = selection[1];
            }
        } else {
            _this.brushStartPoint = null;
        }
        // console.log("In brush start: ", _this.brushStartPoint)
        // console.log("Selection points: ", selection)
    }


    brushEvent(event, svg, dim = "xy") {
        const _this = this;
        if (_this.brushStartPoint !== null) {

            // const scale = 1;
            const scale = this.state.mode === 'zoom' ? this.width / this.height : 1;
            const sourceEvent = event.sourceEvent;
            const mouse = {
                x: sourceEvent.screenX,
                y: sourceEvent.screenY
            };
            if (mouse.x < 0) {
                mouse.x = 0;
            }
            if (mouse.y < 0) {
                mouse.y = 0;
            }
            let distance = mouse.y - _this.brushStartPoint.mouse.y;
            let x_distance = this.state.mode === 'zoom' ? distance : mouse.x - _this.brushStartPoint.mouse.x;
            // let x_distance = distance;

            let yPosition = _this.brushStartPoint.y + distance;
            let xCorMulti = 1;
            if ((x_distance < 0 && mouse.x > _this.brushStartPoint.mouse.x) || (x_distance > 0 && mouse.x < _this.brushStartPoint.mouse.x)) {
                xCorMulti = -1;
            }

            if (yPosition > _this.height) {
                distance = _this.height - _this.brushStartPoint.y;
                if (this.state.mode === 'zoom') {
                    x_distance = distance;
                }
                yPosition = _this.height;
            } else if (yPosition < 0) {
                distance = -_this.brushStartPoint.y;
                if (this.state.mode === 'zoom') {
                    x_distance = distance;
                }
                yPosition = 0;
            }

            let xPosition = null;
            if (this.state.mode === 'zoom') {
                xPosition = _this.brushStartPoint.x + distance * scale * xCorMulti;
            } else {
                xPosition = _this.brushStartPoint.x + x_distance * xCorMulti;
            }


            const oldDistance = distance;

            if (xPosition > _this.width) {
                if (this.state.mode === 'zoom') {
                    distance = (_this.width - _this.brushStartPoint.x) / scale;
                    x_distance = (_this.width - _this.brushStartPoint.x) / scale;
                } else {
                    x_distance = (_this.width - _this.brushStartPoint.x) / scale;
                }
                xPosition = _this.width;
            } else if (xPosition < 0) {
                if (this.state.mode === 'zoom') {
                    distance = _this.brushStartPoint.x / scale;
                }
                x_distance = _this.brushStartPoint.x / scale;
                xPosition = 0;
                // console.log("X position is less than 0: ", xPosition, x_distance)
            }

            if (oldDistance !== distance) {
                distance *= (oldDistance < 0) ? -1 : 1;
                if (this.state.mode === 'zoom') {
                    x_distance = distance
                }
                yPosition = _this.brushStartPoint.y + distance;
            }

            const selection = svg.select(".selection");
            if (xPosition < _this.brushStartPoint.x) {
                selection.attr('x', xPosition);
            }
            if (yPosition < _this.brushStartPoint.y) {
                selection.attr('y', yPosition);
            }

            const minX = Math.min(_this.brushStartPoint.x, xPosition);
            const maxX = Math.max(_this.brushStartPoint.x, xPosition);
            const minY = Math.min(_this.brushStartPoint.y, yPosition);
            const maxY = Math.max(_this.brushStartPoint.y, yPosition);

            if (dim === 'xy') {
                const y_posValue = Math.abs(distance);
                const x_posValue = Math.abs(x_distance);
                // const posValue = Math.abs(distance);
                selection.attr('width', x_posValue * scale).attr('height', y_posValue);
                // selection.attr('width', posValue * scale).attr('height', posValue);
                _this.lastBrushSelection = {x1: minX, x2: maxX, y1: minY, y2: maxY};
            } else if (dim === 'x') {
                const x_posValue = Math.abs(x_distance);
                selection.attr('width', x_posValue)
                // selection.attr('width', x * scale).attr('height', y_posValue);
                _this.lastBrushSelection = {x1: minX, x2: maxX, y1: 0, y2: this.height};
            } else if (dim === 'y') {
                _this.lastBrushSelection = {x1: 0, x2: this.width, y1: minY, y2: maxY};
            }


        }
    }

    endBrushEvent(event, _brushSvg, _brush, dim = "xy") {
        const _this = this;
        const s = event.selection;
        if (!s && this.lastBrushSelection !== null) {
            // These are the actual values of the ranges... Used for highlighting and Code playback...

            let zx = this.lastTransform.rescaleX(this.x);
            let zy = this.lastTransform.rescaleY(this.y);

            const x1 = Math.ceil(zx.invert(this.lastBrushSelection.x1));
            const x2 = Math.ceil(zx.invert(this.lastBrushSelection.x2));

            const y1 = Math.ceil(zy.invert(this.lastBrushSelection.y1));
            const y2 = Math.ceil(zy.invert(this.lastBrushSelection.y2));

            this.selection = {
                'x1': x1,
                'x2': x2,
                'y1': y1,
                'y2': y2
            }

            const _x1 = this.lastBrushSelection.x1 + _this.margin.left;
            const _x2 = this.lastBrushSelection.x2 + _this.margin.left;
            const _y1 = this.lastBrushSelection.y1 + _this.margin.top;
            const _y2 = this.lastBrushSelection.y2 + _this.margin.top;

            // const _x1 = zx(x1) + _this.margin.left;
            // const _x2 = zx(x2) + _this.margin.left;
            // const _y1 = this.lastBrushSelection.y1 + _this.margin.top;
            // const _y2 = zy(y2) + _this.margin.top;

            // Brush Rectangle boundary
            this.svgParent.append('rect')
                .attr('class', 'brush-line')
                .attr('x', _x1)
                .attr('y', _y1)
                .attr('width', (_x2 - _x1))
                .attr('height', _y2 - _y1)
                .attr('stroke', 'black')
                // .attr('fill', '#grey')
                .attr('fill', 'green')
                .attr("opacity", 0.3);

            // if (dim === 'xy' || dim === 'y') {
            //
            // }

            if (dim === 'xy') {
                _this.props.change_selection({
                    'x1': x1,
                    'y1': y1,
                    'x2': x2,
                    'y2': y2
                })
                // Create lines on brushing...
                this.svgParent.append('line')
                    .attr('id', 'x-initial')
                    .attr('class', 'brush-line')
                    .style("stroke", "black")
                    .style("stroke-width", 2)
                    .attr("x1", _x1)
                    .attr("y1", _this.margin.top)
                    .attr("x2", _x1)
                    .attr("y2", _this.height + _this.margin.top)
                // .call(drag);


                this.svgParent.append('line')
                    .attr('class', 'brush-line')
                    .style("stroke", "black")
                    .style("stroke-width", 2)
                    .attr("x1", _x2)
                    .attr("y1", _this.margin.top)
                    .attr("x2", _x2)
                    .attr("y2", _this.height + _this.margin.top);

                this.svgParent.append('line')
                    .attr('class', 'brush-line')
                    .style("stroke", "orange")
                    .style("stroke-width", 2)
                    .attr("x1", _this.margin.left)
                    .attr("y1", _y1)
                    .attr("x2", _this.width + _this.margin.left)
                    .attr("y2", _y1);

                this.svgParent.append('line')
                    .attr('class', 'brush-line')
                    .style("stroke", "orange")
                    .style("stroke-width", 2)
                    .attr("x1", _this.margin.left)
                    .attr("y1", _y2)
                    .attr("x2", _this.width + _this.margin.left)
                    .attr("y2", _y2);

                if (this.state.mode === 'zoom') {
                    this.clearPlayBack();
                    let totalX = Math.abs(this.lastBrushSelection.x2 - this.lastBrushSelection.x1);
                    // const originalPoint = [zx.invert(this.lastBrushSelection.x1),
                    //     zy.invert(this.lastBrushSelection.y1)];
                    const originalPoint = [x1, y1];
                    const t = d3.zoomIdentity.scale(((this.width * this.lastTransform.k) / totalX));
                    zx = t.rescaleX(this.x);
                    zy = t.rescaleY(this.y);
                    this.setState({
                        'zoom': parseInt(t.k)
                    })
                    this.canvasParent
                        .transition()
                        .duration(200)
                        .ease(d3.easeLinear)
                        .call(this.zoom_function.transform,
                            d3.zoomIdentity
                                .translate(zx(originalPoint[0]) * -1, zy(originalPoint[1]) * -1)
                                .scale(t.k));

                    this.clearSelection();
                    this.props.resetPlayBack(true);
                }

                this.svgParent.append('line')
                    .attr('class', 'playback-line')
                    .style("stroke", "black")
                    .style("stroke-width", 1)
                    .attr("x1", _this.margin.left)
                    .attr("y1", _y1)
                    .attr("x2", _this.width + _this.margin.left)
                    .attr("y2", _y1);


            } else if (dim === "x") {
                this.svgParent.append('line')
                    .attr('class', 'playback-line')
                    .style("stroke", "black")
                    .style("stroke-width", 1)
                    .attr("x1", _this.margin.left)
                    .attr("y1", _y1)
                    .attr("x2", _this.width + _this.margin.left)
                    .attr("y2", _y1);

                _this.props.change_selection({
                    'x1': x1,
                    'y1': y1,
                    'x2': x2,
                    'y2': y2
                })
            } else if (dim === "y") {
                _this.props.change_selection({
                    'x1': 0,
                    'y1': y1,
                    'x2': 0,
                    'y2': y2
                });
                this.svgParent.append('line')
                    .attr('class', 'playback-line')
                    .style("stroke", "black")
                    .style("stroke-width", 1)
                    .attr("x1", _this.margin.left)
                    .attr("y1", _y1)
                    .attr("x2", _this.width + _this.margin.left)
                    .attr("y2", _y1);
            }
        } else if (s !== null && this.lastBrushSelection !== null) {
            _brushSvg.call(_brush.move, null);
        }
    }

    createCanvasWithSVG() {

        const container = d3.select('.scatter-container');

        // .style('z-index', '1')

        // Init SVG
        const svgChart = container.append('svg:svg')
            .attr('position', 'absolute')
            .attr('width', this.outerWidth)
            .attr('height', this.outerHeight)
            .attr('class', 'svg-plot')
            .append('g')
            .attr('class', 'svg-plot-group')
            .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);

        this.loadingScreen = container.append('img')
            .attr('position', 'absolute')
            .attr('src', process.env.PUBLIC_URL + "/img/loading.gif")
            .attr('width', this.width)
            .attr('height', this.height)
            .style('margin-left', this.margin.left + 'px')
        // .style('margin-top', this.margin.top -2 + 'px')

        // Init Canvas
        const canvasChart = container.append('canvas')
            .attr('position', 'absolute')
            .attr('width', this.width)
            .attr('height', this.height)
            .style('margin-left', this.margin.left + 'px')
            .style('margin-top', this.margin.top + 'px')
            .style('background-color', 'white')
            .attr('class', 'canvas-plot');

        svgChart.append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', (this.width))
            .attr('height', this.height)
            .attr('stroke', 'black')
            .attr('fill', 'none')
            .attr("opacity", '1');
        // const toolsList = container.select('.tools')
        //     .style('margin-top', this.margin.top + 'px')
        //     .style('visibility', 'visible');
        //
        // toolsList.select('#reset').on('click', () => {
        //     this.clearSelection()
        // });
        this.addBrushEventToSVG(null, canvasChart, svgChart);
        return [canvasChart, svgChart]
    }

    initScales(dataExample) {
        const x_max = d3.max(dataExample, (d) => d[0]);
        const y_max = d3.max(dataExample, (d) => d[1]);
        this.x = d3.scaleLinear()
            .domain([0, x_max])
            .range([0, this.width]);
        this.y = d3.scaleLinear()
            .domain([y_max, 0])
            .range([this.height, 0])
        this.max_x_domain = x_max;
        this.max_y_domain = y_max;
    }

    createPlot() {
        const charts = this.createCanvasWithSVG();
        const canvasChart = charts[0];
        const svgChart = charts[1];
        // Prepare buttons
        const context = canvasChart.node().getContext('2d');
        // Init Axis
        // console.log("Maximum value of x: ", this.x.max)
        const xAxis = d3.axisBottom(this.x);
        const yAxis = d3.axisLeft(this.y);

        // Add Axis
        const gxAxis = svgChart.append('g')
            .attr('transform', `translate(0, ${this.height})`)
            .call(xAxis);

        const gyAxis = svgChart.append('g')
            .call(yAxis);


        // Add labels
        svgChart.append('text')
            .attr('x', `-${this.height / 2}`)
            .attr('dy', '-3.5em')
            .attr('transform', 'rotate(-90)')
            .text('Snapshots');
        svgChart.append('text')
            .attr('x', `${this.width / 2}`)
            .attr('y', `${this.height + 40}`)
            .text('Selection in Final Code');

        let _this = this;
        this.lastTransform = null;

        // Draw plot on canvas

        function draw(transform) {
            // console.log('Redrawing points.....', _this.state.plotting);
            const drawPromise = new Promise(function (resolve, reject) {
                setTimeout(() => {
                    const scaleX = transform.rescaleX(_this.x);
                    const scaleY = transform.rescaleY(_this.y);
                    gxAxis.call(xAxis.scale(scaleX));
                    gyAxis.call(yAxis.scale(scaleY));
                    const x_domain = scaleX.domain();
                    const y_domain = scaleY.domain();
                    _this.lastTransform = transform;
                    _this.selection = {
                        'x1': parseInt(x_domain[0]),
                        'x2': parseInt(x_domain[1]),
                        'y1': parseInt(y_domain[1]),
                        'y2': parseInt(y_domain[0])
                    }
                    context.clearRect(0, 0, _this.width, _this.height);
                    // context.translate(-1*scaleX(_this.selection.x1), -1*scaleY(_this.selection.y1));

                    // const pointHeight = scaleY(_this.height) / scaleY(_this.max_y_domain);
                    // const pointWidth = scaleX(_this.width) / scaleX(_this.max_x_domain);

                    const pointWidth = scaleX(_this.width)/scaleX(x_domain[1] - x_domain[0]);
                    const pointHeight = scaleY(_this.height)/scaleY(y_domain[0] - y_domain[1]);
                    _this.pointHeight = pointHeight;
                    _this.changeSelection();
                    _this.setState({'plotting': true}, () => {
                        _this.state.data.forEach(point => {
                            if (
                                (_this.selection.x1 <= point[0] && point[0] <= _this.selection.x2)
                                // &&
                                // ((y_domain[1] <= point[1] && point[1] <= y_domain[0]))
                            ) {
                                drawPoint(scaleX, scaleY, point, transform.k, pointWidth, pointHeight);
                            }
                        });
                    });
                    resolve();
                    d3.select('.loading').style('display', 'none');
                    d3.select('#test-text').style('color', 'black');
                }, 0)
            });

            _this.loadingScreen.style('display', 'block');
            _this.canvasParent.style('display', 'none');
            _this.setState({
                'plotting': true
            }, () => {
                drawPromise.then(() => {
                    // this.canvasParent.style('display', 'auto');
                    // console.log("Redraw successful...")
                    _this.setState({
                        'plotting': false
                    }, () => {
                        _this.canvasParent.style('display', 'block');
                        _this.loadingScreen.style('display', 'none')
                    })
                })
            });
        }

        // Initial draw made with no zoom
        draw(d3.zoomIdentity);
        // this.setState({
        //     'plotting': true
        // }, ()=>{
        //     context.clearRect(0, 0, _this.width, _this.height);
        //     // this.canvasParent.style('display', 'none');
        //     this.loadingScreen.style('display', 'auto');
        //     draw(d3.zoomIdentity).then(()=> {
        //         // this.canvasParent.style('display', 'auto');
        //         this.loadingScreen.style('display', 'none');
        //         this.setState({
        //             'plotting': false
        //         })
        //     })
        // });

        function drawPoint(scaleX, scaleY, point, k, pointWidth, pointHeight) {

            // const pointWidth = _this.width/_this.max_x_domain;
            // const pointWidth = _this.width/_this.max_x_domain;
            context.beginPath();
            // context.fillStyle = _this.pointColor;
            // context.fillStyle = '#ffffff';
            context.strokeStyle = "rgba(166, 166, 166, 1)";
            context.fillStyle = "rgba(166, 166, 166, 1)";
            // context.strokeStyle = 'blue';
            // context.strokeStyle = '#a6a6a6';

            const px = scaleX(point[0]);
            const py = scaleY(point[1]);

            const aspectRatio = _this.max_x_domain/_this.max_y_domain;
            pointHeight = _this.height/_this.max_y_domain;
            pointWidth = _this.width/_this.max_x_domain;
            // context.arc(px, py, 0.4*k, 0, 2 * Math.PI, true);
            // context.strokeRect(px, py, Math.abs(pointWidth)*k , Math.abs(pointHeight)*k );
            context.rect(px, py, Math.abs(pointWidth)*k , Math.abs(pointHeight)*k );
            // context.rect(px, py, (pointWidth) * k, (pointHeight) * k, true);
            // context.rect(px, py, 2.5 * k, 2.5 * k);
            // context.stroke();
            context.fill();
        }

        // Zoom/Drag handler
        this.zoom_function = d3.zoom().scaleExtent([1, 100])
            .translateExtent([[0, 0], [this.width, this.height]])
            // .extent([[0, 0], [this.width, this.height]])
            .on('zoom', (event) => {
                const transform = event.transform;
                context.save();

                // context.translate(this.x(parseInt(this.x.invert(transform.x))), this.y(parseInt(this.y.invert(transform.y))));
                draw(transform);
                context.restore();
            });

        this.canvasParent.call(this.zoom_function)
            .on("wheel.zoom", null)
            .on("touchstart.zoom", null)
            .on("touchmove.zoom", null)
            .on("touchend.zoom", null);

        this.props.change_selection({
            'y1': 0,
            'y2': this.state.max_y_domain,
            'x1': 0,
            'x2': 0
        })

        this.lastTransform = d3.zoomIdentity;
        this.addPlaybackLine();

    }

    addPlaybackLine(){
        this.svgParent.append('line')
            .attr('class', 'playback-line')
            .style("stroke", "black")
            .style("stroke-width", 1)
            .attr("x1", this.margin.left)
            .attr("y1", 0)
            .attr("x2", this.width + this.margin.left)
            .attr("y2", 0);
    }

    brushCanvas() {
        this.clearSelection();
        this.canvasParent.style('z-index', 0);
        this.svgParent.style('z-index', 1);
    }


    changeBrushAction() {
        if (this.state.xAxisSelection && this.state.yAxisSelection) {
            this.addBrushXYEvent();
        } else if (this.state.xAxisSelection) {
            this.addBrushXEvent();
        } else if (this.state.yAxisSelection) {
            this.addBrushYEvent();
        } else {
            this.removeBrushEvent();
        }
    }

    render() {
        // console.log("Called render......")
        const buttonStyle = {
            'float': 'left',
            'padding': '1%',
            'margin-top': '3%',
            'margin-left': '1%',
            'margin-right': '1%',
            'width': '25%',
            'background-color': '#282c35',
            'color': 'white',
            'border': 'none',
            'border-radius': '4px'
        }
        const clickedButtonStyle = {
            ...buttonStyle,
            'background-color': '#aaa',
            'color': '#282c35',
        }

        const highLightButton = {
            ...buttonStyle,
            // 'float': 'none',
            'width': '120px',
        };
        const clickedHighLight = {
            ...highLightButton,
            'background-color': '#aaa',
            'color': '#282c35',
        }

        return (
            <div style={{
                'width': '100%',
                'height': 'auto',
                'background-color': '#f6f6f6',
            }}>
                <div style={{
                    'margin-top': '1%'
                }}>
                    {/*<label>Selection: </label>*/}

                    {/*<input*/}
                    {/*    type="checkbox" id="x-axis" name="x-axis" value="Code" checked={this.state.xAxisSelection}*/}
                    {/*    onClick={() => {*/}
                    {/*        this.setState({*/}
                    {/*            'xAxisSelection': !this.state.xAxisSelection*/}
                    {/*        }, this.changeBrushAction);*/}
                    {/*    }}*/}
                    {/*/>*/}
                    {/*<label htmlFor={"x-axis"}>Code </label>*/}
                    {/*<input*/}
                    {/*    type="checkbox" id="y-axis" name="y-axis" value="Playback" checked={this.state.yAxisSelection}*/}
                    {/*    onClick={() => {*/}
                    {/*        this.setState({*/}
                    {/*            'yAxisSelection': !this.state.yAxisSelection*/}
                    {/*        }, this.changeBrushAction);*/}
                    {/*    }}*/}
                    {/*/>*/}
                    {/*<label htmlFor={"y-axis"}>Events</label>*/}
                    <div
                        style={{
                            'width': this.width,
                            'display': 'table',
                            'margin-left': this.margin.left,
                            'margin-right': this.margin.right,
                            'margin-bottom': '0px',
                            'height': '40px'
                        }}
                    >

                        <div
                            className={'button-group'}
                            style={{
                                'display': 'table-cell',
                                'width': '40%',
                                'border': '1px solid black',
                                // 'margin-left': this.margin.left
                            }}

                        >
                            <p
                                style={{
                                    'float': 'left',
                                    'margin-top': -10,
                                    'margin-left': 15,
                                    'background-color': 'white',
                                    'height': '10px',
                                    'margin-bottom': '0'
                                }}
                            >Mode</p>
                            <button
                                style={this.state.mode === 'pan' ? clickedButtonStyle : buttonStyle}
                                onClick={this.enableDrag}>Pan
                            </button>
                            <button
                                style={this.state.mode === 'brush' ? clickedButtonStyle : buttonStyle}
                                onClick={this.enableBrush}>Select
                            </button>
                            <button
                                onClick={this.enableZoom}
                                style={this.state.mode === 'zoom' ? clickedButtonStyle : buttonStyle}
                            >
                                Zoom
                            </button>
                        </div>
                        <div
                            style={{
                                // 'float': 'right',
                                'display': 'table-cell',
                                'width': '60%',
                                'border': '1px solid black',
                                // 'margin-left': '51%',
                                // 'margin-right': this.margin.right
                            }}
                        >
                            <button
                                style={this.props.highLightToggle ? clickedHighLight : highLightButton}
                                onClick={this.props.highLightDiff}>
                                Highlight Diff
                            </button>
                            {/*<br/>*/}
                            <button
                                style={{...buttonStyle, 'margin-left': '5px'}}
                                onClick={this.clearSelection}>Clear
                            </button>
                            <button
                                style={{...buttonStyle, 'margin-left': '3px'}}
                                onClick={this.resetCanvas}>Reset
                            </button>
                        </div>
                    </div>
                    {/*<div*/}
                    {/*    style={{*/}
                    {/*        'margin-right': '5px',*/}
                    {/*        'float': 'right',*/}
                    {/*        'margin-top': '20%',*/}
                    {/*        'border': '1px solid black',*/}
                    {/*        // 'padding': '1%',*/}
                    {/*    }}*/}
                    {/*>*/}

                    {/*    <ul*/}
                    {/*        style={{*/}
                    {/*            'text-align': 'left',*/}
                    {/*            'margin-right': '5px',*/}
                    {/*            'margin-top': '45px'*/}
                    {/*        }}*/}
                    {/*    >*/}
                    {/*        <li id={'test-text'}>Zoom: {parseInt(this.state.zoom)}x</li>*/}
                    {/*        <li>Mode: {this.state.mode}</li>*/}
                    {/*        <li>{this.state.plotting ? 'Loading' : 'Loaded'}</li>*/}
                    {/*    </ul>*/}
                    {/*</div>*/}


                </div>
                {/*{this.state.plotting ? <img src={process.env.PUBLIC_URL+ "/img/loading.gif"}/> : null }*/}
                <div


                    style={{
                        margin: 'auto',
                        width: '100%',
                        height: window.innerHeight * 0.6,
                        'text-align': 'left',

                    }}>
                    <div
                        id={'scatter-container'}
                        className={'scatter-container'}
                        key={this.props.key}
                    >
                    </div>
                </div>
            </div>

        )
    }
}


export default CodePlot;