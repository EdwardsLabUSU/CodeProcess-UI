import React from 'react';
import * as d3 from 'd3';

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
            'ctrlPress': false
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
        this.zoomCanvas = this.zoomCanvas.bind(this);
        this.zoom = this.zoom.bind(this);
        this.resetCanvas = this.resetCanvas.bind(this);

        this.enableDrag = this.enableDrag.bind(this)
        this.disableDrag = this.disableDrag.bind(this)

        this.svgParent = null;
        this.canvasParent = null;
        this.pointHeight = 0;

        this.changeSelection = props.change_selection;
        this.data = this.state.data;
    }

    enableDrag(){
        console.log("Pressed contril")
        this.canvasParent.style('z-index', 1);
        this.svgParent.style('z-index', 0);
        this.setState({'ctrlPress': true});
    }

    disableDrag(){
        this.canvasParent.style('z-index', 0);
        this.svgParent.style('z-index', 1);
        this.setState({'ctrlPress': false});
    }

    componentDidMount() {
        this.initScales(this.state.data);
        this.createPlot();
        document.addEventListener('keydown', (event)=>{
            if(event.keyCode === 46)
                this.clearSelection();
        }, false);
        document.addEventListener('keydown', (event)=>{
            if(event.keyCode === 17) {
                if(!this.state.ctrlPress) {
                    this.clearSelection();
                    this.enableDrag();
                } else {
                    this.disableDrag()
                }

            }
        }, false);

    }

    componentWillUnmount() {
        document.removeEventListener('keydown', (event)=>{
            if(event.keyCode === 46)
                this.clearSelection();
        }, false);
        document.removeEventListener('keypress', (event)=>{
            if(event.keyCode === 17) {
                console.log("Pressed event contril")
                this.canvasParent.style('z-index', 1);
                this.svgParent.style('z-index', 0);
            }
        }, false);

    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const line = d3.select('.playback-line');
        if (!line.empty()) {
            console.log("Progress got: ", this.props.playBackProgress)
            let zy = this.lastTransform.rescaleY(this.y);
            const line_y = this.props.selection.y1;
            const increment = line_y + this.props.playBackProgress;
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
        this.props.change_selection({
            'x1': 0,
            'y1': 0,
            'x2': 0,
            'y2': 0
        })
        d3.selectAll('.brush-line').remove();
        d3.selectAll('.playback-line').remove();

    }

    addBrushEventToSVG(toolsList, canvas, svg) {

        const svgChartParent = d3.select('svg');
        canvas.style('z-index', 0);
        svgChartParent.style('z-index', 1);
        this.svgParent = svgChartParent;
        this.canvasParent = canvas;


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

    removeBrushEvent() {
        this.clearSelection();
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
        console.log("In brush start: ", _this.brushStartPoint)
        console.log("Selection points: ", selection)
    }


    brushEvent(event, svg, dim = "xy") {
        const _this = this;
        if (_this.brushStartPoint !== null) {

            const scale = 1;
            // const scale = this.width / this.height;
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
                // const posValue = Math.abs(distance);
                selection.attr('width', x_posValue * scale).attr('height', y_posValue);
                // selection.attr('width', posValue * scale).attr('height', posValue);
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

            let zx = this.lastTransform.rescaleX(this.x);
            let zy = this.lastTransform.rescaleY(this.y);

            const x1 = parseInt(zx.invert(this.lastBrushSelection.x1));
            const x2 = parseInt(zx.invert(this.lastBrushSelection.x2));

            const y1 = parseInt(zy.invert(this.lastBrushSelection.y1));
            const y2 = parseInt(zy.invert(this.lastBrushSelection.y2));

            // const _x1 = this.lastBrushSelection.x1 + _this.margin.left;
            // const _x2 = this.lastBrushSelection.x2 + _this.margin.left;
            // const _y1 = this.lastBrushSelection.y1 + _this.margin.top;
            // const _y2 = this.lastBrushSelection.y2 + _this.margin.top;

            const _x1 = zx(x1) + _this.margin.left;
            const _x2 = zx(x2) + _this.margin.left;
            const _y1 = zy(y1) + _this.margin.top;
            const _y2 = zy(y2) + _this.margin.top;


            // var drag = d3.drag()
            //     // .origin(function(d) { return d; })
            //     .on('start', dragstarted)
            //     .on('drag', dragged)
            //     .on('end', dragended);


            // function dragstarted() {
            //     // d3.select(this).classed(activeClassName, true);
            //     var line = d3.select('#x-initial');
            //     line.attr('stroke', 'pink')
            // }
            //
            // function dragged(event, elem) {
            //     var x = event.dx;
            //     var y = event.dy;
            //
            //     var line = d3.select('#x-initial');
            //
            //     // Update the line properties
            //     var attributes = {
            //         x1: parseInt(line.attr('x1')) + x,
            //         y1: parseInt(line.attr('y1')) + y,
            //
            //         x2: parseInt(line.attr('x2')) + x,
            //         y2: parseInt(line.attr('y2')) + y,
            //         color: 'pink'
            //     };
            //
            //     // line.attr(attributes);
            //     line.attr('stroke', 'pink')
            // }
            //
            // function dragended() {
            //     // d3.select(this).classed(activeClassName, false);
            // }

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

            // if (dim === 'xy' || dim === 'y') {
            //
            // }

            if (dim === 'xy') {
                // // const originalPoint = [zx.invert(this.lastBrushSelection.x1),
                // //     zy.invert(this.lastBrushSelection.y1)];
                // const  originalPoint= [x1, y1]
                // let totalX = Math.abs(this.lastBrushSelection.x1 - this.lastBrushSelection.x2);
                // // const t = d3.zoomIdentity.scale(((this.height * this.lastTransform.k) / totalX));
                // const t = d3.zoomIdentity.scale(5)
                // console.log("Original point: ", originalPoint)
                //
                // this.canvasParent
                //     .transition()
                //     .duration(20)
                //     .ease(d3.easeLinear)
                //     .call(this.zoom_function.transform,
                //         d3.zoomIdentity
                //             // .translate(zx(originalPoint[0]) * -1, zy(originalPoint[1]) * -1)
                //             .translate(-x1, -y1)
                //             // .translate(this.x.invert(200) * -1, this.y.invert(20) * -1)
                //             .scale(t.k));


                // this.canvasParent
                //     .transition()
                //     .duration(20)
                //     .ease(d3.easeLinear)
                //     .call(this.zoom_function.transform,
                //         d3.zoomIdentity
                //             .translate(-x1, -y1)
                //             // .translate(this.x.invert(200) * -1, this.y.invert(20) * -1)
                //             .scale(1));

                _this.props.change_selection({
                    'x1': x1,
                    'y1': y1,
                    'x2': x2,
                    'y2': y2
                })

                this.svgParent.append('line')
                    .attr('class', 'playback-line')
                    .style("stroke", "black")
                    .style("stroke-width", 1)
                    .attr("x1", _this.margin.left)
                    .attr("y1", _y1)
                    .attr("x2", _this.width + _this.margin.left)
                    .attr("y2", _y1);

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
            .clamp(true);
        // .nice();
        this.y = d3.scaleLinear()
            // .domain([0, y_max]),
            .domain([y_max, 0])
            .range([this.height, 0])
            .clamp(true);
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

        let _this = this;
        this.lastTransform = null;

        // Draw plot on canvas
        async function draw(transform) {
            _this.setState({'plotting': true});
            d3.select('#scatter-container').style('display', "none");
            console.log('Redrawing points.....', _this.state.plotting);
            const scaleX = transform.rescaleX(_this.x);
            const scaleY = transform.rescaleY(_this.y);

            gxAxis.call(xAxis.scale(scaleX));
            gyAxis.call(yAxis.scale(scaleY));
            context.clearRect(0, 0, _this.width, _this.height);

            const x_domain = scaleX.domain();
            const y_domain = scaleY.domain();
            _this.lastTransform = transform;
            const pointHeight = scaleY(_this.height)/scaleY(_this.max_y_domain);
            const pointWidth = scaleX(_this.width)/scaleX(_this.max_x_domain);
            _this.pointHeight = pointHeight;
            // const pointWidth = scaleX(_this.width)/(x_domain[1] - x_domain[0]);
            // const pointHeight = scaleY(_this.height)/(y_domain[0] - y_domain[1]);

            _this.state.data.forEach(point => {
                    if(
                        (x_domain[0] <= point[0] && point[0] <= x_domain[1])
                        &&
                        ((y_domain[1] <= point[1] && point[1] <= y_domain[0]))
                        ) {
                    drawPoint(scaleX, scaleY, point, transform.k, pointWidth, pointHeight);
                }
            });
            _this.setState({'plotting': false})
            d3.select('#scatter-container').style('display', "block");
            d3.select('.loading').style('display', 'none');
        }

        // Initial draw made with no zoom
        draw(d3.zoomIdentity);

        function drawPoint(scaleX, scaleY, point, k, pointWidth, pointHeight) {

            // const pointWidth = _this.width/_this.max_x_domain;
            // const pointWidth = _this.width/_this.max_x_domain;
            context.beginPath();
            // context.fillStyle = _this.pointColor;
            context.fillStyle = '#a6a6a6';
            // context.fillStyle = "rgba(0, 0, 0, 0)";
            // context.strokeStyle = 'blue';
            context.strokeStyle = '#a6a6a6';

            const px = scaleX(point[0]);
            const py = scaleY(point[1]);

            // context.arc(px, py, 1.2 * k, 0, 2 * Math.PI, true);
            context.strokeRect(px, py, (pointWidth) * k, (pointHeight) * k);
            // context.rect(px, py, 2.5 * k, 2.5 * k);
            context.fill();
        }

        // Zoom/Drag handler
        this.zoom_function = d3.zoom().scaleExtent([1, 10])
            .on('zoom', (event) => {
                const transform = event.transform;
                context.save();
                this.setState({
                    'status': 'Plotting'
                }, ()=> draw(transform));
                this.setState({
                    'status': ''
                });

                context.restore();
                // event.translate([0, 0]);
            });

        this.canvasParent.call(this.zoom_function).on("wheel.zoom", null);

    }

    zoomCanvas(){
        // // this.clearSelection();
        // const zx = this.lastTransform.rescaleX(this.x);
        // const zy = this.lastTransform.rescaleY(this.y);
        // const originalPoint = [zx.invert(this.lastBrushSelection.x1),
        //     zy.invert(this.lastBrushSelection.y1)];
        //
        // // const  originalpoint= [x1, y1]
        // let totalX = Math.abs(this.lastBrushSelection.x2 - this.lastBrushSelection.x1);
        // const t = d3.zoomIdentity.scale(((this.width * this.lastTransform.k) / totalX));
        // this.canvasParent
        //     .transition()
        //     .duration(200)
        //     .ease(d3.easeLinear)
        //     .call(this.zoom_function.transform,
        //         d3.zoomIdentity
        //             .translate(zx(originalPoint[0]) * -1, zy(originalPoint[1]) * -1)
        //             .scale(t.k));
    }


    zoom(scale){
        this.clearSelection();
        this.setState({
            'zoom': scale
        }, () => this.canvasParent
            .transition()
            .duration(20)
            .ease(d3.easeLinear)
            .call(this.zoom_function.transform,
                d3.zoomIdentity
                    // .translate(-x1, -y1)
                    // .translate(this.x.invert(200) * -1, this.y.invert(20) * -1)
                    .scale(this.state.zoom)));
    }

    resetCanvas(){
        const t = d3.zoomIdentity.translate(0, 0).scale(1);
        const zoom_func = this.zoom_function;
        this.canvasParent.transition()
            .duration(750)
            .call(zoom_func.transform, d3.zoomIdentity);
        this.clearSelection();
        this.setState({'zoom':1});
    }

    brushCanvas(){
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
        console.log("Called render......")
        return (
            <div style={{
                'width': '100%',
                'height': 'auto',
                'background-color': '#f6f6f6'
            }}>
                <div style={{
                    'margin-top': '1%'
                }}>
                    <label>Selection: </label>

                    <input
                        type="checkbox" id="x-axis" name="x-axis" value="Code" checked = {this.state.xAxisSelection}
                        onClick={() => {
                            this.setState({
                                'xAxisSelection': !this.state.xAxisSelection
                            }, this.changeBrushAction);
                        }}
                    />
                    <label htmlFor={"x-axis"}>Code  </label>
                    <input
                        type="checkbox" id="y-axis" name="y-axis" value="Playback" checked={this.state.yAxisSelection}
                        onClick={() => {
                            this.setState({
                                'yAxisSelection': !this.state.yAxisSelection
                            }, this.changeBrushAction);
                        }}
                    />
                    <label htmlFor={"y-axis"}>Events</label>

                    {/*<button className={''}*/}
                    {/*        style={{}} onClick={this.addBrushXEvent}>X-axis*/}
                    {/*</button>*/}
                    {/*<button className={''}*/}
                    {/*        style={{}} onClick={this.addBrushYEvent}>Y-axis*/}
                    {/*</button>*/}
                    {/*<button*/}
                    {/*    style={{}} onClick={this.addBrushXYEvent}>XY-axis*/}
                    {/*</button>*/}
                    <button
                        // style={{
                        //     "margin-left": '5px',
                        //     'background-color': '#282c35',
                        //     'color': 'white',
                        //     'box-shadow': '0 0 5px #888',
                        //     'border': '0px solid black'
                        // }}
                        onClick={this.resetCanvas}>Clear
                    </button>
                    <button
                        style={!this.state.ctrlPress ? {

                        }: {
                            'background-color': '#aaa'
                        }}

                        onClick={this.enableDrag}>Drag
                    </button>
                    <button
                        style={this.state.ctrlPress ? {
                        }: {
                            'background-color': '#aaa'
                        }}
                        onClick={this.disableDrag}>Brush
                    </button>
                    <button
                        onClick={()=>this.zoom(Math.min(this.state.zoom +1, 10))}
                    >
                        Zoom IN
                    </button>
                    <button
                        onClick={()=>this.zoom(Math.max(this.state.zoom - 1, 1))}
                    >
                        Zoom Out
                    </button>
                    <ul style={{
                        'float': 'right',
                        'text-align': 'left',
                        'margin-right': '10px',
                        'margin-top': '20%',
                        'border': '1px solid black',
                        'padding': '2%'
                    }}>
                        <li>Zoom: {this.state.zoom}x </li>
                        <li>Mode: {this.state.ctrlPress ? 'Drag': 'Brush'}</li>
                    </ul>


                </div>

                <div
                    hidden={false}
                    key={this.props.key}
                    id={'scatter-container'}
                    className={'scatter-container'}
                    style={{
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
                <ul
                    style={{
                        "float": "left",
                        "text-align":"left"
                    // 'margin-left': '5px'
                }}>
                    <li>You can use delete key to clear selection.</li>
                    <li>You can use ctrl key to toggle brush and drag mode.</li>
                </ul>
            </div>

        )
    }
}


export default CodePlot;