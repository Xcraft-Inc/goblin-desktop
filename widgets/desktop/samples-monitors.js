/******************************************************************************/

const channelsSamples = {};
const channelsMockRanks = {};

/******************************************************************************/

function openChannel(channel, sampleCount) {
  const samples = [];
  for (let i = 0; i < sampleCount; i++) {
    samples.push(0);
  }
  channelsSamples[channel] = samples;
  channelsMockRanks[channel] = 0;
}

function closeChannel(channel) {
  // TODO
}

const period = 1000; // 1s

function pushSample(channel, value) {
  const samples = channelsSamples[channel];
  samples.shift();
  samples.push(value);
}

function pushSampleMock(channel) {
  const rank = channelsMockRanks[channel];

  const limit = channel === 'hydrate' ? 30 : 70;
  const offset = channel === 'hydrate' ? 2 : 10;
  const factor = channel === 'hydrate' ? 0.05 : 0;
  if (rank % (limit * 2) < limit) {
    pushSample(channel, Math.random() + offset);
  } else {
    pushSample(channel, Math.random() * factor);
  }

  channelsMockRanks[channel] = rank + 1;
}

function getSamples(channel) {
  return channelsSamples[channel];
}

/******************************************************************************/

module.exports = {
  openChannel,
  closeChannel,
  period,
  pushSample,
  pushSampleMock,
  getSamples,
};
