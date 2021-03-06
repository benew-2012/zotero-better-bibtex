// Generated by CoffeeScript 1.10.0
var JabRef, Translator, name, ref, v,
  slice = [].slice,
  hasProp = {}.hasOwnProperty;

Translator = {};

Translator.debug_off = function() {};

Translator.debug = Translator.debug_on = function() {
  var msg;
  msg = 1 <= arguments.length ? slice.call(arguments, 0) : [];
  return this._log.apply(this, [5].concat(msg));
};

Translator.log_off = function() {};

Translator.log = Translator.log_on = function() {
  var msg;
  msg = 1 <= arguments.length ? slice.call(arguments, 0) : [];
  return this._log.apply(this, [3].concat(msg));
};

Translator.HTMLEncode = function(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
};

Translator.stringify = function(obj, replacer, spaces, cycleReplacer) {
  var j, key, keys, len, o, str;
  str = JSON.stringify(obj, this.stringifier(replacer, cycleReplacer), spaces);
  if (Array.isArray(obj)) {
    keys = Object.keys(obj);
    if (keys.length > 0) {
      o = {};
      for (j = 0, len = keys.length; j < len; j++) {
        key = keys[j];
        if (key.match(/^\d+$/)) {
          continue;
        }
        o[key] = obj[key];
      }
      str += '+' + this.stringify(o);
    }
  }
  return str;
};

Translator.locale = function(language) {
  var base, j, k, len, ll, locale, ref, v;
  if (!this.languages.locales[language]) {
    ll = language.toLowerCase();
    ref = this.languages.langs;
    for (j = 0, len = ref.length; j < len; j++) {
      locale = ref[j];
      for (k in locale) {
        v = locale[k];
        if (ll === v) {
          this.languages.locales[language] = locale[1];
        }
      }
      if (this.languages.locales[language]) {
        break;
      }
    }
    (base = this.languages.locales)[language] || (base[language] = language);
  }
  return this.languages.locales[language];
};

Translator.stringifier = function(replacer, cycleReplacer) {
  var keys, stack;
  stack = [];
  keys = [];
  if (cycleReplacer === null) {
    cycleReplacer = function(key, value) {
      if (stack[0] === value) {
        return '[Circular ~]';
      }
      return '[Circular ~.' + keys.slice(0, stack.indexOf(value)).join('.') + ']';
    };
  }
  return function(key, value) {
    var thisPos;
    if (stack.length > 0) {
      thisPos = stack.indexOf(this);
      if (~thisPos) {
        stack.splice(thisPos + 1);
      } else {
        stack.push(this);
      }
      if (~thisPos) {
        keys.splice(thisPos, Infinity, key);
      } else {
        keys.push(key);
      }
      if (~stack.indexOf(value)) {
        value = cycleReplacer.call(this, key, value);
      }
    } else {
      stack.push(value);
    }
    if (replacer === null || replacer === void 0) {
      return value;
    }
    return replacer.call(this, key, value);
  };
};

Translator._log = function() {
  var level, m, msg;
  level = arguments[0], msg = 2 <= arguments.length ? slice.call(arguments, 1) : [];
  msg = ((function() {
    var j, len, ref, results;
    results = [];
    for (j = 0, len = msg.length; j < len; j++) {
      m = msg[j];
      results.push((ref = typeof m) === 'boolean' || ref === 'string' || ref === 'number' ? '' + m : Translator.stringify(m));
    }
    return results;
  })()).join(' ');
  return Zotero.debug('[better' + '-' + ("bibtex:" + this.header.label + "] ") + msg, level);
};

