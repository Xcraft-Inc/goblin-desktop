/******************************************************************************/

const channelsData = {};

/******************************************************************************/

const period = 1000; // 1s

/******************************************************************************/

function openChannel(channel, sampleCount) {
  const samples = [];
  for (let i = 0; i < sampleCount; i++) {
    samples.push(0);
  }
  channelsData[channel] = {
    samples,
    rank: 0,
  };
}

function closeChannel(channel) {
  // TODO
}

function update(channel) {
  const data = channelsData[channel];
  const samples = data.samples;

  samples.shift();
  samples.push(samples[samples.length - 1]);
}

function pushSample(channel, sample) {
  const data = channelsData[channel];
  if (data) {
    const samples = data.samples;
    samples[samples.length - 1] = sample;
  }
}

function getSamples(channel) {
  if (channel) {
    const data = channelsData[channel];
    return Array.from(data.samples);
  } else {
    return 0;
  }
}

/******************************************************************************/

module.exports = {
  period,
  openChannel,
  closeChannel,
  update,
  pushSample,
  getSamples,
};
