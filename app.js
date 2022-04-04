const args = require('args-parser')(process.argv);
const prompts = require('prompts');
const { exec } = require("child_process");
const {PulseAudio} = require('pulseaudio.js')

const setOutput = async (name) => {
  return await exec(`pacmd set-default-sink ${name}`)
}

(async () => {
  
  const {out, input, list} = args

  const pa = new PulseAudio();
  await pa.connect();

  const outputDevices = await pa.getAllSinks()

  if (list) {
    console.log(outputDevices.map(out => out.properties.alsa.long_card_name))
  }

  let card = outputDevices.find(dev => dev.name === out || dev.properties.alsa.driver_name === out)
  if (!card) {
    const response = await prompts({
      type: 'select',
      name: 'newOutput',
      message: 'Select new output device',
      choices: outputDevices.map(out => {return {title: out.properties.alsa.long_card_name, value: out.name}}),
    });
    card = outputDevices.find(dev => dev.name === response.newOutput)
  }

  try {
    const { stdout, stderr } = await setOutput(card.name)
    console.log(`Output device changed to ${card.name}`)
  }
  catch(e) {
    console.log(`Error to change output device: ${e}`)
    process.exit(1)
  }
  process.exit(0)
})()

