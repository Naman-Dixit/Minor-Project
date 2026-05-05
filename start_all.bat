@echo off
echo ==========================================
echo   StegoVault — Starting All Services
echo ==========================================

echo.
echo [1/4] Starting Python Federated Node Simulation...
start "FedRL Nodes" cmd /k "cd /d %~dp0 && python main_simulate.py"
timeout /t 3 /nobreak >nul

echo [2/4] Starting Flask REST API...
start "Flask API" cmd /k "cd /d %~dp0 && python main_api.py"
timeout /t 3 /nobreak >nul

echo [3/4] Starting Java Metrics Server...
start "Metrics Server" cmd /k "cd /d %~dp0\java\metrics && javac MetricsServer.java && java MetricsServer"
timeout /t 2 /nobreak >nul

echo [4/4] Starting React Frontend...
start "React UI" cmd /k "cd /d %~dp0\frontend && npm start"

echo.
echo ==========================================
echo   All services launching...
echo   Frontend: http://localhost:3000
echo   API:      http://localhost:5001
echo   Metrics:  http://localhost:9090
echo ==========================================
pause
