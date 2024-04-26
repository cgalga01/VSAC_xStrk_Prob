import React, { useEffect, useState, useRef } from 'react';
import Papa from 'papaparse';
import { Chart as ChartJS, Title, Tooltip, Legend, LinearScale, ScatterController, PointElement, LineController, LineElement } from 'chart.js/auto';
import pitch_probs from './pitch_probs.csv';
import './graph.css';

ChartJS.register(Title, Tooltip, Legend, LinearScale, ScatterController, PointElement, LineController, LineElement);

const Graph = () => {
  const [pitchers, setPitchers] = useState([]);
  const [gameDates, setGameDates] = useState([]);
  const [batters, setBatters] = useState([]);
  const [selectedPitcher, setSelectedPitcher] = useState('Nola, Aaron');
  const [selectedGameDate, setSelectedGameDate] = useState(null);
  const [selectedBatter, setSelectedBatter] = useState(null);
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  

  const createChart = (ctx, filteredData) => {
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy(); // Ensure the old chart is destroyed
    }
  
    const scatterData = filteredData.map((item) => ({
      x: item.plate_x,
      y: item.plate_z,
      strike_prob: item.strike_prob,
      broadcast: item.broadcast,
      pointBackgroundColor: item.called_strike === 1 ? 'red' : 'green',
    }));
  
    const newChartInstance = new ChartJS(ctx, {
      type: 'scatter',
      data: {
        datasets: [
          {
            data: scatterData,
            label: `${selectedPitcher || 'All Pitchers'}${selectedGameDate ? ` - ${selectedGameDate}` : ''}${selectedBatter ? ` - ${selectedBatter}` : ''}`,
            pointRadius: 16,
            pointBackgroundColor: (context) => context.raw.pointBackgroundColor,
            order: 2, // Lower order to draw under lines
          },
          {
            label: 'Vertical Line 1',
            data: [
              { x: -0.7083, y: filteredData[0]['sz_bot_med'] },
              { x: -0.7083, y: filteredData[0]['sz_top_med'] },
            ],
            type: 'line',
            borderColor: 'black',
            borderWidth: 2,
            order: 1, // Higher order to draw on top of scatter points
          },
          {
            label: 'Vertical Line 2',
            data: [
              { x: 0.7083, y: filteredData[0]['sz_bot_med'] },
              { x: 0.7083, y: filteredData[0]['sz_top_med'] },
            ],
            type: 'line',
            borderColor: 'black',
            borderWidth: 2,
            order: 1, // Higher order to draw on top of scatter points
          },
          {
            label: 'Horizontal Line 1',
            data: [
              { x: -0.7083, y: filteredData[0]['sz_bot_med'] },
              { x: 0.7083, y: filteredData[0]['sz_bot_med'] },
            ],
            type: 'line',
            borderColor: 'black',
            borderWidth: 2,
            order: 1, // Higher order to draw on top of scatter points
          },
          {
            label: 'Horizontal Line 2',
            data: [
              { x: -0.7083, y: filteredData[0]['sz_top_med'] },
              { x: 0.7083, y: filteredData[0]['sz_top_med'] },
            ],
            type: 'line',
            borderColor: 'black',
            borderWidth: 2,
            order: 1, // Higher order to draw on top of scatter points
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: `Pitcher Data - ${selectedPitcher || 'All Pitchers'}${selectedGameDate ? ` - ${selectedGameDate}` : ''}${selectedBatter ? ` - ${selectedBatter}` : ''}`,
          },
          tooltip: {
            callbacks: {
              label: (context) => `Strike Probability: ${context.raw.strike_prob}`,
            },
          },
          legend: {
            display: false,
          },
        },
        scales: {
          x: {
            type: 'linear',
            min: -5.6,
            max: 5.6,
            display: false,
          },
          y: {
            type: 'linear',
            min: 0,
            max: 5.25,
            display: false,
          },
        },
        onClick: (event, elements) => {
          if (elements.length > 0) {
            const index = elements[0].index;
            const dataPoint = scatterData[index]; // Get the clicked data point
            if (dataPoint.broadcast) {
              window.open(dataPoint.broadcast, '_blank'); // Open the link in a new tab
            }
          }
        },
      },
    });
  
    chartInstanceRef.current = newChartInstance;
  };
  

  useEffect(() => {
    const ctx = chartRef.current.getContext('2d');

    const fetchData = () => {
      Papa.parse(pitch_probs, {
        download: true,
        header: true,
        dynamicTyping: true,
        complete: (result) => {
          if (result.errors.length > 0) {
            console.error('CSV parsing error:', result.errors);
            return;
          }

          const data = result.data;

          const uniquePitchers = Array.from(new Set(data.map((item) => item.pitcher_name))).sort();
          uniquePitchers.unshift('All Pitchers'); // Add 'All Pitchers' at the top
          setPitchers(uniquePitchers);

          const filteredByPitcher = selectedPitcher === 'All Pitchers' ? data : data.filter((item) => item.pitcher_name === selectedPitcher);
          const filteredByBatter = selectedBatter ? data.filter((item) => item.MLBNAME === selectedBatter) : data;
          const filteredByGameDate = selectedGameDate ? data.filter((item) => item.game_date === selectedGameDate) : data;

          // Determine available game dates based on the filtered data
          const gameDatesFromPitcherAndBatter = filteredByPitcher.filter(
            (item) => filteredByBatter.includes(item)
          ).map((item) => item.game_date);

          const uniqueGameDates = Array.from(new Set(gameDatesFromPitcherAndBatter)).sort();
          setGameDates(uniqueGameDates);

          const battersFromPitcherAndGameDate = filteredByPitcher.filter(
            (item) => filteredByGameDate.includes(item)
          ).map((item) => item.MLBNAME);

          const uniqueBatters = Array.from(new Set(battersFromPitcherAndGameDate)).sort();
          setBatters(uniqueBatters);

          // Determine filtered data for the chart based on all selected filters
          const filteredData = data.filter(
            (item) => 
              (selectedPitcher === 'All Pitchers' || item.pitcher_name === selectedPitcher) &&
              (!selectedGameDate || item.game_date === selectedGameDate) &&
              (!selectedBatter || item.MLBNAME === selectedBatter)
          );

          if (filteredData.length > 0) {
            createChart(ctx, filteredData);
          } else {
            console.error(
              `No data found for ${selectedPitcher || 'All Pitchers'}${selectedGameDate ? ` on ${selectedGameDate}` : ''}${selectedBatter ? ` against ${selectedBatter}` : ''}`
            );
          }
        },
        error: (error) => {
          console.error('CSV loading error:', error);
        },
      });
    };

    fetchData();
  }, [selectedPitcher, selectedGameDate, selectedBatter]); // Trigger fetch when any selected value changes

  return (
    <div class="container">
      <h1>Pitcher Data Visualization</h1>

      <p class= "explanation">
      This tool is used to view the expected strike probability of a pitch from the catcher's perspective. 
      Red indicates a called strike, while green indicates a called ball.
      You can use the dropdown menus to filter by any combination of pitcher, date, and batter. 
      If you hover over a pitch, you'll see its expected strike probability. 
      If you click on a pitch, it will open a link to a video of that pitch.
      </p>
      
      <div class="controls">
        <div class="control-group">
          <label for="pitcher-select">Pitcher:</label>
          <select id="pitcher-select" value={selectedPitcher} onChange={(e) => setSelectedPitcher(e.target.value)}>
            {pitchers.map((pitcher) => (
              <option key={pitcher} value={pitcher}>
                {pitcher}
              </option>
            ))}
          </select>
        </div>
        
        <div class="control-group">
          <label for="game-date-select">Game Date:</label>
          <select id="game-date-select" value={selectedGameDate} onChange={(e) => setSelectedGameDate(e.target.value)}>
            <option value="">All Dates</option>
            {gameDates.map((date) => (
              <option key={date} value={date}>
                {date}
              </option>
            ))}
          </select>
        </div>
        
        <div class="control-group">
          <label for="batter-select">Batter:</label>
          <select id="batter-select" value={selectedBatter} onChange={(e) => setSelectedBatter(e.target.value)}>
            <option value="">All Batters</option>
            {batters.map((batter) => (
              <option key={batter} value={batter}>
                {batter}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div class="canvas-container">
        <canvas class="fixed-size-canvas" ref={chartRef} id="scatter-chart"></canvas>
      </div>
    </div>
  );
};

export default Graph;