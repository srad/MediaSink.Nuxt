const tagAlphabet = /^[0-9a-z]+(\-*[0-9a-z]+)*$/;

/**
 * Validates a single tag (string).
 * @param tag
 */
export const validTag = (tag: string) => tagAlphabet.test(tag);

/**
 * Confirms or rejects the validity of a tag array.
 * @param tags string array of tags.
 */
export const validateTags = (tags: string[]): boolean => {
  for (let tag of tags) {
    if (!tagAlphabet.test(tag)) {
      return false;
    }
  }
  return true
};

/**
 * Parses a string which contains comma separated tag.
 * @param str
 */
export const parseTagsString = (str: string): string[] => {
  const tokens: string[] = [];
  let token = "";

  function add(token: string) {
    if (token.length > 0) {
      tokens.push(token);
    }
  }

  for (let i = 0; i < str.length; i++) {
    const c = str.charAt(i)
    if (c === ",") {
      add(token);
      token = "";
      continue;
    }
    if (tagAlphabet.test(c)) {
      token += c;
    } else {
      throw new Error("Invalid character: " + c);
    }
  }
  add(token);

  return tokens;
};
