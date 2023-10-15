# Convert Slack to Markdown

This is a simple web app that converts Slack messages into clean HTML, markdown, or plain text.

## How to Use

1. Clone this repository to your local machine.
2. Open `index.html` in your web browser.
3. Paste your Slack message into the input box.
4. Click the button corresponding to the format you want to convert to (HTML, markdown, or plain text).
5. The converted message will appear in the output box.

## Deployment

1. Run `npm install` to install the necessary dependencies.
2. Run `npm run build` to build your project. This will create a `dist` directory with your bundled files.
3. Upload the `dist` directory to your web server.

## Development Notes
- Summernote requires Bootstrap `3.4.1` in addition to jQuery `3.5.1`
- `emoji.json` file is defined on https://raw.githubusercontent.com/iamcal/emoji-data/master/emoji.json