Translator.CSLVariables = {
  archive: {},
  'archive_location': {},
  'archive-place': {},
  authority: {
    BibLaTeX: 'institution'
  },
  'call-number': {
    BibTeX: 'lccn'
  },
  'collection-title': {},
  'container-title': {
    BibLaTeX: function() {
      switch (this.item.itemType) {
        case 'film':
        case 'tvBroadcast':
        case 'videoRecording':
          return 'booktitle';
        case 'bookSection':
          return 'maintitle';
        default:
          return 'journaltitle';
      }
    }
  },
  'container-title-short': {},
  dimensions: {},
  DOI: {
    BibTeX: 'doi',
    BibLaTeX: 'doi'
  },
  event: {},
  'event-place': {},
  genre: {},
  ISBN: {
    BibTeX: 'isbn',
    BibLaTeX: 'isbn'
  },
  ISSN: {
    BibTeX: 'issn',
    BibLaTeX: 'issn'
  },
  jurisdiction: {},
  keyword: {},
  locator: {},
  medium: {},
  'original-publisher': {
    BibLaTeX: 'origpublisher',
    type: 'literal'
  },
  'original-publisher-place': {
    BibLaTeX: 'origlocation',
    type: 'literal'
  },
  'original-title': {
    BibLaTeX: 'origtitle'
  },
  page: {},
  'page-first': {},
  PMCID: {},
  PMID: {},
  publisher: {},
  'publisher-place': {
    BibLaTeX: 'location',
    type: 'literal'
  },
  references: {},
  'reviewed-title': {},
  scale: {},
  section: {},
  source: {},
  status: {},
  title: {
    BibLaTeX: function() {
      if (this.referencetype === 'book') {
        return 'maintitle';
      } else {
        return null;
      }
    }
  },
  'title-short': {},
  URL: {},
  version: {},
  'volume-title': {
    BibLaTeX: function() {
      switch (this.item.itemType) {
        case 'book':
          return 'title';
        case 'bookSection':
          return 'booktitle';
        default:
          return null;
      }
    }
  },
  'year-suffix': {},
  'chapter-number': {},
  'collection-number': {},
  edition: {},
  issue: {},
  number: {
    BibLaTeX: 'number'
  },
  'number-of-pages': {},
  'number-of-volumes': {},
  volume: {
    BibLaTeX: 'volume'
  },
  accessed: {
    type: 'date'
  },
  container: {
    type: 'date'
  },
  'event-date': {
    type: 'date'
  },
  issued: {
    type: 'date',
    BibLaTeX: 'date'
  },
  'original-date': {
    type: 'date',
    BibLaTeX: 'origdate'
  },
  submitted: {
    type: 'date'
  },
  author: {
    type: 'creator',
    BibLaTeX: 'author'
  },
  'collection-editor': {
    type: 'creator'
  },
  composer: {
    type: 'creator'
  },
  'container-author': {
    type: 'creator'
  },
  director: {
    type: 'creator',
    BibLaTeX: 'director'
  },
  editor: {
    type: 'creator',
    BibLaTeX: 'editor'
  },
  'editorial-director': {
    type: 'creator'
  },
  illustrator: {
    type: 'creator'
  },
  interviewer: {
    type: 'creator'
  },
  'original-author': {
    type: 'creator'
  },
  recipient: {
    type: 'creator'
  },
  'reviewed-author': {
    type: 'creator'
  },
  translator: {
    type: 'creator'
  }
};

ref = Translator.CSLVariables;
for (name in ref) {
  v = ref[name];
  v.name = name;
}

Translator.CSLVariable = function(name) {
  return this.CSLVariables[name] || this.CSLVariables[name.toLowerCase()] || this.CSLVariables[name.toUpperCase()];
};

Translator.CSLCreator = function(value) {
  var creator;
  creator = value.split(/\s*\|\|\s*/);
  if (creator.length === 2) {
    return {
      lastName: creator[0] || '',
      firstName: creator[1] || ''
    };
  } else {
    return {
      name: value
    };
  }
};

Translator.extractFieldsKVRE = new RegExp("^\\s*(" + (Object.keys(Translator.CSLVariables).join('|')) + "|LCCN|MR|Zbl|arXiv|JSTOR|HDL|GoogleBooksID)\\s*:\\s*(.+)\\s*$", 'i');

