import 'bootstrap';
import 'summernote';
import TurndownService from 'turndown';
import EmojiConvertor from 'emoji-js';
import './styles.css';
import 'summernote/dist/summernote.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const emoji = new EmojiConvertor();

let emojiData = [];

fetch('emoji.json')
  .then(response => response.json())
  .then(data => {
    emojiData = data;
    // console.log('Emoji data loaded:', emojiData);
  })
  .catch((error) => {
    console.error('Error:', error);
  });

  const replaceEmojiImages = (text) => {
    emojiData.forEach(emoji => {
      const emojiImageName = emoji.image.split('.')[0];
      const emojiImageUrlPattern = `https://a.slack-edge.com/.*${emojiImageName}.*\\.png`;
      const emojiUnicode = String.fromCodePoint(...emoji.unified.split('-').map(u => '0x' + u));
      const matchedText = text.match(new RegExp(emojiImageUrlPattern, 'g'));
      if (matchedText) {
        // console.log('Processing emoji:', emojiImageUrlPattern, 'to', emojiUnicode);
        text = text.replace(new RegExp(emojiImageUrlPattern, 'g'), emojiUnicode);
      }
    });
  
    // Convert Markdown image syntax with emoji to just emoji
    const markdownImageSyntaxPattern = /!\[(.*?)\]\(\1\)/g;
    const matchedMarkdownImageSyntax = text.match(markdownImageSyntaxPattern);
    if (matchedMarkdownImageSyntax) {
      // console.log('Before converting Markdown image syntax:', text);
      text = text.replace(markdownImageSyntaxPattern, '$1');
      // console.log('After converting Markdown image syntax:', text);
    }
  
    // Modify any remaining <img> tags to retain the value of `src=""` and remove the rest of the tag
    const imgTagPattern = /<img[^>]*src="(.*?)"[^>]*>/g;
    text = text.replace(imgTagPattern, '$1');

    // Replace any `&nbsp;` before or after the output with a single space
    const nbspPattern = /(&nbsp;)+/g;
    text = text.replace(nbspPattern, ' ');
  
    return text;
  }

const cleanHTML = () => {
  let dirtyHTML = $('#summernote').summernote('code');
  let cleanHTML = dirtyHTML.replace(/<div.*?class="p-rich_text_section".*?>/g, '<p>')
    .replace(/<\/div>/g, '</p>')
    .replace(/<span(?=[^>]*data-stringify-type="paragraph-break")[^>]*>/g, '<br />')
    .replace(/(?<=<\/span>)/g, '')
    .replace(/<div.*?>/g, '<p>')
    .replace(/<\/div>/g, '</p>')
    .replace(/<span.*?>/g, '')
    .replace(/<\/span>/g, '')
    .replace(/<b\b[^>]*>/g, '<strong>')
    .replace(/<\/b>/g, '</strong>')
    .replace(/<i\b[^>]*>/g, '<em>')
    .replace(/<\/i>/g, '</em>')
    .replace(/<a.*?href="(.*?)".*?>/g, '<a href="$1">')
    .replace(/<\/a>/g, '</a>')
    .replace(/<code.*?>/g, '<code>')
    .replace(/<\/code>/g, '</code>')
    .replace(/<pre.*?>/g, '<pre>')
    .replace(/<\/pre>/g, '</pre>')
    .replace(/<ul.*?>/g, '<ul>')
    .replace(/<\/ul>/g, '</ul>')
    .replace(/<li.*?>/g, '<li>')
    .replace(/<\/li>/g, '</li>')
    .replace(/<blockquote.*?>/g, '<blockquote>')
    .replace(/<\/blockquote>/g, '</blockquote>')
    .replace(/<br.*?>/g, '<br />');

  // Clean the output HTML
  const parser = new DOMParser();
  const doc = parser.parseFromString(cleanHTML, 'text/html');
  let cleanOutput = doc.body.innerHTML;

  // Remove empty <p></p> tags
  cleanOutput = cleanOutput.replace(/<p><\/p>/g, '');

  // Replace emoji images with Unicode characters
  cleanOutput = replaceEmojiImages(cleanOutput);

  // Convert Slack emoji codes to Unicode
  cleanOutput = emoji.replace_colons(cleanOutput);

  return cleanOutput;
}


const convertToMarkdown = () => {
  let cleanOutput = cleanHTML();

  // Replace emoji images with Unicode characters
  cleanOutput = replaceEmojiImages(cleanOutput);

  // Create a new Turndown instance
  const turndownService = new TurndownService();

  // Add a custom rule for handling <pre> tags
  turndownService.addRule('pre', {
    filter: 'pre',
    replacement: function(content) {
      return '\n```\n' + content + '\n```\n';
    }
  });

  // Convert the clean HTML to markdown
  let markdown = turndownService.turndown(cleanOutput);

  // Replace Slack emoji codes with Unicode
  markdown = emoji.replace_colons(markdown);

  $('#output').val(markdown);
}

const convertToPlaintext = () => {
  let cleanOutput = cleanHTML();
  let plaintext = cleanOutput.replace(/<br \/>/g, '\n')
    .replace(/<\/p>/g, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ');

  // Replace Slack emoji codes with Unicode
  plaintext = emoji.replace_colons(plaintext);

  $('#output').val(plaintext);
}

document.addEventListener('DOMContentLoaded', function() {
  const summernoteElement = document.getElementById('summernote');
  $(summernoteElement).summernote({
    placeholder: 'Enter your Slack message here...',
    tabsize: 2,
    height: 300,
    toolbar: []
  });


  const path = window.location.pathname;

  if (path === '/markdown') {
    $('#convert-html').hide();
    $('#convert-plain-text').hide();
    $('h1').text('Convert Slack to Markdown');
    $('#convert-markdown').show();
    $('#buttons-footer a[href="/html"]').show();
    $('#buttons-footer a[href="/plaintext"]').show();
  } else if (path === '/html') {
    $('#convert-markdown').hide();
    $('#convert-plain-text').hide();
    $('h1').text('Convert Slack to HTML');
    $('#convert-html').show();
    $('#buttons-footer a[href="/html"]').hide();
    $('#buttons-footer a[href="/markdown"]').show();
    $('#buttons-footer a[href="/plaintext"]').show();
  } else if (path === '/plaintext') {
    $('#convert-html').hide();
    $('#convert-markdown').hide();
    $('h1').text('Convert Slack to Plaintext');
    $('#convert-plain-text').show();
    $('#buttons-footer a[href="/plaintext"]').hide();
    $('#buttons-footer a[href="/html"]').show();
    $('#buttons-footer a[href="/markdown"]').show();
  } else {
    $('#convert-html').show();
    $('#convert-markdown').show();
    $('#convert-plain-text').show();
    $('#buttons-footer a[href="/html"]').show();
    $('#buttons-footer a[href="/markdown"]').show();
    $('#buttons-footer a[href="/plaintext"]').show();
  }

  document.getElementById('convert-html').addEventListener('click', () => {
    const cleanOutput = cleanHTML();
    document.getElementById('output').value = cleanOutput;
  });

  document.getElementById('convert-markdown').addEventListener('click', () => {
    convertToMarkdown();
  });

  document.getElementById('convert-plain-text').addEventListener('click', () => {
    convertToPlaintext();
  });
});