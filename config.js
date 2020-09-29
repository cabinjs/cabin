docute.init({
  debug: true,
  routerMode: 'history',
  title: 'Cabin',
  repo: 'cabinjs/cabin',
  'edit-link': 'https://github.com/cabinjs/cabin/tree/master/',
  twitter: 'niftylettuce',
  nav: {
    default: [
      {
        title: 'The best JavaScript and Node.js logging service and logging npm package',
        path: '/'
      }
    ]
  },
  plugins: [
    docuteEmojify()
  ]
});
