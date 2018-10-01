var path = 'boundaries/cities/'
var clusters = {};
var margin = {
  'left': 50,
  'right': 50,
  'top': 20,
  'bottom': 150
}
var width = window.innerWidth - 20;
var height = window.innerHeight - margin.bottom - 20;
var sliderH = margin.bottom;
var state_full = {
  'AL': 'Alabama',
  'AK': 'Alaska',
  'AS': 'American Samoa',
  'AZ': 'Arizona',
  'AR': 'Arkansas',
  'CA': 'California',
  'CO': 'Colorado',
  'CT': 'Connecticut',
  'DE': 'Delaware',
  'DC': 'District Of Columbia',
  'FM': 'Federated States Of Micronesia',
  'FL': 'Florida',
  'GA': 'Georgia',
  'GU': 'Guam',
  'HI': 'Hawaii',
  'ID': 'Idaho',
  'IL': 'Illinois',
  'IN': 'Indiana',
  'IA': 'Iowa',
  'KS': 'Kansas',
  'KY': 'Kentucky',
  'LA': 'Louisiana',
  'ME': 'Maine',
  'MH': 'Marshall Islands',
  'MD': 'Maryland',
  'MA': 'Massachusetts',
  'MI': 'Michigan',
  'MN': 'Minnesota',
  'MS': 'Mississippi',
  'MO': 'Missouri',
  'MT': 'Montana',
  'NE': 'Nebraska',
  'NV': 'Nevada',
  'NH': 'New Hampshire',
  'NJ': 'New Jersey',
  'NM': 'New Mexico',
  'NY': 'New York',
  'NC': 'North Carolina',
  'ND': 'North Dakota',
  'MP': 'Northern Mariana Islands',
  'OH': 'Ohio',
  'OK': 'Oklahoma',
  'OR': 'Oregon',
  'PW': 'Palau',
  'PA': 'Pennsylvania',
  'PR': 'Puerto Rico',
  'RI': 'Rhode Island',
  'SC': 'South Carolina',
  'SD': 'South Dakota',
  'TN': 'Tennessee',
  'TX': 'Texas',
  'UT': 'Utah',
  'VT': 'Vermont',
  'VI': 'Virgin Islands',
  'VA': 'Virginia',
  'WA': 'Washington',
  'WV': 'West Virginia',
  'WI': 'Wisconsin',
  'WY': 'Wyoming'
}

var x = d3.scaleLinear()
  .domain([1, 9])
  .range([200, 400])
  .clamp(true);

function createCanvas() {
  var svg = d3.select('#map').append('svg')
    .attr('id', 'vizsvg')
    .attr('width', width)
    .attr('height', height + sliderH)
    .style('background-color', '#eee');

  svg.append('rect')
    .attr('class', 'title')
    .attr('x', width / 2 - 180)
    .attr('y', 20)
    .attr('width', 360)
    .attr('height', 40)
    .style('opacity', 0.9)
    .style('fill', '#80CBC4')

  svg.append('text')
    .attr('class', 'title')
    .attr('x', width / 2)
    .attr('y', 48)
    .style('text-anchor', 'middle')
    .text('Neighborhood Niceness Analysis');

  createMap();
  createSlider();
}

