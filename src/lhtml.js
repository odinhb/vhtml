const HTML_ESCAPE_MAP = {'&':'amp','<':'lt','>':'gt','"':'quot',"'":'apos'};
// sanitize/escape an html string
function esc(str){
  return String(str).replace(/[&<>"']/g, s=>`&${HTML_ESCAPE_MAP[s]};`);
}

let setInnerHTMLAttr = 'dangerouslySetInnerHTML';
let DOMAttributeNames = {
  className: 'class',
  htmlFor: 'for'
};

// Void tags or self closing tags don't require having content.
// They are often written as <tag />.
// https://developer.mozilla.org/en-US/docs/Glossary/Void_element
const VOID_TAGS = [
  'area',
  'base',
  'br',
  'col',
  'command',
  'embed',
  'hr',
  'img',
  'input',
  'keygen',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr'
];

function extractChildren(args) {
  return Array.from(args)
    .slice(2)
    .reverse()
  ;
}

function renderAttributes(attributes) {
  let result = '';

  for(const property in attributes) {
    const value = attributes[property];

    if (property === setInnerHTMLAttr) continue;
    if (value === false) continue;
    if (value == null) continue;

    result += ' ';
    if (DOMAttributeNames[property]) {
      result += DOMAttributeNames[property];
    } else {
      result += `${esc(property)}`;
    }
    result += `="${esc(value)}"`;
  }

  return result;
}

function render(tagName, attributes) {
  attributes = attributes || {};
  const children = extractChildren(arguments);

  if (typeof tagName === 'function') {
    const pseudoComponent = tagName;
    attributes.children = children.reverse();
    return pseudoComponent(attributes);
  }

  let result = '';

  if (tagName) { // null is passed when rendering a fragment
    result += '<';

    result += tagName;

    result += renderAttributes(attributes);

    result += '>';
  }

  if (!VOID_TAGS.includes(tagName)) {
    if (attributes[setInnerHTMLAttr]) {
      result += attributes[setInnerHTMLAttr].__html;
    } else while(children.length) {
      const child = children.pop();
      if (child) {
        if (child.pop) {
          for (let i = child.length - 1; i >= 0; i--) {
            children.push(child[i]);
          }
        } else {
          if (child._vvhtml_safe) {
            result += child;
          } else {
            result += esc(child);
          }
        }
      }
    }

    if (tagName) result += `</${tagName}>`;
  }

  // Read about the fun world of javascript strings
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String#string_primitives_and_string_objects
  const s = new String(result);
  s._vvhtml_safe = true;
  return s;
}

export default render;