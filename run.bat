
:: Auto Restarter for the Bot if it crashes
:start
node --env-file=.env index.js
:: Logging should be added for random crashes
::goto start