function createMap() {
  d3.selectAll('path').remove();

  var svg = d3.select('#vizsvg');

  var center = []

  var projection = d3.geoAlbersUsa()
    .translate([width / 2, height / 2])
    .scale([1000]);

  var path = d3.geoPath()
    .projection(projection);

  var g = svg.insert('g', '.title')
    .attr('id', 'mapg')
    .attr('transform', 'translate(0,' + margin.top + ')')
    .style('stroke-width', 0.3);

  var div = d3.select('body').append('div')
    .attr('id', 'tooltip')
    .attr('class', 'tooltip')
    .style('max-width', function() {
      return (d3.select('rect.title').attr('x') - 100) + 'px';
    })
    .style('opacity', 0);

  var clickedState = d3.select(null);

  d3.json('boundaries/us-states.json', function(data) {
    var features = data.features;

    var country = g.selectAll('path')
      .data(features)
      .enter().append('path')
      .attr('class', 'state')
      .attr('d', path)
      .style('opacity', 0)
      .style('cursor', function(d) {
        if (d.properties.name != 'Wyoming') return 'pointer';
        else return 'not-allowed';
      })
      .on('click', clicked);

    country.transition()
      .duration(750)
      .style('opacity', 1)
  })

  function clicked(d) {
    // No neighborhood boundaries for Wyoming
    if (d.properties.state != 'WY') {
      d3.select('#reset').remove();
      d3.selectAll('.neighborhood').remove();
      var tooltip = d3.select('#tooltip');
      tooltip.transition()
        .duration(200)
        .style('opacity', 0.9);
      var text = '<b>Selected state</b>: ' + d.properties.name + '<br><b>Selected city</b>: ';
      tooltip.html(text + '---');


      var reset = svg.append('g')
        .attr('id', 'reset')
        .attr('transform', 'translate(' + (width - margin.right - 50) + ', 20)')

      reset.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', 80)
        .attr('height', 30)
        .attr('class', 'button');

      reset.append('text')
        .attr('x', 40)
        .attr('y', 20)
        .style('text-anchor', 'middle')
        .style('stroke', 'black')
        .text('Reset');

      reset.on('mouseover', function(d) {
        d3.select(this)
          .style('cursor', 'pointer')
          .style('opacity', 0.8);
      })

      reset.on('mouseout', function(d) {
        d3.select(this).style('opacity', 1);
      })

      reset.on('click', function(d) {
        resetMap();
      })

      if (clickedState.node() == this) {
        return resetMap();
      }

      clickedState.classed('active', false);
      clickedState = d3.select(this).classed('active', true);
      var bounds = path.bounds(d),
        dx = bounds[1][0] - bounds[0][0],
        dy = bounds[1][1] - bounds[0][1],
        x = (bounds[0][0] + bounds[1][0]) / 2,
        y = (bounds[0][1] + bounds[1][1]) / 2,
        scale = .9 / Math.max(dx / width, dy / height),
        translate = [width / 2 - scale * x, height / 2 - scale * y];
      g.transition()
        .duration(750)
        .style('stroke-width', 0.3 / scale)
        .attr('transform', 'translate(' + translate + ')scale(' + scale + ')')
        .on('end', function() {
          d3.json('boundaries/simplified_states/Simplified-' + d.properties.state + '.json', function(data) {
            var features = data.features;

            g.append('g')
              .selectAll('path')
              .data(features)
              .enter().append('path')
              .attr('class', 'neighborhood')
              .attr('d', path)
              .on('mouseover', function(e) {
                var cty = e.properties.City;
                tooltip.html(text + cty);
                d3.selectAll('.neighborhood')
                  .filter(function(f) {
                    return f.properties.City == e.properties.City;
                  })
                  .style('fill', '#00695C');
              })
              .on('mouseout', function(e) {
                tooltip.html(text + '---');
                d3.selectAll('.neighborhood')
                  .filter(function(f) {
                    return f.properties.City == e.properties.City
                  })
                  .style('fill', '#1DE9B6');
              })
              .on('click', function(e) {
                var cty = e.properties.City;
                var state = e.properties.State;
                var state_abbv = e.properties.State_abbv;
                tooltip.html(text + cty);
                d3.select('#mapg')
                  .transition()
                  .duration(750)
                  .style('opacity', 0)
                  .on('end', function() {
                    d3.select('#mapg').remove();
                    loadClusters(state, cty, state_abbv);
                  })
              });
          })
        });
    }


  }

  function resetMap() {
    clickedState.classed('active', false);
    var tooltip = d3.select('#tooltip');
    tooltip.transition()
      .duration(200)
      .style('opacity', 0);

    var reset = d3.select('#reset');
    reset.transition()
      .duration(750)
      .style('opacity', 0)
      .on('end', function() {
        reset.remove();
      })
    if (clickedState.node() == this) {
      return reset();
    }
    clickedState = d3.select(null);
    d3.selectAll('.neighborhood').remove();
    g.transition()
      .duration(750)
      .style('stroke-width', 0.3)
      .attr('transform', '');
  }

}

