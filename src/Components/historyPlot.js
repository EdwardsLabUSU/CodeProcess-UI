import React from 'react';
import * as d3 from 'd3';

class CodePlot extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            'data': [...this.props.data],
            'loaded': this.props.loaded
        }
        // console.log('Inside constructor of svg plot....')
        // // console.log('Data has been loaded....' , this.state.data.length)
        this.pointColor = '#3585ff'
        this.margin = {top: 20, right: 15, bottom: 60, left: 100};
        this.outerWidth = 800;
        this.outerHeight = 600;
        this.width = this.outerWidth - this.margin.left - this.margin.right;
        this.height = this.outerHeight - this.margin.top - this.margin.bottom;
        this.x   = null;
        this.y = null;

        this.createPlot = this.createPlot.bind(this);
        this.initScales = this.initScales.bind(this);
        this.getData = this.getData.bind(this);
        this.createCanvasWithSVG = this.createCanvasWithSVG.bind(this);
        this.addBrushEventToSVG = this.addBrushEventToSVG.bind(this);
        this.changeSelection = props.change_selection;
        this.data = this.state.data;
    }

    componentDidMount() {
        this.initScales(this.state.data);
        this.createPlot();
    }


    getData(){
        this.setState({
            'data': this.props.data
        })
        return [...this.state.data];
        // return [...grid_point];
        let dataExample = [];

        for(let i = 0; i < 600; i++){
            for(let j = 600; j > i; j--){
                dataExample.push([i, j]);
            }
        }

        // for (let i= 0; i < 10000; i++) {
        //     const x = Math.floor(Math.random() * 600) + 1;
        //     const y = Math.floor(Math.random() * 500) + 1;
        //     dataExample.push([x, y]);
        // }
        //
        return dataExample;
    }

    changeYaxisLine(){

    }

    clearSelection(){
        this.props.change_selection({
            'x1': 0,
            'y1': 0,
            'x2': 0,
            'y2': 0
        })

        d3.selectAll('.brush-line').remove();
    }

    addBrushEventToSVG(toolsList, canvas, svg){
        const svgChartParent = d3.select('svg');
        canvas.style('z-index', 0);
        svgChartParent.style('z-index', 1);

        // const brushButton = toolsList.select('#brush').on('click', () => {
        //     toolsList.selectAll('.active').classed('active', false);
        //     brushButton.classed('active', true);
        //     canvas.style('z-index', 0);
        //     svgChartParent.style('z-index', 1);
        // });

        const brush = d3.brush().extent([[0, 0], [this.width, this.height]])
            .on("start", brush_startEvent)
            .on("brush", brush_brushEvent)
            .on("end", brush_endEvent)
            .on("start.nokey", function() {
                d3.select(window).on("keydown.brush keyup.brush", null);
            });

        let brushStartPoint = null;
        let lastSelection = null;
        const brushSvg = svg
            .append("g")
            .attr("class", "brush")
            .call(brush);
        const _this = this;

        function brush_startEvent(event) {
            _this.clearSelection();
            // console.log("This is event in brush start:" ,event);
            const sourceEvent = event.sourceEvent;
            const selection = event.selection;
            if (sourceEvent && sourceEvent.type === 'mousedown') {
                brushStartPoint = {
                    mouse: {
                        x: sourceEvent.screenX,
                        y: sourceEvent.screenY
                    },
                    x: selection[0][0],
                    y: selection[0][1]
                }
            } else {
                // console.log('Null start point...');
                brushStartPoint = null;
            }
        }


        function brush_brushEvent(event) {
            if (brushStartPoint !== null) {
                // console.log('Brush start point is not null: ', brushStartPoint)
                const scale = 1;
                const sourceEvent = event.sourceEvent;
                const mouse = {
                    x: sourceEvent.screenX,
                    y: sourceEvent.screenY
                };
                if (mouse.x < 0) { mouse.x = 0; }
                if (mouse.y < 0) { mouse.y = 0; }
                let distance = mouse.y - brushStartPoint.mouse.y;
                let x_distance = mouse.x - brushStartPoint.mouse.x;
                let yPosition = brushStartPoint.y + distance;
                let xCorMulti = 1;

                // if ((distance < 0 && mouse.x > brushStartPoint.mouse.x) || (distance > 0 && mouse.x < brushStartPoint.mouse.x)) {
                //     xCorMulti = -1;
                // }

                if ((x_distance < 0 && mouse.x > brushStartPoint.mouse.x) || (x_distance > 0 && mouse.x < brushStartPoint.mouse.x)) {
                    xCorMulti = -1;
                }

                if (yPosition > _this.height) {
                    distance = _this.height - brushStartPoint.y;
                    yPosition = _this.height;
                } else if (yPosition < 0) {
                    distance = -brushStartPoint.y;
                    yPosition = 0;
                }

                // let xPosition = brushStartPoint.x + distance * scale * xCorMulti;
                let xPosition = brushStartPoint.x + x_distance  * xCorMulti;
                const oldDistance = distance;

                if (xPosition > _this.width) {
                    x_distance = (_this.width - brushStartPoint.x) / scale;
                    xPosition = _this.width;
                } else if (xPosition < 0) {
                    x_distance = brushStartPoint.x / scale;
                    xPosition = 0;
                }

                if (oldDistance !== distance) {
                    distance *= (oldDistance < 0) ? -1 : 1;
                    yPosition = brushStartPoint.y + distance;
                }


                const selection = svg.select(".selection");
                const y_posValue = Math.abs(distance);
                const x_posValue = Math.abs(x_distance);
                selection.attr('width', x_posValue * scale).attr('height', y_posValue);

                if (xPosition < brushStartPoint.x) {
                    selection.attr('x', xPosition);
                }
                if (yPosition < brushStartPoint.y) {
                    selection.attr('y', yPosition);
                }

                const minX = Math.min(brushStartPoint.x, xPosition);
                const maxX = Math.max(brushStartPoint.x, xPosition);
                const minY = Math.min(brushStartPoint.y, yPosition);
                const maxY = Math.max(brushStartPoint.y, yPosition);

                lastSelection = { x1: minX, x2: maxX, y1: minY, y2: maxY };
            }
        }



        function brush_endEvent(event) {
            const s = event.selection;
            // console.log("Brush event is ended.. ", lastSelection, s)
            // console.log(s)
            if (!s && lastSelection !==null) {
                // console.log(lastSelection);
                // console.log('Get x, y position: ', _this.x(lastSelection.x1), _this.x(lastSelection.x2) )
                // Re-scale axis for the last transformation
                // let zx = lastTransform.rescaleX(x);
                // let zy = lastTransform.rescaleY(y);

                // Calc distance on Axis-X to use in scale
                // let totalX = Math.abs(lastSelection.x2 - lastSelection.x1);

                // Get current point [x,y] on canvas
                // const originalPoint = [zx.invert(lastSelection.x1), zy.invert(lastSelection.y1)];
                // Calc scale mapping distance AxisX in width * k
                // Example: Scale 1, width: 830, totalX: 415
                // Result in a zoom of 2
                // const t = d3.zoomIdentity.scale(((width * lastTransform.k) / totalX));
                // Re-scale axis for the new transformation
                // zx = t.rescaleX(x);
                // zy = t.rescaleY(y);

                // // console.log('Original Point: ', originalPoint);
                // console.log("Inverted value: " , _this.x.invert(lastSelection.x1) , _this.x.invert(lastSelection.x2));
                // console.log(_this.x);
                // // console.log('Value of t: ', t)

                // These are the actual values of the ranges... Used for highlighting and Code playback...
                const x1 = _this.x.invert(lastSelection.x1);
                const x2 = _this.x.invert(lastSelection.x2);

                const y1 = _this.y.invert(lastSelection.y1) ;
                const y2 = _this.y.invert(lastSelection.y2);

                _this.props.change_selection({
                    'x1': parseInt(x1),
                    'y1': parseInt(y1),
                    'x2': parseInt(x2),
                    'y2': parseInt(y2)
                })

                // console.log(' This is the final point:  ', x1, x2, y1, y2);

                const _x1 = lastSelection.x1 + _this.margin.left;
                const _x2 = lastSelection.x2 + _this.margin.left;
                const _y1 = lastSelection.y1 + _this.margin.top;
                const _y2 = lastSelection.y2 + _this.margin.top;

                // console.log("D3 drag....", d3.drag)
                var drag = d3.drag()
                    // .origin(function(d) { return d; })
                    .on('start', dragstarted)
                    .on('drag', dragged)
                    .on('end', dragended);


                function dragstarted() {
                    // d3.select(this).classed(activeClassName, true);
                    var line = d3.select('#x-initial');
                    line.attr('stroke', 'pink')
                }

                function dragged(event, elem) {
                    var x = event.dx;
                    var y = event.dy;
                    // console.log("Drag event....: ", event, elem);
                    var line = d3.select('#x-initial');
                    // console.log('This is line:  ', line, x, y)
                    // Update the line properties
                    var attributes = {
                        x1: parseInt(line.attr('x1')) + x,
                        y1: parseInt(line.attr('y1')) + y,

                        x2: parseInt(line.attr('x2')) + x,
                        y2: parseInt(line.attr('y2')) + y,
                        color: 'pink'
                    };
                    // console.log('New attrs:  ', attributes )
                    // line.attr(attributes);
                    line.attr('stroke', 'pink')
                }

                function dragended() {
                    // d3.select(this).classed(activeClassName, false);
                }


                // Create lines on brushing...
                svgChartParent.append('line')
                    .attr('id', 'x-initial')
                    .attr('class', 'brush-line')
                    .style("stroke", "black")
                    .style("stroke-width", 2)
                    .attr("x1", _x1)
                    .attr("y1", _this.margin.top)
                    .attr("x2", _x1)
                    .attr("y2", _this.height + _this.margin.top)
                    .call(drag);


                svgChartParent.append('line')
                    .attr('class', 'brush-line')
                    .style("stroke", "black")
                    .style("stroke-width", 2)
                    .attr("x1", _x2)
                    .attr("y1", _this.margin.top)
                    .attr("x2", _x2)
                    .attr("y2", _this.height + _this.margin.top);

                svgChartParent.append('line')
                    .attr('class', 'brush-line')
                    .style("stroke", "orange")
                    .style("stroke-width", 2)
                    .attr("x1", _this.margin.left)
                    .attr("y1", _y1)
                    .attr("x2", _this.width + _this.margin.left)
                    .attr("y2", _y1);

                svgChartParent.append('line')
                    .attr('class', 'brush-line')
                    .style("stroke", "orange")
                    .style("stroke-width", 2)
                    .attr("x1", _this.margin.left)
                    .attr("y1", _y2)
                    .attr("x2", _this.width + _this.margin.left)
                    .attr("y2", _y2);


                // Brush Rectangle boundary
                svgChartParent.append('rect')
                    .attr('class', 'brush-line')
                    .attr('x', _x1)
                    .attr('y', _y1)
                    .attr('width', (_x2-_x1))
                    .attr('height', _y2-_y1)
                    .attr('stroke', 'black')
                    .attr('fill', '#grey')
                    .attr("opacity", 0.3);




                // context.beginPath();
                // context.lineWidth = 5;
                // // Staring point (10,45)
                // context.moveTo(_x1,_y1);
                // // End point (180,47)
                // context.lineTo(_x2,_y1);
                // context.lineTo(_x2,_y2);
                // context.lineTo(_x1,_y2);
                // context.lineTo(_x1, _y1);
                // // Make the line visible
                // context.stroke();

                // Call zoomFunction with a new transformation from the new scale and brush position.
                // To calculate the brush position we use the originalPoint in the new Axis Scale.
                // originalPoint it's always positive (because we're sure it's within the canvas).
                // We need to translate this originalPoint to [0,0]. So, we do (0 - position) or (position * -1)
                // canvasChart
                //     .transition()
                //     .duration(200)
                //     .ease(d3.easeLinear)
                //     .call(zoom_function.transform,
                //         d3.zoomIdentity
                //             .translate(zx(originalPoint[0]) * -1, zy(originalPoint[1]) * -1)
                //             .scale(t.k));
                lastSelection = null;
            } else if ( s!== null && lastSelection !== null){
                // console.log('Null start point in the house....');
                // brushSvg.call(brush.move, [[0,0],[0,0]]);
                brushSvg.call(brush.move, null);
                // _this.clearSelection();
            }
        }

        //    Brush Functions used while brushing
    }

    createCanvasWithSVG(){

        const container = d3.select('.scatter-container');
        // Init SVG
        const svgChart = container.append('svg:svg')
            .attr('position', 'absolute')
            .attr('width', this.outerWidth)
            .attr('height', this.outerHeight)
            .attr('class', 'svg-plot')
            .append('g')
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

    initScales(dataExample){
        const x_max = d3.max(dataExample, (d) => d[0]);
        const y_max = d3.max(dataExample, (d) => d[1]);
        this.x = d3.scaleLinear()
            .domain([0, x_max])
            .range([0, this.width])
            .nice();
        this.y = d3.scaleLinear()
            // .domain([0, y_max]),
            .domain([y_max, 0])
            .range([this.height, 0])
            .nice();
    }

    createPlot(){
        const charts = this.createCanvasWithSVG();
        const canvasChart = charts[0];
        const svgChart = charts[1];
        // Prepare buttons
        const context = canvasChart.node().getContext('2d');

        // Init Axis
        const xAxis = d3.axisBottom(this.x);
        const yAxis = d3.axisLeft(this.y);

        // Add Axis
        const gxAxis = svgChart.append('g')
            .attr('transform', `translate(0, ${this.height})`)
            // .call(xAxis);

        const gyAxis = svgChart.append('g')
            .call(yAxis);


        // Add labels
        svgChart.append('text')
            .attr('x', `-${this.height/2}`)
            .attr('dy', '-3.5em')
            .attr('transform', 'rotate(-90)')
            .text('Number of Events');
        svgChart.append('text')
            .attr('x', `${this.width/2}`)
            .attr('y', `${this.height}`)
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
            context.rect(px, py, 1.2 * k, 1.2*k);
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
            <div
                key = {this.props.key}
                id={'scatter-container'}
                className={'scatter-container'} style={{
                    // margin: 'auto',
                    width: '100%',
                    height: '600px',
                    'text-align': 'left',
                    // border: '5px solid black',
                    'background-color': '#f6f6f6'
            }}>
                {/*<div className="tools">*/}
                {/*    <button id="reset">Reset</button>*/}
                {/*    <button id="brush">Brush</button>*/}
                {/*</div>*/}
            </div>
        )
    }
}


export default CodePlot;