const fs = require('fs');
const path = require('path');
const favicons = require('favicons');
const SOURCE_ICON = path.resolve(__dirname, '../favicon-source.png');
const OUTPUT_PATH = path.resolve(__dirname, '../public/');
const INDEX_HTML_TEMPLATE = path.resolve(__dirname, '../index.template.html');
const CONFIG = {
    path: "/",                                // Path for overriding default icons path. `string`
    appName: "Flowmap.blue",                            // Your application's name. `string`
    appShortName: "Flowmap.blue",                       // Your application's short_name. `string`. Optional. If not set, appName will be used
    appDescription: "Create geographic flow maps representing your data published in Google Sheets. Visualize numbers of movements between locations (origin-destination data). Explore the data interactively.",                     // Your application's description. `string`
    developerName: "Ilya Boyandin",                      // Your (or your developer's) name. `string`
    developerURL: "http://ilya.boyandin.me",                       // Your (or your developer's) URL. `string`
    dir: "auto",                              // Primary text direction for name, short_name, and description
    lang: "en-US",                            // Primary language for name and short_name
    background: "#fff",                       // Background colour for flattened icons. `string`
    theme_color: "#137CBD",                      // Theme color user for example in Android's task switcher. `string`
    appleStatusBarStyle: "black-translucent", // Style for Apple status bar: "black-translucent", "default", "black". `string`
    display: "standalone",                    // Preferred display mode: "fullscreen", "standalone", "minimal-ui" or "browser". `string`
    orientation: "any",                       // Default orientation: "any", "natural", "portrait" or "landscape". `string`
    scope: "/",                               // set of URLs that the browser considers within your app
    start_url: "/",              // Start URL when launching the application from a device. `string`
    version: "1.0",                           // Your application's version string. `string`
    logging: false,                           // Print logs to console? `boolean`
    pixel_art: false,                         // Keeps pixels "sharp" when scaling up, for pixel art.  Only supported in offline mode.
    loadManifestWithCredentials: false,       // Browsers don't send cookies when fetching a manifest, enable this to fix that. `boolean`
    icons: {
      // Platform Options:
      // - offset - offset in percentage
      // - background:
      //   * false - use default
      //   * true - force use default, e.g. set background for Android icons
      //   * color - set background for the specified icons
      //   * mask - apply mask in order to create circle icon (applied by default for firefox). `boolean`
      //   * overlayGlow - apply glow effect after mask has been applied (applied by default for firefox). `boolean`
      //   * overlayShadow - apply drop shadow after mask has been applied .`boolean`
      //
      android: true,              // Create Android homescreen icon. `boolean` or `{ offset, background, mask, overlayGlow, overlayShadow }`
      appleIcon: true,            // Create Apple touch icons. `boolean` or `{ offset, background, mask, overlayGlow, overlayShadow }`
      appleStartup: true,         // Create Apple startup images. `boolean` or `{ offset, background, mask, overlayGlow, overlayShadow }`
      favicons: true,             // Create regular favicons. `boolean` or `{ offset, background, mask, overlayGlow, overlayShadow }`
      firefox: false,              // Create Firefox OS icons. `boolean` or `{ offset, background, mask, overlayGlow, overlayShadow }`
      windows: false,              // Create Windows 8 tile icons. `boolean` or `{ offset, background, mask, overlayGlow, overlayShadow }`
      yandex: false,
      coast: false,
    }
  };

(async () => {
  const response = await favicons(SOURCE_ICON, CONFIG);
  for (const { name, contents } of response.images) {
    const stream = fs.createWriteStream(path.resolve(OUTPUT_PATH, name));
    await stream.write(contents);
    await stream.end()
  }
  for (const { name, contents } of response.files) {
    fs.writeFileSync(path.resolve(OUTPUT_PATH, name), contents);
  }
  const indexHtmlTemplate = fs.readFileSync(INDEX_HTML_TEMPLATE, 'utf8');
  fs.writeFileSync(path.resolve(OUTPUT_PATH, 'index.html'), indexHtmlTemplate.replace(
    '%FAVICON_HEADERS%',
    response.html.join('\n')
  ));
})();