function createCity(state, city, st, clusters) {
  d3.selectAll('path').remove();
  d3.select('#reset').remove();
  var svg = d3.select('#vizsvg');

  var tooltip = d3.select('#tooltip');
  var text = '<b>Selected state</b>: ' + state + '<br><b>Selected city</b>: ' + city + '<br><b>Selected neighborhood</b>: ';
  tooltip.html(text + '---')

  var g = svg.insert('g', '.title')
    .attr('id', 'cityg')
    .style('stroke-width', 0.3);

  d3.json('boundaries/cities/' + st + '_' + city + '.json', function(data) {
    var features = data.features;
    var coords = [];
    var maxc = [];
    var minc = [];
    for (var i = 0; i < features.length; i++) {
      if (features[i].geometry.type == 'Polygon') {
        var array = features[i].geometry.coordinates[0];
        coords.push([d3.mean(array, function(d) {
          return d[0];
        }), d3.mean(array, function(d) {
          return d[1];
        })])
        maxc.push([d3.max(array, function(d) {
          return d[0];
        }), d3.max(array, function(d) {
          return d[1];
        })])
        minc.push([d3.min(array, function(d) {
          return d[0];
        }), d3.min(array, function(d) {
          return d[1];
        })])
      } else {
        var array = features[i].geometry.coordinates[0][0];
        for (var j = 0; j < array.length; j++) {
          coords.push([d3.mean(array[j], function(d) {
            return d[0];
          }), d3.mean(array[j], function(d) {
            return d[1];
          })])
          maxc.push([d3.max(array[j], function(d) {
            return d[0];
          }), d3.max(array[j], function(d) {
            return d[1];
          })])
          minc.push([d3.min(array[j], function(d) {
            return d[0];
          }), d3.min(array[j], function(d) {
            return d[1];
          })])
        }
      }
    }

    var center = [d3.mean(coords, function(d) {
      return d[0];
    }), d3.mean(coords, function(d) {
      return d[1];
    })]

    var dx = d3.max(maxc, function(d) {
      return d[0];
    }) - d3.min(minc, function(d) {
      return d[0];
    })
    var dy = d3.max(maxc, function(d) {
      return d[1]
    }) - d3.min(minc, function(d) {
      return d[1];
    })
    var scale = .8 / Math.max(dx / width, dy / height);
    var projection = d3.geoMercator()
      .translate([width / 2, height / 2])
      .center([center[0], center[1]])
      .scale([scale * 40]);

    var path = d3.geoPath()
      .projection(projection);

    var city = g.selectAll('path')
      .data(features)
      .enter().append('path')
      .attr('class', 'neighborhood2')
      .attr('d', path)
      .style('opacity', 0)
      .style('fill', function(d) {
        var key = d.properties.State + '_' + d.properties.Name;
        if (clusters[key]) return clusters[key].color;
        else return '#bbb';
      })
      .on('mouseover', function(d) {
        d3.select(this).style('fill-opacity', 0.7);
        var key = d.properties.State + '_' + d.properties.Name;
        var info = '';
        if (clusters[key]) {
          var zp = Math.round(clusters[key].mean_z * 10000) / 100;
          var yp = Math.round(clusters[key].mean_y * 10000) / 100;
          var wp = Math.round(clusters[key].mean_w * 10000) / 100;
          zp = zp > 0 ? zp : 0;
          yp = yp > 0 ? yp : 0;
          wp = wp > 0 ? wp : 0;
          var total = Math.round(zp + yp + wp) * 100 / 100;
          info += '<br><b>Match percentage</b>: ' + total + '%<br><b>House prices contribution</b>: ' + zp + '%<br><b>Food ratings contribution</b>: ' + yp + '%<br><b>Walkability contribution</b>: ' + wp + '%';
        }
        tooltip.html(text + d.properties.Name + info);
      })
      .on('mouseout', function(d) {
        d3.select(this).style('fill-opacity', 1);
        tooltip.html(text + '---');
      });

    city.transition()
      .duration(750)
      .style('opacity', 1)
  })
  var reset = svg.append('g')
    .attr('id', 'reset')
    .attr('transform', 'translate(' + (width - margin.right - 50) + ', 20)')

  reset.append('rect')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', 80)
    .attr('height', 30)
    .attr('class', 'button');

  reset.append('text')
    .attr('x', 40)
    .attr('y', 20)
    .style('text-anchor', 'middle')
    .style('stroke', 'black')
    .text('Reset');

  reset.on('mouseover', function(d) {
    d3.select(this)
      .style('cursor', 'pointer')
      .style('opacity', 0.8);
  })

  reset.on('mouseout', function(d) {
    d3.select(this).style('opacity', 1);
  })

  reset.on('click', function(d) {
    d3.select('#cityg')
      .transition()
      .duration(750)
      .style('opacity', 0)
      .on('end', function() {
        d3.select('#reset').remove();
        d3.select('#cityg').remove();
        d3.select('g.slider').remove();
        d3.select('g.legend').remove();
        createMap(city);
        createSlider();
      })
    d3.select('#tooltip')
      .transition()
      .duration(750)
      .style('opacity', 0);

    d3.select('#reset')
      .transition()
      .duration(750)
      .style('opacity', 0);

    d3.select('g.slider')
      .transition()
      .duration(750)
      .style('opacity', 0);
    d3.select('g.legend')
      .transition()
      .duration(750)
      .style('opacity', 0);
  })

  var ids = {};
  for (var cl in clusters) {
    if (clusters.hasOwnProperty(cl)) {
      var id = clusters[cl].id
      ids[id] = {}
      ids[id].color = clusters[cl].color;
      ids[id].rank = d3.rgb(clusters[cl].color).g;
    }
  }
  var keys = Object.keys(ids).sort(function(a, b) {
    return ids[a].rank - ids[b].rank;
  });

  var legend = svg.append('g')
    .attr('class', 'legend')
    .style('opacity', 0)
    .attr('transform', 'translate(' + (width - 80) + ', ' + (height / 2 - 40) + ')');

  legend.selectAll('rect')
    .data(keys)
    .enter()
    .append('rect')
    .attr('class', 'legend')
    .attr('x', 0)
    .attr('y', function(d, i) {
      return 30 * i;
    })
    .attr('width', 60)
    .attr('height', 30)
    .style('fill', function(d) {
      return ids[d].color;
    });

  legend.selectAll('text')
    .data(keys)
    .enter()
    .append('text')
    .attr('x', -5)
    .attr('y', function(d, i) {
      return 30 * i + 22;
    })
    .style('text-anchor', 'end')
    .text(function(d, i) {
      if (i == 0) return 'Most Relevant';
      else if (i == 4) return 'Relevant';
      else if (i == 8) return 'Least Relevant';
    });

  legend.transition()
    .duration(750)
    .style('opacity', 1);
}