Translator.extractFields = function(item) {
  var assignment, cslvar, data, error, extra, fields, j, json, l, len, len1, line, m, prefix, ref1, ref2, ref3, value;
  if (!item.extra) {
    return {};
  }
  fields = {};
  m = /(biblatexdata|bibtex|biblatex)\[([^\]]+)\]/.exec(item.extra);
  if (m) {
    item.extra = item.extra.replace(m[0], '').trim();
    ref1 = m[2].split(';');
    for (j = 0, len = ref1.length; j < len; j++) {
      assignment = ref1[j];
      data = assignment.match(/^([^=]+)=\s*(.*)/);
      if (data) {
        fields[data[1].toLowerCase()] = {
          value: data[2],
          format: 'naive'
        };
      } else {
        Translator.debug("Not an assignment: " + assignment);
      }
    }
  }
  m = /(biblatexdata|bibtex|biblatex)({[\s\S]+})/.exec(item.extra);
  if (m) {
    prefix = m[1];
    data = m[2];
    while (data.indexOf('}') >= 0) {
      try {
        json = JSON5.parse(data);
      } catch (error) {
        json = null;
      }
      if (json) {
        break;
      }
      data = data.replace(/[^}]*}$/, '');
    }
    if (json) {
      item.extra = item.extra.replace(prefix + data, '').trim();
      for (name in json) {
        if (!hasProp.call(json, name)) continue;
        value = json[name];
        fields[name.toLowerCase()] = {
          value: value,
          format: 'json'
        };
      }
    }
  }
  item.extra = item.extra.replace(/{:([^:]+):\s*([^}]+)}/g, (function(_this) {
    return function(m, name, value) {
      var cslvar, ref2;
      cslvar = Translator.CSLVariable(name);
      if (!cslvar) {
        return '';
      }
      if (cslvar.type === 'creator') {
        if (!Array.isArray((ref2 = fields[name]) != null ? ref2.value : void 0)) {
          fields[cslvar.name] = {
            value: [],
            format: 'csl'
          };
        }
        fields[cslvar.name].value.push(_this.CSLCreator(value));
      } else {
        fields[cslvar.name] = {
          value: value,
          format: 'csl'
        };
      }
      return '';
    };
  })(this));
  extra = [];
  ref2 = item.extra.split("\n");
  for (l = 0, len1 = ref2.length; l < len1; l++) {
    line = ref2[l];
    m = Translator.extractFieldsKVRE.exec(line);
    cslvar = m ? this.CSLVariable(m[1]) : null;
    switch (false) {
      case !!m:
        extra.push(line);
        break;
      case !!cslvar:
        fields[m[1].toLowerCase()] = {
          value: m[2].trim(),
          format: 'key-value'
        };
        break;
      case cslvar.type !== 'creator':
        if (!Array.isArray((ref3 = fields[cslvar.name]) != null ? ref3.value : void 0)) {
          fields[cslvar.name] = {
            value: [],
            format: 'csl'
          };
        }
        fields[cslvar.name].value.push(this.CSLCreator(m[2].trim()));
        break;
      default:
        fields[cslvar.name] = {
          value: m[2].trim(),
          format: 'csl'
        };
    }
  }
  item.extra = extra.join("\n");
  item.extra = item.extra.trim();
  if (item.extra === '') {
    delete item.extra;
  }
  return fields;
};

