'use strict';

// const execa = require('execa');
const { exec } = require('node:child_process');
const linuxBattery = require('linux-battery');
const osxBattery = require('osx-battery');
const toDecimal = require('to-decimal');

const battery = {
  percent: 0,
  charging: false,
};

const linux = () =>
  linuxBattery().then((res) => {
    battery.percent = toDecimal(
      parseFloat(res[0].percentage.slice(0, res[0].percentage.length))
    );
    battery.charging = res[0].state === 'charging';

    return battery;
  });

const osx = () =>
  osxBattery().then((res) => {
    battery.percent = parseFloat(
      (res.currentCapacity / res.maxCapacity).toFixed(2)
    );
    battery.charging = res.externalConnected;

    return battery;
  });

const win = () => {
  return new Promise((resolve, reject) => {
    exec(
      'WMIC Path Win32_Battery Get EstimatedChargeRemaining, BatteryStatus',
      {
        detached: true,
        windowsHide: true,
      },
      (error, stdout) => {
        if (error || !stdout) {
          return reject(new Error('No battery could be found'));
        }
        // console.log(stdout);

        // return stdout.includes('2'); // charging
        // stdout = parseFloat(stdout.trim().split('\n')[1]);
        // return toDecimal(stdout > 100 ? 100 : stdout); // percent

        // Split the output into lines and remove empty lines
        const lines = stdout
          .split('\n')
          .map((line) => line.trim())
          .filter((line) => line);
        // console.log('lines: ', lines);

        // Get the second line, which contains the battery status and charge remaining
        const batteryInfo = lines[1].split(/\s+/); // Split by any amount of whitespace
        // console.log('batteryInfo: ', batteryInfo);

        const status = parseInt(batteryInfo[0], 10);
        const charge = parseFloat(batteryInfo[1], 10);

        battery.percent = toDecimal(charge > 100 ? 100 : charge);
        battery.charging = status === 2;

        return resolve(battery);
      }
    );
  });
};

let exported;
if (process.platform === 'darwin') {
  exported = osx;
} else if (process.platform === 'linux') {
  exported = linux;
} else {
  exported = win;
}

module.exports = exported;