function createSlider() {

  // Slider
  var svg = d3.select('#vizsvg');


  var slider = svg.append('g')
    .attr('class', 'slider')
    .attr('transform', 'translate(' + margin.left + ', ' + height + ')')
    .style('opacity', 0)
    .selectAll('.handle')
    .data(['zillow', 'yelp', 'walk'])
    .enter();

  slider.append('text')
    .attr('x', 200)
    .attr('y', -25)
    .text('Preference Sliders');

  var text = slider.append('text')
    .attr('x', x(5))
    .attr('y', sliderH - 10)
    .style('font-size', '12px')
    .style('text-anchor', 'middle')
    .text(function(d, i) {
      if (i == 0) return '1 = I don\'t care, 5 = Neutral, 9 = I need this';
    });

  var step = 2;

  slider.append('line')
    .attr('class', 'track')
    .attr('x1', x.range()[0])
    .attr('x2', x.range()[1])
    .attr('y1', function(d, i) {
      return i * 50;
    })
    .attr('y2', function(d, i) {
      return i * 50;
    })
    .select(function() {
      return this.parentNode.appendChild(this.cloneNode(true));
    })
    .attr('class', 'track-inset')
    .select(function() {
      return this.parentNode.appendChild(this.cloneNode(true));
    })
    .attr('class', 'track-overlay')
    .call(d3.drag()
      .on('start.interrupt', function() {
        slider.interrupt();
      })
      .on('start drag', function(d) {
        dragEvent(d3.event.x, d);
      })
    );

  slider.insert('g', '.track-overlay')
    .attr('class', 'ticks')
    .attr('transform', function(d, i) {
      return 'translate(0,' + (22 + i * 50) + ')'
    })
    .selectAll('text')
    .data([1, 5, 9])
    .enter().append('text')
    .attr('x', x)
    .attr('text-anchor', 'middle')
    .text(function(d) {
      return d;
    });

  slider.append('text')
    .attr('x', 180)
    .attr('y', function(d, i) {
      return 6 + i * 50;
    })
    .style('text-anchor', 'end')
    .text(function(d) {
      if (d == 'zillow') return 'House Prices: '
      else if (d == 'yelp') return 'Food Ratings: '
      else return 'Walkability: '
    })

  var handle = slider.insert('circle', '.track-overlay')
    .attr('class', 'handle')
    .attr('id', function(d) {
      return 'c' + d;
    })
    .attr('r', 9)
    .attr('cx', x(5))
    .attr('cy', function(d, i) {
      return i * 50;
    });

  d3.select('g.slider').transition()
    .duration(750)
    .style('opacity', 1);

  function dragEvent(val, name) {
    var rounded = x.invert(val);
    var xval = 0;
    if (rounded < 4) {
      xval = 1;
    } else if (rounded < 7) {
      xval = 5;
    } else {
      xval = 9;
    }
    var c = d3.selectAll('.handle').filter(function(e) {
      if (name == 'default') return e;
      else return e == name;
    });
    var prev = x.invert(c.attr('cx'));
    c.attr('cx', x(xval));
    if (xval != prev) {
      if (!d3.select('#cityg').empty()) {
        loadClusters();
      }
    }
  }
}

