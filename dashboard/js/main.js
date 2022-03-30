
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




	Highcharts.getJSON('https://cdn.jsdelivr.net/gh/highcharts/highcharts@v7.0.0/samples/data/new-intraday.json', function (data) {

	    // create the chart
	    Highcharts.stockChart('graph', {

				chart: {
					backgroundColor: '#fff6f0',
					marginLeft: 22,
					marginRight: 22
				},

	        xAxis: {
	            gapGridLineWidth: 0
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

					exporting: {
						enabled: false,
					},

	        series: [{
	            name: 'AAPL',
	            type: 'area',
	            data: data,
	            gapSize: 5,
							color: '85aab2',
	            tooltip: {
	                valueDecimals: 2
	            },
	            fillColor: {
	                linearGradient: {
	                    x1: 0,
	                    y1: 0,
	                    x2: 0,
	                    y2: 1
	                },
	                stops: [
										// [0, Highcharts.getOptions().colors[0]],
										[0, '#85aab2' ],
	                    [1, Highcharts.color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
	                ]
	            },
	            threshold: null
	        }]
	    });
	});
