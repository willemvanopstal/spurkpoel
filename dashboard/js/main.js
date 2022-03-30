
function update_data() {
	console.log('updating data..')
	var wl_elem = document.getElementById("waterlevel");
	var temp_elem = document.getElementById("temperature");
	var pressure_elem = document.getElementById("pressure");
	var updated_elem = document.getElementById("updated");
	wl_elem.classList.add('hide');
	temp_elem.classList.add('hide');
	pressure_elem.classList.add('hide');
	updated_elem.classList.add('hide');
	setTimeout(function () {
		wl_elem.innerHTML = '+24.6'
		wl_elem.classList.remove('hide');
		temp_elem.innerHTML = '21.6'
		temp_elem.classList.remove('hide');
		pressure_elem.innerHTML = '314.9'
		pressure_elem.classList.remove('hide');
		updated_elem.innerHTML = '3.2'
		updated_elem.classList.remove('hide');
	}, 1000)
}


$(function() {
	let xs = []
	for (var i = 0; i <= 4000; i++) {
		xs.push(i)
	}

	let t = 0

	function animate() {

		let points = xs.map(x => {
			let y = 10 + 3 * Math.sin((x + t) / 4)
			return [x, y]
		})

		let path = "M" + points.map(p => {
			return p[0] + "," + p[1]
		}).join(" L")

		$('.wave path').each(function() {
			$(this).attr('d', path);
		})

		t += 0.1

		requestAnimationFrame(animate)
	}

	animate();
})

var options = {

				chart: {
						renderTo: 'graph',
						backgroundColor: '#fff6f0',
						marginLeft: 22,
						marginRight: 22,
						style: {
						 fontFamily: "'Ubuntu Mono', sans-serif",
							fontSize: "15px"
						}
	      },

				rangeSelector: {
						buttons: [{
								type: 'hour',
								count: 12,
								text: '12h'
						}, {
								type: 'hour',
								count: 24,
								text: '24h'
						}, {
								type: 'hour',
								count: 168,
								text: '7d'
						}, {
								type: 'day',
								count: 30,
								text: '30d'
						}, {
								type: 'all',
								count: 1,
								text: 'All'
						}],
						selected: 1,
						inputEnabled: true
				},

				yAxis: [{
					 labels: {
							 align: 'right',
							 x: -3
					 },
					 title: {
							 text: 'Waterstand'
					 },
					 height: '54%',
					 lineWidth: 2,
					 resize: {
							 enabled: true
					 },
					 opposite: true,
					 offset: -80
			 }, {
					 labels: {
							 align: 'right',
							 x: -3
					 },
					 title: {
							 text: 'Druk'
					 },
					 top: '59%',
					 height: '18%',
					 offset: 0,
					 lineWidth: 2
			 }, {
					 labels: {
							 align: 'right',
							 x: -3
					 },
					 gridLineWidth: 0,
					 title: {
							 text: 'Temperatuur'
					 },
					 // top: '82%',
					 height: '54%',
					 offset: 0,
					 lineWidth: 2
			 }, {
					 labels: {
							 align: 'right',
							 x: -3
					 },
					 title: {
							 text: 'Neerslag'
					 },
					 top: '82%',
					 height: '18%',
					 offset: 0,
					 lineWidth: 2
			 }],

        series: [{
            name: 'Waterstand',
            data: null,
            type: 'areaspline',
            threshold: null,
						color: '85aab2',
            tooltip: {
                valueDecimals: 2
            },
            fillColor: '#85aab2',
						//  {
            //     linearGradient: {
            //         x1: 0,
            //         y1: 0,
            //         x2: 0,
            //         y2: 1
            //     },
            //     stops: [
						// 			[0, '#85aab2' ],
						// 			[1, Highcharts.color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
            //     ]
            // }
        },{
            type: 'spline',
            name: 'Druk',
            data: null,
            yAxis: 1
			},{
					type: 'spline',
					name: 'Temperatuur',
					data: null,
					yAxis: 2
		},{
				type: 'column',
				name: 'Neerslag',
				data: null,
				yAxis: 3
	}],

	plotOptions: {
        series: {
            // general options for all series
        },
        column: {
            color: '#85aab2',
						maxPointWidth: 10
        }
    },
    }


$.getJSON('http://willemvanopstal.github.io/spurkpoel/webserver/spurkpoel_2.json', function(json) {
	console.log(json)
        val1 = [];
				val2 = [];
				val3 = [];
				val4 = [];
        $.each(json, function(key,value) {
					val1.push([value[0], value[1]]);
					val2.push([value[0], value[2]]);
					val3.push([value[0], value[3]]);
					val4.push([value[0], value[3]]);
        });

        options.series[0].data = val1;
				options.series[1].data = val2;
				options.series[2].data = val3;
				options.series[3].data = val4;
        chart = new Highcharts.stockChart(options);
     });