function loadClusters(state, city, state_abbv) {
  var ts = d3.selectAll('.handle');
  var coeffs = []
  ts.each(function(d, i) {
    coeffs.push(x.invert(d3.select(this).attr('cx')));
  })
  var focusCity = !d3.select('#cityg').empty();

  if (coeffs[0] == 1)
    coeffs[0] = 9;
  else if (coeffs[0] == 9)
    coeffs[0] = 1;

  var path = 'clusters/' + coeffs[0] + coeffs[1] + coeffs[2] + 'FinalAll.csv';

  var lr = [0.2, 0.8];

  var r = d3.scaleLinear()
    .range([255, 0]); // yelp
  var g = d3.scaleLinear()
    .range([255, 0]); // walk
  var b = d3.scaleLinear()
    .range([255, 0]); // zillow
  var l = d3.scaleOrdinal();
  var a = d3.scaleLinear()
    .range([0.7, 1])

  var g = d3.scaleOrdinal()
    .range(['#004D40', '#00695C', '#00796B', '#00897B', '#009688', '#26A69A', '#4DB6AC', '#80CBC4', '#B2DFDB']);

  d3.csv(path, function(data) {
    var arr = {};
    var cls = {};
    var ids = [];
    data.forEach(function(d) {
      var cid = +d.d_clust$classification;
      if (cls[cid]) {
        cls[cid].zillow.push(+d.X6);
        cls[cid].walk.push(+d.X7);
        cls[cid].yelp.push(+d.X8);
      } else {
        ids.push(cid);
        cls[cid] = {};
        cls[cid].zillow = [+d.X6];
        cls[cid].walk = [+d.X7];
        cls[cid].yelp = [+d.X8];
      }
    })
    var means = [];
    ids.forEach(function(d) {
      var obj = {}
      obj.mean_z = d3.mean(cls[d].zillow);
      obj.mean_y = d3.mean(cls[d].yelp);
      obj.mean_w = d3.mean(cls[d].walk);
      obj.score = obj.mean_z + obj.mean_y + obj.mean_w;
      cls[d].mean_z = d3.mean(cls[d].zillow);
      cls[d].mean_y = d3.mean(cls[d].yelp);
      cls[d].mean_w = d3.mean(cls[d].walk);
      cls[d].score = obj.mean_z + obj.mean_y + obj.mean_w;
      obj.id = d;
      means.push(obj);
    })
    means.sort(function(a, b) {
      return b.score - a.score;
    })
    var ranked = []
    means.forEach(function(d) {
      ranked.push(d.id);
    })
    g.domain(ranked);

    var n = ranked.length;
    var inc = (lr[1] - lr[0]) / n;
    var lrange = [];
    for (var i = 0; i < n; i++) {
      lrange.push(lr[0] + i * inc);
    }
    l.range(lrange);

    ids.forEach(function(d) {
      var color = g(d);
      cls[d].color = color;
    })

    data.forEach(function(d) {
      var id = +d.d_clust$classification;
      arr[d.X1 + '_' + d.X2] = {
        'id': id,
        'color': cls[id].color,
        'mean_z': +d.X6,
        'mean_w': +d.X7,
        'mean_y': +d.X8,
      };
    })

    if (focusCity) {
      if (!d3.select('#cityg').empty()) {
        d3.selectAll('.neighborhood2')
          .on('mouseover', function(d) {
            d3.select(this).style('fill-opacity', 0.7);
            var key = d.properties.State + '_' + d.properties.Name;
            var info = '---';
            var tooltip = d3.select('#tooltip');
            var text = '<b>Selected state</b>: ' + state_full[d.properties.State] + '<br><b>Selected city</b>: ' + d.properties.City + '<br><b>Selected neighborhood</b>: ';
            if (arr[key]) {

              var zp = Math.round(arr[key].mean_z * 10000) / 100;
              var yp = Math.round(arr[key].mean_y * 10000) / 100;
              var wp = Math.round(arr[key].mean_w * 10000) / 100;
              zp = zp > 0 ? zp : 0;
              yp = yp > 0 ? yp : 0;
              wp = wp > 0 ? wp : 0;
              var total = Math.round(zp + yp + wp) * 100 / 100;
              info = '<br><b>Match percentage</b>: ' + total + '%<br><b>House prices contribution</b>: ' + zp + '%<br><b>Food ratings contribution</b>: ' + yp + '%<br><b>Walkability contribution</b>: ' + wp + '%';
            }

            tooltip.html(text + d.properties.Name + info);
          })
        d3.selectAll('.neighborhood2')
          .transition()
          .duration(750)
          .style('fill', function(d) {
            var key = d.properties.State + '_' + d.properties.Name;
            if (arr[key]) return arr[key].color;
            else return '#bbb';
          })
        d3.selectAll('rect.legend')
          .transition()
          .duration(750)
          .style('fill', function(d, i) {
            return cls[ranked[i]].color;
          })
      }
    } else {
      createCity(state, city, state_abbv, arr);
    }

  })
}
createCanvas()