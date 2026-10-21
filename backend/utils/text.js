const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Lowercase, drop punctuation, and pad with spaces so " hi " never matches inside " this ".
const normalize = (value) =>
  ` ${String(value)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()} `;

// Returns the item whose longest phrase appears in the query as whole words, or null.
const findBestMatch = (query, items, getPhrases) => {
  const normalizedQuery = normalize(query);
  let best = null;
  let bestLength = 0;

  for (const item of items) {
    for (const phrase of getPhrases(item)) {
      const normalizedPhrase = normalize(phrase);

      if (
        normalizedPhrase.trim() &&
        normalizedPhrase.length > bestLength &&
        normalizedQuery.includes(normalizedPhrase)
      ) {
        best = item;
        bestLength = normalizedPhrase.length;
      }
    }
  }

  return best;
};

module.exports = { escapeRegex, normalize, findBestMatch };
