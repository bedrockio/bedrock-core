module.exports = (api) => {
  const DEV = !api.env('production');

  // This caches the Babel config
  api.cache.using(() => process.env.NODE_ENV);

  return {
    presets: [
      [
        '@babel/preset-react',
        {
          runtime: 'automatic',
        },
      ],
    ],
    plugins: [
      ['lodash'],
      ['@babel/plugin-transform-runtime'],
      ['@babel/plugin-proposal-decorators', { legacy: true }],
      ['@babel/plugin-proposal-class-properties'],
      [
        'module-resolver',
        {
          root: ['./src'],
        },
      ],
    ],
  };
  // return {
  //   presets: [
  //     ['@babel/preset-env'],
  //     [
  //       ...(DEV
  //         ? ['@babel/preset-react', { development: true, runtime: 'automatic' }]
  //         : ['@babel/preset-react']),
  //     ],
  //   ],
  //   plugins: [
  //     ['lodash'],
  //     ['@babel/plugin-transform-runtime'],
  //     ['@babel/plugin-proposal-decorators', { legacy: true }],
  //     ['@babel/plugin-proposal-class-properties'],
  //     ...(DEV ? [['react-refresh/babel']] : []),
  //   ],
  // };
};
