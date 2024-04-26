// The Heatmap component
import React, { useEffect, useState, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import { MatrixController, MatrixElement } from 'chartjs-chart-matrix';
import Papa from 'papaparse';

import xstrk_zone from './xstrk_by_zone.csv';
import './heatmap.css';

Chart.register(...registerables, MatrixController, MatrixElement);

function Heatmap() {
  const canvasRef = useRef(null);
  const chartInstanceRef = useRef(null);

  const [players, setPlayers] = useState([]); // Store the list of players
  const [selectedPlayer, setSelectedPlayer] = useState('Bryce Harper'); // Selected player
  const [csvData, setCsvData] = useState([]); // Store the CSV data
  const [filteredData, setFilteredData] = useState([]); // Store heatmap data

  // Initial data fetch and setting unique players
  useEffect(() => {
    Papa.parse(xstrk_zone, {
      download: true,
      header: true,
      complete: (results) => {
        const data = results.data;
        setCsvData(data);

        const uniquePlayers = Array.from(new Set(data.map((row) => row.MLBNAME))).sort();
        setPlayers(uniquePlayers); // Set the list of unique players
      },
    });
  }, []);

  // Update filtered data when the selected player changes
  useEffect(() => {
    if (csvData.length > 0) {
      updateFilteredData(csvData, selectedPlayer);
    }
  }, [csvData, selectedPlayer]);

  const updateFilteredData = (csvData, playerName) => {
    const filtered = csvData.filter((row) => row.MLBNAME === playerName);

    const minRank = 1;
    const maxRank = 430;

    const heatmapData = filtered.map((row) => ({
      x: parseInt(row.zone_x),
      y: parseInt(row.zone_y),
      v: parseFloat(row.rank),
      xstrks: parseFloat(row.xstrks),
    }));

    setFilteredData({ data: heatmapData, min: minRank, max: maxRank });
  };

  // Update the heatmap when filteredData changes
  useEffect(() => {
    if (canvasRef.current && filteredData.data) {
      const { data, min, max } = filteredData;
      const ctx = canvasRef.current.getContext('2d');

      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy(); // Destroy existing chart before creating a new one
      }

      const interpolateColor = (value, min, max) => {
        const middle = (min + max) / 2;
        let ratio;

        if (value <= middle) {
          ratio = (value - min) / (middle - min);
          const red = 255;
          const green = Math.round(255 * ratio);
          const blue = Math.round(255 * ratio);
          return `rgb(${red}, ${green}, ${blue})`; // Red to white
        } else {
          ratio = (value - middle) / (max - middle);
          const red = Math.round(255 * (1 - ratio));
          const green = Math.round(255 * (1 - ratio));
          const blue = 255;
          return `rgb(${red}, ${green}, ${blue})`; // White to blue
        }
      };

      const heatmap = new Chart(ctx, {
        type: 'matrix',
        data: {
          datasets: [
            {
              data,
              backgroundColor: (context) => {
                const value = context.raw.v;
                return interpolateColor(value, min, max); // Determine color based on the value
              },
              width: 110,
              height: 160,
            },
          ],
        },
        options: {
          scales: {
            x: {
              type: 'linear',
              min: -3,
              max: 7,
              display: false, // Hide the x-axis
            },
            y: {
              type: 'linear',
              min: 0,
              max: 4,
              display: false, // Hide the y-axis
            },
          },
          plugins: {
            legend: {
              display: false, // Hide the legend
            },
            tooltip: {
              callbacks: {
                title: () => '', 
                label: (context) => {

                  const rank = context.raw.v;
                  const xstrks = context.raw.xstrks;
                  return `Rank: ${rank}, xStrikes: ${xstrks}`; // Tooltip with x and y values
                },
              },
            },
          },
        },
      });

      chartInstanceRef.current = heatmap;

      return () => {
        if (chartInstanceRef.current) {
          chartInstanceRef.current.destroy(); // Clean up to avoid memory leaks
        }
      };
    }
  }, [filteredData]); // Ensure the chart updates when filteredData changes

  return (
    <div className="container">
      <h1>Heatmap for {selectedPlayer}</h1>

      <p className="explanation">
      This tool helps you understand where batters (who've faced at least 500 called balls and strikes) are most likely to have expected strikes (xStrk). 
      It displays a heatmap of a batter's zone from the catcher's perspective.
      The heatmap shows how each batter ranks compared to all other batters, based on expected strikes in each zone, with rankings from 1 to 370. 
      A rank of 1, shown in solid red, indicates that the batter had very few expected strikes in that zone. 
      A rank of 370, shown in solid blue, indicates that the batter had a lot of expected strikes in that zone.
      </p>

      <div className="controls">
        <div className="control-group">
          <label>Select Player:</label>
          <select value={selectedPlayer} onChange={(e) => setSelectedPlayer(e.target.value)}>
            {players.map((player) => (
              <option key={player} value={player}>
                {player}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="canvas-container">
        <canvas className="fixed-size-canvas" ref={canvasRef}></canvas>
      </div>
    </div>
  );
}

export default Heatmap;
