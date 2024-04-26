// PitcherSelect.js

import React from 'react';

export const getUniquePitchers = (data) => {
  const uniquePitchers = [...new Set(data.map(item => item.pitcher))];
  return uniquePitchers;
}

export const filterPitchesByPitcher = (data, selectedPitcher) => {
  return data.filter(item => item.pitcher === selectedPitcher);
}
