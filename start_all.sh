#!/bin/bash
echo "=========================================="
echo "  StegoVault — Starting All Services"
echo "=========================================="

echo "[1/4] Starting Python Federated Node Simulation..."
python main_simulate.py &
sleep 3

echo "[2/4] Starting Flask REST API..."
python main_api.py &
sleep 2

echo "[3/4] Starting Java Metrics Server..."
cd java/metrics && javac MetricsServer.java && java MetricsServer &
cd ../..
sleep 1

echo "[4/4] Starting React Frontend..."
cd frontend && npm start &

echo ""
echo "=========================================="
echo "  All services running:"
echo "  Frontend: http://localhost:3000"
echo "  API:      http://localhost:5001"
echo "  Metrics:  http://localhost:9090"
echo "=========================================="
wait