Translator.initialize = function() {
  var attr, base, base1, bibtex, cfg, ch, collection, f, field, i, j, k, l, len, len1, len2, len3, len4, n, option, p, pref, preferenceKeys, q, ref1, ref2, ref3, type, typeMap, word, zotero;
  if (this.initialized) {
    return;
  }
  this.initialized = true;
  this.citekeys = Object.create(null);
  this.attachmentCounter = 0;
  this.rawLaTag = '#LaTeX';
  this.BibLaTeXDataFieldMap = Object.create(null);
  this.translatorID = this.header.translatorID;
  this.testing = Zotero.getHiddenPref('better-bibtex.tests') !== '';
  if (this.testing) {
    this.testing_timestamp = Zotero.getHiddenPref('better-bibtex.test.timestamp');
  }
  ref1 = this.fieldMap || {};
  for (attr in ref1) {
    if (!hasProp.call(ref1, attr)) continue;
    f = ref1[attr];
    if (f.name) {
      this.BibLaTeXDataFieldMap[f.name] = f;
    }
  }
  preferenceKeys = ['asciiBibLaTeX', 'asciiBibTeX', 'attachmentsNoMetadata', 'bibtexURLs', 'citekeyFormat', 'csquotes', 'DOIandURL', 'jabrefGroups', 'langID', 'postscript', 'preserveBibTeXVariables', 'rawImports', 'skipFields', 'titleCase', 'titleCaseLowerCase', 'titleCaseUpperCase'];
  this.preferences = {};
  for (j = 0, len = preferenceKeys.length; j < len; j++) {
    pref = preferenceKeys[j];
    this.preferences[pref] = this[pref] = Zotero.getHiddenPref("better-bibtex." + pref);
  }
  this.titleCaseLowerCase = new RegExp('^(' + ((function() {
    var l, len1, ref2, results;
    ref2 = this.titleCaseLowerCase.split(/\s+/);
    results = [];
    for (l = 0, len1 = ref2.length; l < len1; l++) {
      word = ref2[l];
      if (word) {
        results.push(word.replace(/\./g, '\\.'));
      }
    }
    return results;
  }).call(this)).join('|') + ')$', 'i');
  this.titleCaseUpperCase = new RegExp('^(' + ((function() {
    var l, len1, ref2, results;
    ref2 = this.titleCaseUpperCase.split(/\s+/);
    results = [];
    for (l = 0, len1 = ref2.length; l < len1; l++) {
      word = ref2[l];
      if (word) {
        results.push(word.replace(/\./g, '\\.'));
      }
    }
    return results;
  }).call(this)).join('|') + ')$', 'i');
  this.skipFields = (function() {
    var l, len1, ref2, results;
    ref2 = (this.skipFields || '').split(',');
    results = [];
    for (l = 0, len1 = ref2.length; l < len1; l++) {
      field = ref2[l];
      if (field.trim()) {
        results.push(field.trim());
      }
    }
    return results;
  }).call(this);
  if (this.csquotes) {
    this.csquotes = {
      open: '',
      close: ''
    };
    ref2 = Translator.preferences.csquotes;
    for (i = l = 0, len1 = ref2.length; l < len1; i = ++l) {
      ch = ref2[i];
      if (i % 2 === 0) {
        this.csquotes.open += ch;
      } else {
        this.csquotes.close += ch;
      }
    }
  }
  this.options = {};
  ref3 = ['useJournalAbbreviation', 'exportPath', 'exportFilename', 'exportCharset', 'exportFileData', 'exportNotes'];
  for (n = 0, len2 = ref3.length; n < len2; n++) {
    option = ref3[n];
    this.options[option] = this[option] = Zotero.getOption(option);
  }
  this.caching = !this.exportFileData;
  this.unicode = (function() {
    switch (false) {
      case !(this.BetterBibLaTeX || this.CollectedNotes):
        return !this.asciiBibLaTeX;
      case !this.BetterBibTeX:
        return !this.asciiBibTeX;
      default:
        return true;
    }
  }).call(this);
  if (this.typeMap) {
    typeMap = this.typeMap;
    this.typeMap = {
      BibTeX2Zotero: Object.create(null),
      Zotero2BibTeX: Object.create(null)
    };
    for (bibtex in typeMap) {
      if (!hasProp.call(typeMap, bibtex)) continue;
      zotero = typeMap[bibtex];
      bibtex = bibtex.replace(/^=/, '').trim().split(/\s+/);
      zotero = zotero.trim().split(/\s+/);
      for (p = 0, len3 = bibtex.length; p < len3; p++) {
        type = bibtex[p];
        if ((base = this.typeMap.BibTeX2Zotero)[type] == null) {
          base[type] = zotero[0];
        }
      }
      for (q = 0, len4 = zotero.length; q < len4; q++) {
        type = zotero[q];
        if ((base1 = this.typeMap.Zotero2BibTeX)[type] == null) {
          base1[type] = bibtex[0];
        }
      }
    }
  }
  if (Zotero.getHiddenPref('better-bibtex.debug')) {
    this.debug = this.debug_on;
    this.log = this.log_on;
    cfg = {};
    for (k in this) {
      if (!hasProp.call(this, k)) continue;
      v = this[k];
      if (typeof v !== 'object') {
        cfg[k] = v;
      }
    }
    this.debug("Translator initialized:", cfg);
  } else {
    this.debug = this.debug_off;
    this.log = this.log_off;
  }
  this.collections = [];
  if (Zotero.nextCollection) {
    while (collection = Zotero.nextCollection()) {
      this.debug('adding collection:', collection);
      this.collections.push(this.sanitizeCollection(collection));
    }
  }
  return this.context = {
    exportCharset: (this.exportCharset || 'UTF-8').toUpperCase(),
    exportNotes: !!this.exportNotes,
    translatorID: this.translatorID,
    useJournalAbbreviation: !!this.useJournalAbbreviation
  };
};

