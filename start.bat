@echo off
:start
node src/index.js
echo Le bot s'est arrete! Redemarrage dans 5 secondes...
timeout /t 5
goto start
