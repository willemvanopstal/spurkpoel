var data_waterlevel
var data_pressure
var data_temperature
var data_updated

var high_water_limit = 1.0
var low_water_limit = 0.8

function pad(num, size) {
    var s = "0000000000000" + num;
    return s.substr(s.length - size);
}

function roundedToFixed(input, digits){
  var rounded = Math.pow(10, digits);
  return (Math.round(input * rounded) / rounded).toFixed(digits);
}

// Wave function
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

// Replace all data values on top of page
function update_data_values() {
    console.log('Updating data values..')
    var wl_elem = document.getElementById("waterlevel");
    var temp_elem = document.getElementById("temperature");
    var pressure_elem = document.getElementById("pressure");
    var updated_elem = document.getElementById("updated");
    wl_elem.classList.add('hidden');
    temp_elem.classList.add('hidden');
    pressure_elem.classList.add('hidden');
    updated_elem.classList.add('hidden');
    setTimeout(function() {
      wl_elem.innerHTML = roundedToFixed(data_waterlevel, 1)
      wl_elem.classList.remove('hidden');
      temp_elem.innerHTML = roundedToFixed(data_temperature, 1)
      temp_elem.classList.remove('hidden');
      pressure_elem.innerHTML = data_pressure
      pressure_elem.classList.remove('hidden');
      updated_elem.innerHTML = data_updated
      updated_elem.classList.remove('hidden');
      $('.icon-container .icon').removeClass('loading');

      if (data_waterlevel > high_water_limit) {
        console.log('high water limit reached!')
        var warning_waterlevel_elem = document.getElementById("warning-waterlevel");
        $('#warning-waterlevel .icon:last-child').removeClass('upside-down');
        warning_waterlevel_elem.classList.add('visible');
      }
      else if (data_waterlevel <= low_water_limit) {
        console.log('low water limit reached!')
        var warning_waterlevel_elem = document.getElementById("warning-waterlevel");
        $('#warning-waterlevel .icon:last-child').addClass('upside-down');
        warning_waterlevel_elem.classList.add('visible');
      }
      else {
        // var warning_waterlevel_elem = document.getElementById("warning-waterlevel");
        // warning_waterlevel_elem.classList.remove('hidden');
      }

    }, 500)

    console.log('Data values updated!')
}

function synchronize() {
    console.log('Syncing with TTN data..')
    $('.update').addClass('loading');
    $.getJSON('https://willemvanopstal.pythonanywhere.com/update', function(json) {
        console.log('Synced back-end with TTN')
        console.log('Fetched newly synced data from back-end')
        load_data(json)
    });
};



function load_data(json) {
    console.log('Parsing data..')

    var warning_waterlevel_elem = document.getElementById("warning-waterlevel");
    warning_waterlevel_elem.classList.remove('visible');
    // warning_waterlevel_elem.classList.add('hidden');

    var last_data
    val1 = [];
    val2 = [];
    val3 = [];
    val4 = [];
    $.each(json, function(key, value) {
        val1.push([value[0], value[1]]);
        val2.push([value[0], value[2]]);
        val3.push([value[0], value[3]]);
        val4.push([value[0], value[4]]);
        lastdata = value
    });
    options.series[0].data = val3;
    options.series[1].data = val1;
    options.series[2].data = val2;
    // options.series[3].data = val4;

    console.log(lastdata)

    var elapsed_seconds = Math.round((Date.now() - lastdata[0]) / 1000);
    hours = Math.floor(elapsed_seconds / 3600);
    elapsed_seconds %= 3600;
    minutes = Math.floor(elapsed_seconds / 60);
    seconds = elapsed_seconds % 60;

    console.log(Date.now(), elapsed_seconds, hours, minutes)

    data_updated = pad(hours, 2) + ':' + pad(minutes, 2)
    data_waterlevel = lastdata[3]
    data_pressure = lastdata[1]
    data_temperature = lastdata[2]

    update_data_values()

    chart = new Highcharts.stockChart(options);
    console.log('Loaded all new data!')

    setTimeout(function() {
      $('#loading').fadeOut(500, function() {
                  $('#loading').remove();
      });
    }, 1000);

};

function fetch_and_load() {

  $.getJSON("https://willemvanopstal.pythonanywhere.com/neerslag", function (data) {
    console.log('Precipitation fetched from KNMI');
    precipitation = [];
    $.each(data, function(key, value) {
        precipitation.push([value[0], value[1]]);
    });
    options.series[3].data = precipitation;
    console.log('Precipitation added to plot')

     $.getJSON('https://willemvanopstal.pythonanywhere.com/waterlevels', function(json) {
         console.log('Fetched data from back-end')
         load_data(json)
     });
  });


}


// Highcharts options
var options = {

    credits: {
      enabled: false
    },
    chart: {
        renderTo: 'graph',
        backgroundColor: '#fff6f0',
        marginLeft: 22,
        marginRight: 22,
        marginTop: 25,
        marginBottom: 45,
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
        selected: 2,
        inputEnabled: true,
        inputDateFormat: '%d %B',
    },

    xAxis: { type: "datetime", ordinal: false},

    yAxis: [{
        labels: {
            align: 'right',
            x: -3
        },
        // title: {
        // 	 text: 'Waterstand'
        // },
        height: '54%',
        lineWidth: 2,
        resize: {
            enabled: true
        },
        opposite: true,
        offset: 0,
        plotLines: [{
            value: low_water_limit,
            color: 'grey',
            zIndex: 20,
            dashStyle: 'shortdash',
            width: 1,
            label: {
                text: 'Laag water',
                style: {
                    fontSize: 12
                }
            }
        }, {
            value: high_water_limit,
            color: 'grey',
            zIndex: 20,
            dashStyle: 'shortdash',
            width: 1,
            label: {
                text: 'Hoog water',
                style: {
                    fontSize: 12
                }
            }
        }]
    }, {
        labels: {
            align: 'right',
            x: -3
        },
        // title: {
        // 	 text: 'Druk'
        // },
        top: '59%',
        height: '18%',
        offset: 0,
        lineWidth: 2
    }, {
        labels: {
            align: 'left',
            x: 3
        },
        gridLineWidth: 0,
        // title: {
        // 	 text: 'Temperatuur'
        // },
        top: '59%',
        height: '18%',
        offset: 0,
        lineWidth: 2,
        opposite: false
    }, {
        labels: {
            align: 'right',
            x: -3
        },
        // title: {
        // 	 text: 'Neerslag'
        // },
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
        color: '#85aab2',
        tooltip: {
            valueDecimals: 2
        },
        // fillColor: '#85aab2',
        fillColor: {
            linearGradient: {
                x1: 0,
                y1: 0,
                x2: 0,
                y2: 1
            },
            stops: [
                [0, '#85aab2'],
                [1, Highcharts.color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
            ]
        }
    }, {
        type: 'spline',
        name: 'Druk',
        data: null,
        yAxis: 1,
        lineWidth: 1
    }, {
        type: 'spline',
        name: 'Temperatuur',
        data: null,
        yAxis: 2,
        lineWidth: 1
    }, {
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
        },
        areaspline: {
            lineWidth: 2
        }
    },
}

$(document).ready(function() {
    $('.update').addClass('loading');
    console.log("Loading data for the first time..");
    fetch_and_load()
});
