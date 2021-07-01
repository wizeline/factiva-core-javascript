const IDENTATION_LEVEL = 2;

class StreamResponse {
  // eslint-disable-next-line object-curly-newline
  constructor({ type, id, attributes, relationships, links = {} }) {
    this.type = type;
    this.id = id;
    this.attributes = this.setData(attributes);
    this.relationships = this.setData(relationships);
    this.links = links ? this.setData(links) : '';
  }

  setData(data, level = IDENTATION_LEVEL) {
    const idents = new Array(level + 1).join(' ');
    let objectRepr = '';
    Object.entries(data).forEach(([key, val]) => {
      if (val.isArray) {
        // eslint-disable-next-line no-restricted-syntax
        for (const att of val) {
          const currData = this.setData(att, level + 1);
          objectRepr += `${idents}${key}: \n ${currData}     ---\n`;
        }
      } else if (typeof val === 'object') {
        const currData = this.setData(val, level + 1);
        objectRepr += `${idents}${key}: \n ${currData}       ---\n`;
      } else {
        objectRepr += `${idents}${key}: ${val}      ---\n`;
      }
    });

    return objectRepr;
  }

  toString() {
    return `StreamResponse(
      type: ${this.type},
      id: ${this.id},
      attributes:
          ${this.attributes},
      relationships:
          ${this.relationships},
      links:
          ${this.links},
    )`;
  }
}

module.exports = StreamResponse;
