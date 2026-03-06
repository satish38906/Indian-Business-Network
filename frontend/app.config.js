export default {
  expo: {
    ...require('./app.json').expo,
    android: {
      ...require('./app.json').expo.android,
      usesCleartextTraffic: true,
    },
  },
};
