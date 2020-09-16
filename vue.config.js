module.exports = {
  publicPath: (process.env.NODE_ENV === 'production'
               ? '/sqid-ng/'
               : '/'),
  pluginOptions: {
    i18n: {
      locale: 'en',
      fallbackLocale: 'en',
      localeDir: 'locales',
      enableInSFC: false
    }
  }
}
