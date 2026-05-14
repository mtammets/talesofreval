export function parseBracketLinkText(text = '') {
  const normalizedText = typeof text === 'string' ? text : '';
  const match = normalizedText.match(/^(.*?)\[(.+?)\](.*)$/);

  if (!match) {
    return {
      before: normalizedText,
      linkText: '',
      after: '',
    };
  }

  return {
    before: match[1],
    linkText: match[2],
    after: match[3],
  };
}

export default parseBracketLinkText;
