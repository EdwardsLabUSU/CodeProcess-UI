import React from 'react';
import * as d3 from 'd3';
import finalCode from "../data/code_book.txt";
import image from "../data/image.jpeg";
import grid_point from '../data/grid_point.json';

class CodePlot extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            'data': [...this.props.data],
            'loaded': this.props.loaded
        }

        // 
        this.pointColor = '#3585ff'
        this.margin = {top: 20, right: 15, bottom: 60, left: 100};
        this.outerWidth = 800;
        this.outerHeight = 600;
        this.width = this.outerWidth - this.margin.left - this.margin.right;
        this.height = this.outerHeight - this.margin.top - this.margin.bottom;
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
        this.svgParent = null;

        this.changeSelection = props.change_selection;
        this.data = this.state.data;
    }


    componentDidMount() {
        this.initScales(this.state.data);
        this.createPlot();
    }


    getData() {
        this.setState({
            'data': this.props.data
        })
        return [...this.state.data];
    }

    changeYaxisLine() {

    }

    clearSelection() {

        this.props.change_selection({
            'x1': 0,
            'y1': 0,
            'x2': 0,
            'y2': 0
        })
        d3.selectAll('.brush-line').remove();
    }

    addBrushEventToSVG(toolsList, canvas, svg) {
        const svgChartParent = d3.select('svg');
        canvas.style('z-index', 0);
        svgChartParent.style('z-index', 1);
        this.svgParent = svgChartParent;

        this.addBrushXYEvent();

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

        const _this = this;

    }

    addBrushEvent(axis, brushFunc) {
        const svg = d3.select('.svg-plot-group');
        this.clearSelection();
        d3.select('.brush-xy').remove();
        d3.select('.brush-x').remove();
        d3.select('.brush-y').remove();
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
        console.log("In brush start: ", _this.brushStartPoint)
        console.log("Selection points: ", selection)
    }


    brushEvent(event, svg, dim = "xy") {
        const _this = this;
        if (_this.brushStartPoint !== null) {

            const scale = 1;
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
            let x_distance = mouse.x - _this.brushStartPoint.mouse.x;
            let yPosition = _this.brushStartPoint.y + distance;
            let xCorMulti = 1;
            if ((x_distance < 0 && mouse.x > _this.brushStartPoint.mouse.x) || (x_distance > 0 && mouse.x < _this.brushStartPoint.mouse.x)) {
                xCorMulti = -1;
            }

            console.log('In brush event: ', mouse, _this.brushStartPoint)

            if (yPosition > _this.height) {
                distance = _this.height - _this.brushStartPoint.y;
                yPosition = _this.height;
            } else if (yPosition < 0) {
                distance = -_this.brushStartPoint.y;
                yPosition = 0;
            }

            // let xPosition = _this.brushStartPoint.x + distance * scale * xCorMulti;
            let xPosition = _this.brushStartPoint.x + x_distance * xCorMulti;
            const oldDistance = distance;

            if (xPosition > _this.width) {
                x_distance = (_this.width - _this.brushStartPoint.x) / scale;
                xPosition = _this.width;
            } else if (xPosition < 0) {
                x_distance = _this.brushStartPoint.x / scale;
                xPosition = 0;
                console.log("X position is less than 0: ", xPosition, x_distance)
            }

            if (oldDistance !== distance) {
                distance *= (oldDistance < 0) ? -1 : 1;
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
                selection.attr('width', x_posValue * scale).attr('height', y_posValue);
                _this.lastBrushSelection = {x1: minX, x2: maxX, y1: minY, y2: maxY};
            } else if (dim === 'x') {
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
            const x1 = _this.x.invert(this.lastBrushSelection.x1);
            const x2 = _this.x.invert(this.lastBrushSelection.x2);

            const y1 = _this.y.invert(this.lastBrushSelection.y1);
            const y2 = _this.y.invert(this.lastBrushSelection.y2);

            const _x1 = this.lastBrushSelection.x1 + _this.margin.left;
            const _x2 = this.lastBrushSelection.x2 + _this.margin.left;
            const _y1 = this.lastBrushSelection.y1 + _this.margin.top;
            const _y2 = this.lastBrushSelection.y2 + _this.margin.top;


            // var drag = d3.drag()
            //     // .origin(function(d) { return d; })
            //     .on('start', dragstarted)
            //     .on('drag', dragged)
            //     .on('end', dragended);


            function dragstarted() {
                // d3.select(this).classed(activeClassName, true);
                var line = d3.select('#x-initial');
                line.attr('stroke', 'pink')
            }

            function dragged(event, elem) {
                var x = event.dx;
                var y = event.dy;

                var line = d3.select('#x-initial');

                // Update the line properties
                var attributes = {
                    x1: parseInt(line.attr('x1')) + x,
                    y1: parseInt(line.attr('y1')) + y,

                    x2: parseInt(line.attr('x2')) + x,
                    y2: parseInt(line.attr('y2')) + y,
                    color: 'pink'
                };

                // line.attr(attributes);
                line.attr('stroke', 'pink')
            }

            function dragended() {
                // d3.select(this).classed(activeClassName, false);
            }

            // Brush Rectangle boundary
            this.svgParent.append('rect')
                .attr('class', 'brush-line')
                .attr('x', _x1)
                .attr('y', _y1)
                .attr('width', (_x2 - _x1))
                .attr('height', _y2 - _y1)
                .attr('stroke', 'black')
                .attr('fill', '#grey')
                .attr("opacity", 0.3);


            if (dim === 'xy') {
                _this.props.change_selection({
                    'x1': parseInt(x1),
                    'y1': parseInt(y1),
                    'x2': parseInt(x2),
                    'y2': parseInt(y2)
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

            } else if (dim === "x") {
                _this.props.change_selection({
                    'x1': parseInt(x1),
                    'y1': 0,
                    'x2': parseInt(x2),
                    'y2': 0
                })
            } else if (dim === "y") {
                _this.props.change_selection({
                    'x1': 0,
                    'y1': parseInt(y1),
                    'x2': 0,
                    'y2': parseInt(y2)
                })
            }
        } else if (s !== null && this.lastBrushSelection !== null) {
            _brushSvg.call(_brush.move, null);
        }
    }

    createCanvasWithSVG() {

        const container = d3.select('.scatter-container');
        // Init SVG
        const svgChart = container.append('svg:svg')
            .attr('position', 'absolute')
            .attr('width', this.outerWidth)
            .attr('height', this.outerHeight)
            .attr('class', 'svg-plot')
            .append('g')
            .attr('class', 'svg-plot-group')
            .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);

        // Init Canvas
        const canvasChart = container.append('canvas')
            .attr('position', 'absolute')
            .attr('width', this.width)
            .attr('height', this.height)
            .style('margin-left', this.margin.left + 'px')
            .style('margin-top', this.margin.top + 'px')
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
            .range([0, this.width])
            // .nice();
        this.y = d3.scaleLinear()
            // .domain([0, y_max]),
            .domain([y_max, 0])
            .range([this.height, 0])
            // .nice();
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
        console.log("Maximum value of x: ", this.x.max)
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
            .text('Number of Events');
        svgChart.append('text')
            .attr('x', `${this.width / 2}`)
            .attr('y', `${this.height + 40}`)
            .text('Final Code');

        let lastTransform;
        let _this = this;

        // Draw plot on canvas
        function draw(transform) {
            lastTransform = transform;

            const scaleX = transform.rescaleX(_this.x);
            const scaleY = transform.rescaleY(_this.y);

            gxAxis.call(xAxis.scale(scaleX));
            gyAxis.call(yAxis.scale(scaleY));

            context.clearRect(0, 0, _this.width, _this.height);

            _this.state.data.forEach(point => {
                drawPoint(scaleX, scaleY, point, transform.k);
            });
        }

        // Initial draw made with no zoom
        draw(d3.zoomIdentity);


        function drawPoint(scaleX, scaleY, point, k) {
            context.beginPath();
            // context.fillStyle = _this.pointColor;
            context.fillStyle = '#a6a6a6';
            const px = scaleX(point[0]);
            const py = scaleY(point[1]);

            // context.arc(px, py, 1.2 * k, 0, 2 * Math.PI, true);
            context.rect(px, py, 1.2 * k, 1.2 * k);
            context.fill();
        }


// // Zoom/Drag handler
//         const zoom_function = d3.zoom().scaleExtent([1, 1000])
//             .on('zoom', (event) => {
//                 const transform = event.transform;
//                 context.save();
//                 draw(transform);
//                 context.restore();
//             });
//
//         canvasChart.call(zoom_function);


    }


    render() {
        return (
            <div style={{
                'width': '100%',
                'height': 'auto',
                'background-color': '#f6f6f6'
            }}>
                <div style={{
                    'margin-top': '1%'
                }}>
                    <label>Brush Action:  </label>
                    <button className={''}
                        style={{}} onClick={this.addBrushXEvent}>X-axis
                    </button>
                    <button className={''}
                        style={{}} onClick={this.addBrushYEvent}>Y-axis
                    </button>
                    <button
                        style={{}} onClick={this.addBrushXYEvent}>XY-axis
                    </button>
                    <button
                        style={{}} onClick={this.clearSelection}>Clear
                    </button>


                </div>

                <div
                    key={this.props.key}
                    id={'scatter-container'}
                    className={'scatter-container'} style={{
                    margin: 'auto',
                    width: '100%',
                    height: '600px',
                    'text-align': 'left',
                }}>
                    {/*<div className="tools">*/}
                    {/*    <button id="reset">Reset</button>*/}
                    {/*    <button id="brush">Brush</button>*/}
                    {/*</div>*/}
                </div>
            </div>

        )
    }
}


export default CodePlot;