Translator.sanitizeCollection = function(coll) {
  var c, j, len, ref1, sane;
  sane = {
    name: coll.name,
    collections: [],
    items: []
  };
  ref1 = coll.children || coll.descendents;
  for (j = 0, len = ref1.length; j < len; j++) {
    c = ref1[j];
    switch (c.type) {
      case 'item':
        sane.items.push(c.id);
        break;
      case 'collection':
        sane.collections.push(this.sanitizeCollection(c));
        break;
      default:
        throw "Unexpected collection member type '" + c.type + "'";
    }
  }
  if (Translator.testing) {
    sane.collections.sort((function(a, b) {
      return a.name.localeCompare(b.name);
    }));
  }
  return sane;
};

Translator.nextItem = function() {
  var cached, item;
  this.initialize();
  while (item = Zotero.nextItem()) {
    if (item.itemType === 'note' || item.itemType === 'attachment') {
      continue;
    }
    if (this.caching) {
      cached = Zotero.BetterBibTeX.cache.fetch(item.itemID, this.context);
      if (cached != null ? cached.citekey : void 0) {
        Translator.debug('nextItem: cached');
        this.citekeys[item.itemID] = cached.citekey;
        Zotero.write(cached.bibtex);
        continue;
      }
    }
    Zotero.BetterBibTeX.keymanager.extract(item, 'nextItem');
    item.__citekey__ || (item.__citekey__ = Zotero.BetterBibTeX.keymanager.get(item, 'on-export').citekey);
    this.citekeys[item.itemID] = item.__citekey__;
    Translator.debug('nextItem: serialized');
    return item;
  }
  return null;
};

Translator.exportGroups = function() {
  var collection, groups, j, len, ref1;
  this.debug('exportGroups:', this.collections);
  if (this.collections.length === 0 || !this.jabrefGroups) {
    return;
  }
  Zotero.write('@comment{jabref-meta: groupsversion:3;}\n');
  Zotero.write('@comment{jabref-meta: groupstree:\n');
  Zotero.write('0 AllEntriesGroup:;\n');
  this.debug('exportGroups: getting groups');
  groups = [];
  ref1 = this.collections;
  for (j = 0, len = ref1.length; j < len; j++) {
    collection = ref1[j];
    groups = groups.concat(JabRef.exportGroup(collection, 1));
  }
  this.debug('exportGroups: serialize', groups);
  return Zotero.write(JabRef.serialize(groups, ';\n', true) + ';\n}\n');
};

JabRef = {
  serialize: function(arr, sep, wrap) {
    arr = (function() {
      var j, len, results;
      results = [];
      for (j = 0, len = arr.length; j < len; j++) {
        v = arr[j];
        results.push(('' + v).replace(/;/g, "\\;"));
      }
      return results;
    })();
    if (wrap) {
      arr = (function() {
        var j, len, results;
        results = [];
        for (j = 0, len = arr.length; j < len; j++) {
          v = arr[j];
          results.push(v.match(/.{1,70}/g).join("\n"));
        }
        return results;
      })();
    }
    return arr.join(sep);
  },
  exportGroup: function(collection, level) {
    var coll, group, id, j, len, ref1, references, result;
    group = [level + " ExplicitGroup:" + collection.name, 0];
    references = (function() {
      var j, len, ref1, results;
      ref1 = collection.items;
      results = [];
      for (j = 0, len = ref1.length; j < len; j++) {
        id = ref1[j];
        results.push(Translator.citekeys[id]);
      }
      return results;
    })();
    if (Translator.testing) {
      references.sort();
    }
    group = group.concat(references);
    group.push('');
    group = this.serialize(group, ';');
    result = [group];
    ref1 = collection.collections;
    for (j = 0, len = ref1.length; j < len; j++) {
      coll = ref1[j];
      result = result.concat(JabRef.exportGroup(coll, level + 1));
    }
    return result;
  }
};
