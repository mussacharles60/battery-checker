const batteryLevel = require('battery-level');
const isCharging = require('is-charging');
const notifier = require('node-notifier');
// const player = require('play-sound')((opts = {}));
const path = require('path');
const say = require('say');

const appID = 'Myssa - Battery Checker';
const icon = path.join(__dirname, './logo-round-192.png');

let interval = 60;
let timer = null;

const speak = async (text) => {
  return new Promise((resolve, reject) => {
    say.speak(text, undefined, undefined, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};

const checkBattery = async () => {
  try {
    const level = await batteryLevel();
    const charging = await isCharging();
    const batteryPercentage = Math.round(level * 100);

    console.log(`[battery-checker]: Battery level: ${batteryPercentage}%`);
    console.log(`[battery-checker]: Charging: ${charging}`);

    if (charging && batteryPercentage >= 100) {
      interval = 10;
      startTimer();

      notifier.notify({
        title: 'Battery Full',
        message: 'Your battery is fully charged. Please unplug the adapter.',
        sound: true,
        appID,
        icon,
      });

      // // Play a sound
      // player.play('path/to/your/soundfile.mp3', function(err) {
      //     if (err) throw err;
      // });
      try {
        await speak(
          'Your battery is fully charged. Please unplug the adapter.'
        );
      } catch (error) {
        console.error('[battery-checker]: speak: catch: error:', error);
      }
    } else if (!charging && batteryPercentage <= 20) {
      interval = 10;
      startTimer();

      notifier.notify({
        title: 'Battery Low',
        message: 'Your battery is below 20%. Please plug in the adapter.',
        sound: true,
        appID,
        icon,
      });

      try {
        await speak('Your battery is below 20%. Please plug in the adapter.');
      } catch (error) {
        console.error('[battery-checker]: speak: catch: error:', error);
      }
    } else {
      interval = 60;
      startTimer();
    }
  } catch (error) {
    console.error('[battery-checker]: error:', error);
  }
};

const startTimer = () => {
  clearTimer();
  // Run the check every given interval value
  timer = setInterval(checkBattery, 1000 * interval);
};

const clearTimer = () => {
  if (timer !== null) {
    clearInterval(timer);
    timer = null;
  }
};

// Run the check immediately on start
checkBattery();
startTimer();
