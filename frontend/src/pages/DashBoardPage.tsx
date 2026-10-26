
.dashboard-page {
  padding: 24px;
}

.dashboard-description {
  color: #555;
  margin-bottom: 24px;
}

.dashboard-error {
  color: #a11d1d;
  font-weight: 500;
}

.metrics-card {
  max-width: 900px;
  padding: 24px;
  border: 1px solid #ddd;
  border-radius: 10px;
  background: #fff;
}

.metrics-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 24px;
}

.metrics-controls label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-weight: 600;
}

.metrics-controls select {
  min-width: 170px;
  padding: 8px;
  border: 1px solid #999;
  border-radius: 5px;
  background: #fff;
  color: #222;
}

.metric-bars {
  display: grid;
  gap: 14px;
  padding: 0;
  margin: 20px 0 0;
  list-style: none;
}

.metric-row {
  display: grid;
  grid-template-columns: 110px minmax(0, 1fr) 65px;
  align-items: center;
  gap: 12px;
}

.metric-week,
.metric-value {
  font-variant-numeric: tabular-nums;
}

.metric-track {
  height: 26px;
  overflow: hidden;
  background: #f1f1f1;
  border-radius: 5px;
}

.metric-fill {
  height: 100%;
  background: #fdb515;
  border-radius: 5px;
}

.metric-value {
  font-weight: 600;
  text-align: right;
}

@media (max-width: 480px) {
  .dashboard-page {
    padding: 16px;
  }

  .metrics-card {
    padding: 16px;
  }

  .metric-row {
    grid-template-columns: 82px minmax(0, 1fr) 45px;
    gap: 8px;
    font-size: 12px;
  }
}
