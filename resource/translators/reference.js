// Generated by CoffeeScript 1.10.0

/*
 * h1 Global object: Translator
 *
 * The global Translator object allows access to the current configuration of the translator
 *
 * @param {enum} titleCase whether titles should be title-cased
 * @param {boolean} bibtexURLs set to true when BBT will generate \url{..} around the urls for BibTeX
 */

/*
 * h1 class: Reference
 *
 * The Bib(La)TeX references are generated by the `Reference` class. Before being comitted to the cache, you can add
 * postscript code that can manipulated the `fields` or the `referencetype`
 *
 * @param {Array} @fields Array of reference fields
 * @param {String} @referencetype referencetype
 * @param {Object} @item the current Zotero item being converted
 */

/*
 * The fields are objects with the following keys:
 *   * name: name of the Bib(La)TeX field
 *   * value: the value of the field
 *   * bibtex: the LaTeX-encoded value of the field
 *   * enc: the encoding to use for the field
 */
var Language, Reference,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
  hasProp = {}.hasOwnProperty;

Reference = (function() {
  function Reference(item) {
    var attr, f, langlc, ref1, ref2, ref3, sim;
    this.item = item;
    this.fields = [];
    this.has = Object.create(null);
    this.raw = (ref1 = Translator.rawLaTag, indexOf.call(this.item.tags, ref1) >= 0);
    if (!this.item.language) {
      this.english = true;
    } else {
      langlc = this.item.language.toLowerCase();
      this.language = Language.babelMap[langlc.replace(/[^a-z0-9]/, '_')];
      this.language || (this.language = Language.babelMap[langlc.replace(/-[a-z]+$/i, '').replace(/[^a-z0-9]/, '_')]);
      if (this.language) {
        this.language = this.language[0];
      } else {
        sim = Language.lookup(langlc);
        if (sim[0].sim >= 0.9) {
          this.language = sim[0].lang;
        } else {
          delete this.language;
        }
      }
      this.english = (ref2 = this.language) === 'american' || ref2 === 'british' || ref2 === 'canadian' || ref2 === 'english' || ref2 === 'australian' || ref2 === 'newzealand' || ref2 === 'USenglish' || ref2 === 'UKenglish';
    }
    this.referencetype = Translator.typeMap.Zotero2BibTeX[this.item.itemType] || 'misc';
    this.override = Translator.extractFields(this.item);
    ref3 = Translator.fieldMap || {};
    for (attr in ref3) {
      if (!hasProp.call(ref3, attr)) continue;
      f = ref3[attr];
      if (f.name) {
        this.add(this.clone(f, this.item[attr]));
      }
    }
    this.add({
      name: 'timestamp',
      value: Translator.testing_timestamp || this.item.dateModified || this.item.dateAdded
    });
  }


  /*
   * Return a copy of the given `field` with a new value
   *
   * @param {field} field to be cloned
   * @param {value} value to be assigned
   * @return {Object} copy of field settings with new value
   */

  Reference.prototype.clone = function(f, value) {
    var clone;
    clone = JSON.parse(JSON.stringify(f));
    delete clone.bibtex;
    clone.value = value;
    return clone;
  };


  /*
   * 'Encode' to raw LaTeX value
   *
   * @param {field} field to encode
   * @return {String} unmodified `field.value`
   */

  Reference.prototype.enc_raw = function(f) {
    return f.value;
  };


  /*
   * Encode to date
   *
   * @param {field} field to encode
   * @return {String} unmodified `field.value`
   */

  Reference.prototype.isodate = function(v, suffix) {
    var date, day, month, year;
    if (suffix == null) {
      suffix = '';
    }
    year = v["year" + suffix];
    if (!year) {
      return null;
    }
    month = v["month" + suffix];
    if (month) {
      month = ("0" + month).slice(-2);
    }
    day = v["day" + suffix];
    if (day) {
      day = ("0" + day).slice(-2);
    }
    date = '' + year;
    if (month) {
      date += "-" + month;
      if (day) {
        date += "-" + day;
      }
    }
    return date;
  };

  Reference.prototype.enc_date = function(f) {
    var date, enddate, value;
    if (!f.value) {
      return null;
    }
    value = f.value;
    if (typeof f.value === 'string') {
      value = Zotero.BetterBibTeX.parseDateToObject(value, this.item.language);
    }
    if (value.literal) {
      if (value.literal === 'n.d.') {
        return '\\bibstring{nodate}';
      }
      return this.enc_latex(this.clone(f, value.literal));
    }
    date = this.isodate(value);
    if (!date) {
      return null;
    }
    enddate = this.isodate(value, '_end');
    if (enddate) {
      date += "/" + enddate;
    }
    return this.enc_latex({
      value: date
    });
  };


  /*
   * Encode to LaTeX url
   *
   * @param {field} field to encode
   * @return {String} field.value encoded as verbatim LaTeX string (minimal escaping). If in Better BibTeX, wraps return value in `\url{string}`
   */

  Reference.prototype.enc_url = function(f) {
    var value;
    value = this.enc_verbatim(f);
    if (Translator.BetterBibTeX) {
      return "\\url{" + (this.enc_verbatim(f)) + "}";
    } else {
      return value;
    }
  };


  /*
   * Encode to verbatim LaTeX
   *
   * @param {field} field to encode
   * @return {String} field.value encoded as verbatim LaTeX string (minimal escaping).
   */

  Reference.prototype.enc_verbatim = function(f) {
    return this.toVerbatim(f.value);
  };

  Reference.prototype.nonLetters = new XRegExp("[^\\p{Letter}]", 'g');

  Reference.prototype.punctuationAtEnd = new XRegExp("[\\p{Punctuation}]$");

  Reference.prototype.startsWithLowercase = new XRegExp("^[\\p{Ll}]");

  Reference.prototype._enc_creators_postfix_particle = function(particle) {
    if (particle[particle.length - 1] === ' ') {
      return '';
    }
    if (Translator.BetterBibLaTeX) {
      return ' ';
    }
    if (particle[particle.length - 1] === '.') {
      return ' ';
    }
    if (XRegExp.test(particle, this.punctuationAtEnd)) {
      return '';
    }
    return ' ';
  };

  Reference.prototype._enc_creators_quote_separators = function(value) {
    var i, n;
    return (function() {
      var j, len, ref1, results;
      ref1 = value.split(/(\s+and\s+|,)/i);
      results = [];
      for (i = j = 0, len = ref1.length; j < len; i = ++j) {
        n = ref1[i];
        results.push(i % 2 === 0 ? n : new String(n));
      }
      return results;
    })();
  };

  Reference.prototype._enc_creators_biblatex = function(name) {
    var j, k, latex, len, particle, ref1, v;
    ref1 = ['non-dropping-particle', 'dropping-particle'];
    for (j = 0, len = ref1.length; j < len; j++) {
      particle = ref1[j];
      if (name[particle]) {
        name[particle] += this._enc_creators_postfix_particle(name[particle]);
      }
    }
    for (k in name) {
      v = name[k];
      if (typeof v !== 'string') {
        continue;
      }
      switch (false) {
        case !(v.length > 1 && v[0] === '"' && v[v.length - 1] === '"'):
          name[k] = this.enc_latex({
            value: new String(v.slice(1, -1))
          });
          break;
        case !(k === 'family' && XRegExp.test(v, this.startsWithLowercase)):
          name[k] = this.enc_latex({
            value: new String(v)
          });
          break;
        default:
          name[k] = this.enc_latex({
            value: this._enc_creators_quote_separators(v),
            sep: ' '
          });
      }
    }
    latex = '';
    if (name['dropping-particle']) {
      latex += name['dropping-particle'];
    }
    if (name['non-dropping-particle']) {
      latex += name['non-dropping-particle'];
    }
    if (name.family) {
      latex += name.family;
    }
    if (name.suffix) {
      latex += ", " + name.suffix;
    }
    latex += ", " + (name.given || '');
    return latex;
  };

  Reference.prototype._enc_creators_bibtex = function(name) {
    var j, latex, len, part, particle, ref1;
    ref1 = ['non-dropping-particle', 'dropping-particle'];
    for (j = 0, len = ref1.length; j < len; j++) {
      particle = ref1[j];
      if (name[particle]) {
        name[particle] += this._enc_creators_postfix_particle(name[particle]);
      }
    }
    if (name.family.length > 1 && name.family[0] === '"' && name.family[name.family.length - 1] === '"') {
      name.family = name.family.slice(1, -1);
    }
    latex = [
      new String(((function() {
        var l, len1, ref2, results;
        ref2 = [name['dropping-particle'], name['non-dropping-particle'], name.family];
        results = [];
        for (l = 0, len1 = ref2.length; l < len1; l++) {
          part = ref2[l];
          if (part) {
            results.push(part);
          }
        }
        return results;
      })()).join(''))
    ];
    if (name.suffix) {
      latex.push(name.suffix);
    }
    if (name.given) {
      latex.push(name.given);
    }
    return this.enc_latex({
      value: latex,
      sep: ', '
    });
  };


  /*
   * Encode creators to author-style field
   *
   * @param {field} field to encode. The 'value' must be an array of Zotero-serialized `creator` objects.
   * @return {String} field.value encoded as author-style value
   */

  Reference.prototype.enc_creators = function(f, raw) {
    var creator, encoded, j, len, name, ref1;
    if (f.value.length === 0) {
      return null;
    }
    encoded = [];
    ref1 = f.value;
    for (j = 0, len = ref1.length; j < len; j++) {
      creator = ref1[j];
      switch (false) {
        case !(creator.name || (creator.lastName && creator.fieldMode === 1)):
          name = raw ? "{" + (creator.name || creator.lastName) + "}" : this.enc_latex({
            value: new String(creator.name || creator.lastName)
          });
          break;
        case !raw:
          name = [creator.lastName || '', creator.firstName || ''].join(', ');
          break;
        case !(creator.lastName || creator.firstName):
          name = {
            family: creator.lastName || '',
            given: creator.firstName || ''
          };
          Zotero.BetterBibTeX.CSL.parseParticles(name);
          this.useprefix || (this.useprefix = !!name['non-dropping-particle']);
          this.juniorcomma || (this.juniorcomma = f.juniorcomma && name['comma-suffix']);
          if (Translator.BetterBibTeX) {
            name = this._enc_creators_bibtex(name);
          } else {
            name = this._enc_creators_biblatex(name);
          }
          break;
        default:
          continue;
      }
      encoded.push(name.trim());
    }
    return encoded.join(' and ');
  };


  /*
   * Encode text to LaTeX literal list (double-braced)
   *
   * This encoding supports simple HTML markup.
   *
   * @param {field} field to encode.
   * @return {String} field.value encoded as author-style value
   */

  Reference.prototype.enc_literal = function(f, raw) {
    return this.enc_latex({
      value: new String(f.value)
    }, raw);
  };


  /*
   * Encode text to LaTeX
   *
   * This encoding supports simple HTML markup.
   *
   * @param {field} field to encode.
   * @return {String} field.value encoded as author-style value
   */

  Reference.prototype.enc_latex = function(f, raw) {
    var value, word;
    if (typeof f.value === 'number') {
      return f.value;
    }
    if (!f.value) {
      return null;
    }
    if (Array.isArray(f.value)) {
      if (f.value.length === 0) {
        return null;
      }
      return ((function() {
        var j, len, ref1, results;
        ref1 = f.value;
        results = [];
        for (j = 0, len = ref1.length; j < len; j++) {
          word = ref1[j];
          results.push(this.enc_latex(this.clone(f, word), raw));
        }
        return results;
      }).call(this)).join(f.sep || '');
    }
    if (raw) {
      return f.value;
    }
    value = LaTeX.text2latex(f.value, {
      autoCase: f.autoCase && this.english
    });
    if (f.value instanceof String) {
      value = new String("{" + value + "}");
    }
    return value;
  };

  Reference.prototype.enc_tags = function(f) {
    var balanced, ch, tag, tags;
    tags = (function() {
      var j, len, ref1, results;
      ref1 = f.value || [];
      results = [];
      for (j = 0, len = ref1.length; j < len; j++) {
        tag = ref1[j];
        if (tag && tag !== Translator.rawLaTag) {
          results.push(tag);
        }
      }
      return results;
    })();
    if (tags.length === 0) {
      return null;
    }
    if (Translator.testing) {
      tags.sort();
    }
    tags = (function() {
      var j, l, len, len1, results;
      results = [];
      for (j = 0, len = tags.length; j < len; j++) {
        tag = tags[j];
        if (Translator.BetterBibTeX) {
          tag = tag.replace(/([#\\%&])/g, '\\$1');
        } else {
          tag = tag.replace(/([#%\\])/g, '\\$1');
        }
        tag = tag.replace(/,/g, ';');
        balanced = 0;
        for (l = 0, len1 = tag.length; l < len1; l++) {
          ch = tag[l];
          switch (ch) {
            case '{':
              balanced += 1;
              break;
            case '}':
              balanced -= 1;
          }
          if (balanced < 0) {
            break;
          }
        }
        if (balanced !== 0) {
          tag = tag.replace(/{/g, '(').replace(/}/g, ')');
        }
        results.push(tag);
      }
      return results;
    })();
    return tags.join(',');
  };

  Reference.prototype.enc_attachments = function(f) {
    var a, att, attachments, errors, j, len, part, ref1, save;
    if (!f.value || f.value.length === 0) {
      return null;
    }
    attachments = [];
    errors = [];
    ref1 = f.value;
    for (j = 0, len = ref1.length; j < len; j++) {
      att = ref1[j];
      a = {
        title: att.title,
        path: att.localPath,
        mimetype: att.mimeType || ''
      };
      save = Translator.exportFileData && att.defaultPath && att.saveFile;
      if (save) {
        a.path = att.defaultPath;
      }
      if (!a.path) {
        continue;
      }
      a.title || (a.title = att.path.replace(/.*[\\\/]/, '') || 'attachment');
      if (a.path.match(/[{}]/)) {
        errors.push("BibTeX cannot handle file paths with braces: " + (JSON.stringify(a.path)));
        continue;
      }
      if (!a.mimetype && a.path.slice(-4).toLowerCase() === '.pdf') {
        a.mimetype = 'application/pdf';
      }
      switch (false) {
        case !save:
          att.saveFile(a.path);
          break;
        case !Translator.testing:
          Translator.attachmentCounter += 1;
          a.path = "files/" + Translator.attachmentCounter + "/" + (att.localPath.replace(/.*[\/\\]/, ''));
          break;
        case !(Translator.exportPath && att.localPath.indexOf(Translator.exportPath) === 0):
          a.path = att.localPath.slice(Translator.exportPath.length);
      }
      attachments.push(a);
    }
    if (errors.length !== 0) {
      f.errors = errors;
    }
    if (attachments.length === 0) {
      return null;
    }
    attachments.sort(function(a, b) {
      if (a.mimetype === 'text/html' && b.mimetype !== 'text/html') {
        return 1;
      }
      if (b.mimetype === 'text/html' && a.mimetype !== 'text/html') {
        return -1;
      }
      return a.path.localeCompare(b.path);
    });
    if (Translator.attachmentsNoMetadata) {
      return ((function() {
        var l, len1, results;
        results = [];
        for (l = 0, len1 = attachments.length; l < len1; l++) {
          att = attachments[l];
          results.push(att.path.replace(/([\\{};])/g, "\\$1"));
        }
        return results;
      })()).join(';');
    }
    return ((function() {
      var l, len1, results;
      results = [];
      for (l = 0, len1 = attachments.length; l < len1; l++) {
        att = attachments[l];
        results.push(((function() {
          var len2, m, ref2, results1;
          ref2 = [att.title, att.path, att.mimetype];
          results1 = [];
          for (m = 0, len2 = ref2.length; m < len2; m++) {
            part = ref2[m];
            results1.push(part.replace(/([\\{}:;])/g, "\\$1"));
          }
          return results1;
        })()).join(':'));
      }
      return results;
    })()).join(';');
  };

  Reference.prototype.isBibVarRE = /^[a-z][a-z0-9_]*$/i;

  Reference.prototype.isBibVar = function(value) {
    return Translator.preserveBibTeXVariables && value && typeof value === 'string' && this.isBibVarRE.test(value);
  };


  /*
   * Add a field to the reference field set
   *
   * @param {field} field to add. 'name' must be set, and either 'value' or 'bibtex'. If you set 'bibtex', BBT will trust
   *   you and just use that as-is. If you set 'value', BBT will escape the value according the encoder passed in 'enc'; no
   *   'enc' means 'enc_latex'. If you pass both 'bibtex' and 'latex', 'bibtex' takes precedence (and 'value' will be
   *   ignored)
   */

  Reference.prototype.add = function(field) {
    var enc, ref1, value;
    if (!field.bibtex) {
      if (typeof field.value !== 'number' && !field.value) {
        return;
      }
      if (typeof field.value === 'string' && field.value.trim() === '') {
        return;
      }
      if (Array.isArray(field.value) && field.value.length === 0) {
        return;
      }
    }
    if (field.replace) {
      this.remove(field.name);
    }
    if (this.has[field.name] && !field.allowDuplicates) {
      throw "duplicate field '" + field.name + "' for " + this.item.__citekey__;
    }
    if (!field.bibtex) {
      Translator.debug('add:', {
        field: field,
        preserve: Translator.preserveBibTeXVariables,
        match: this.isBibVar(field.value)
      });
      if (typeof field.value === 'number' || (field.preserveBibTeXVariables && this.isBibVar(field.value))) {
        value = field.value;
      } else {
        enc = field.enc || ((ref1 = Translator.fieldEncoding) != null ? ref1[field.name] : void 0) || 'latex';
        value = this["enc_" + enc](field, (field.enc && field.enc !== 'creators' ? false : this.raw));
        if (!value) {
          return;
        }
        if (!(field.bare && !field.value.match(/\s/))) {
          value = "{" + value + "}";
        }
      }
      field.bibtex = "" + value;
    }
    if (this.normalize) {
      field.bibtex = field.bibtex.normalize('NFKC');
    }
    this.fields.push(field);
    return this.has[field.name] = field;
  };


  /*
   * Remove a field from the reference field set
   *
   * @param {name} field to remove.
   * @return {Object} the removed field, if present
   */

  Reference.prototype.remove = function(name) {
    var field, removed;
    if (!this.has[name]) {
      return;
    }
    removed = this.has[name];
    delete this.has[name];
    this.fields = (function() {
      var j, len, ref1, results;
      ref1 = this.fields;
      results = [];
      for (j = 0, len = ref1.length; j < len; j++) {
        field = ref1[j];
        if (field.name !== name) {
          results.push(field);
        }
      }
      return results;
    }).call(this);
    return removed;
  };

  Reference.prototype.normalize = typeof ''.normalize === 'function';

  Reference.prototype.postscript = function() {};

  Reference.prototype.complete = function() {
    var autoCase, cslvar, err, error, field, fields, j, l, len, len1, mapped, name, raw, ref, ref1, ref2, ref3, value;
    if (Translator.DOIandURL !== 'both') {
      if (this.has.doi && this.has.url) {
        switch (Translator.DOIandURL) {
          case 'doi':
            this.remove('url');
            break;
          case 'url':
            this.remove('doi');
        }
      }
    }
    fields = [];
    ref1 = this.override;
    for (name in ref1) {
      if (!hasProp.call(ref1, name)) continue;
      value = ref1[name];
      raw = ((ref2 = value.format) === 'naive' || ref2 === 'json');
      if (name === 'referencetype') {
        this.referencetype = value.value;
        continue;
      }
      if (name === 'PMID' || name === 'PMCID') {
        value.format = 'key-value';
        name = name.toLowerCase();
      }
      if (value.format === 'csl') {
        cslvar = Translator.CSLVariables[name];
        mapped = cslvar[(Translator.BetterBibLaTeX ? 'BibLaTeX' : 'BibTeX')];
        if (typeof mapped === 'function') {
          mapped = mapped.call(this);
        }
        autoCase = name === 'title' || name === 'shorttitle' || name === 'origtitle' || name === 'booktitle' || name === 'maintitle';
        if (mapped) {
          fields.push({
            name: mapped,
            value: value.value,
            autoCase: autoCase,
            enc: (cslvar.type === 'creator' ? 'creators' : cslvar.type)
          });
        } else {
          Translator.debug('Unmapped CSL field', name, '=', value.value);
        }
      } else {
        switch (name) {
          case 'mr':
            fields.push({
              name: 'mrnumber',
              value: value.value,
              raw: raw
            });
            break;
          case 'zbl':
            fields.push({
              name: 'zmnumber',
              value: value.value,
              raw: raw
            });
            break;
          case 'lccn':
          case 'pmcid':
            fields.push({
              name: name,
              value: value.value,
              raw: raw
            });
            break;
          case 'pmid':
          case 'arxiv':
          case 'jstor':
          case 'hdl':
            if (Translator.BetterBibLaTeX) {
              fields.push({
                name: 'eprinttype',
                value: name.toLowerCase()
              });
              fields.push({
                name: 'eprint',
                value: value.value,
                raw: raw
              });
            } else {
              fields.push({
                name: name,
                value: value.value,
                raw: raw
              });
            }
            break;
          case 'googlebooksid':
            if (Translator.BetterBibLaTeX) {
              fields.push({
                name: 'eprinttype',
                value: 'googlebooks'
              });
              fields.push({
                name: 'eprint',
                value: value.value,
                raw: raw
              });
            } else {
              fields.push({
                name: 'googlebooks',
                value: value.value,
                raw: raw
              });
            }
            break;
          case 'xref':
            fields.push({
              name: name,
              value: value.value,
              enc: 'raw'
            });
            break;
          default:
            fields.push({
              name: name,
              value: value.value,
              raw: raw
            });
        }
      }
    }
    ref3 = Translator.skipFields;
    for (j = 0, len = ref3.length; j < len; j++) {
      name = ref3[j];
      this.remove(name);
    }
    for (l = 0, len1 = fields.length; l < len1; l++) {
      field = fields[l];
      name = field.name.split('.');
      if (name.length > 1) {
        if (this.referencetype !== name[0]) {
          continue;
        }
        field.name = name[1];
      }
      if ((typeof field.value === 'string') && field.value.trim() === '') {
        this.remove(field.name);
        continue;
      }
      if (Translator.BibLaTeXDataFieldMap[field.name]) {
        field = this.clone(Translator.BibLaTeXDataFieldMap[field.name], field.value);
      }
      field.replace = true;
      this.add(field);
    }
    if (this.fields.length === 0) {
      this.add({
        name: 'type',
        value: this.referencetype
      });
    }
    try {
      this.postscript();
    } catch (error) {
      err = error;
      Translator.debug('postscript error:', err.message);
    }
    if (Translator.testing) {
      this.fields.sort(function(a, b) {
        return (a.name + " = " + a.value).localeCompare(b.name + " = " + b.value);
      });
    }
    ref = "@" + this.referencetype + "{" + this.item.__citekey__ + ",\n";
    ref += ((function() {
      var len2, m, ref4, results;
      ref4 = this.fields;
      results = [];
      for (m = 0, len2 = ref4.length; m < len2; m++) {
        field = ref4[m];
        results.push("  " + field.name + " = " + field.bibtex);
      }
      return results;
    }).call(this)).join(',\n');
    ref += '\n}\n\n';
    Zotero.write(ref);
    if (Translator.caching) {
      return Zotero.BetterBibTeX.cache.store(this.item.itemID, Translator, this.item.__citekey__, ref);
    }
  };

  Reference.prototype.toVerbatim = function(text) {
    var value;
    if (Translator.BetterBibTeX) {
      value = ('' + text).replace(/([#\\%&{}])/g, '\\$1');
    } else {
      value = ('' + text).replace(/([\\{}])/g, '\\$1');
    }
    if (!Translator.unicode) {
      value = value.replace(/[^\x21-\x7E]/g, (function(chr) {
        return '\\%' + ('00' + chr.charCodeAt(0).toString(16).slice(-2));
      }));
    }
    return value;
  };

  Reference.prototype.hasCreator = function(type) {
    return (this.item.creators || []).some(function(creator) {
      return creator.creatorType === type;
    });
  };

  return Reference;

})();

Language = new ((function() {
  function _Class() {
    var j, k, key, lang, len, ref1, ref2, v, value;
    this.babelMap = {
      af: 'afrikaans',
      am: 'amharic',
      ar: 'arabic',
      ast: 'asturian',
      bg: 'bulgarian',
      bn: 'bengali',
      bo: 'tibetan',
      br: 'breton',
      ca: 'catalan',
      cop: 'coptic',
      cy: 'welsh',
      cz: 'czech',
      da: 'danish',
      de_1996: 'ngerman',
      de_at_1996: 'naustrian',
      de_at: 'austrian',
      de_de_1996: 'ngerman',
      de: ['german', 'germanb'],
      dsb: ['lsorbian', 'lowersorbian'],
      dv: 'divehi',
      el: 'greek',
      el_polyton: 'polutonikogreek',
      en_au: 'australian',
      en_ca: 'canadian',
      en: 'english',
      en_gb: ['british', 'ukenglish'],
      en_nz: 'newzealand',
      en_us: ['american', 'usenglish'],
      eo: 'esperanto',
      es: 'spanish',
      et: 'estonian',
      eu: 'basque',
      fa: 'farsi',
      fi: 'finnish',
      fr_ca: ['acadian', 'canadian', 'canadien'],
      fr: ['french', 'francais'],
      fur: 'friulan',
      ga: 'irish',
      gd: ['scottish', 'gaelic'],
      gl: 'galician',
      he: 'hebrew',
      hi: 'hindi',
      hr: 'croatian',
      hsb: ['usorbian', 'uppersorbian'],
      hu: 'magyar',
      hy: 'armenian',
      ia: 'interlingua',
      id: ['indonesian', 'bahasa', 'bahasai', 'indon', 'meyalu'],
      is: 'icelandic',
      it: 'italian',
      ja: 'japanese',
      kn: 'kannada',
      la: 'latin',
      lo: 'lao',
      lt: 'lithuanian',
      lv: 'latvian',
      ml: 'malayalam',
      mn: 'mongolian',
      mr: 'marathi',
      nb: ['norsk', 'bokmal'],
      nl: 'dutch',
      nn: 'nynorsk',
      no: ['norwegian', 'norsk'],
      oc: 'occitan',
      pl: 'polish',
      pms: 'piedmontese',
      pt_br: ['brazil', 'brazilian'],
      pt: ['portuguese', 'portuges'],
      pt_pt: 'portuguese',
      rm: 'romansh',
      ro: 'romanian',
      ru: 'russian',
      sa: 'sanskrit',
      se: 'samin',
      sk: 'slovak',
      sl: ['slovenian', 'slovene'],
      sq_al: 'albanian',
      sr_cyrl: 'serbianc',
      sr_latn: 'serbian',
      sr: 'serbian',
      sv: 'swedish',
      syr: 'syriac',
      ta: 'tamil',
      te: 'telugu',
      th: ['thai', 'thaicjk'],
      tk: 'turkmen',
      tr: 'turkish',
      uk: 'ukrainian',
      ur: 'urdu',
      vi: 'vietnamese',
      zh_latn: 'pinyin',
      zh: 'pinyin',
      zlm: ['malay', 'bahasam', 'melayu']
    };
    ref1 = this.babelMap;
    for (key in ref1) {
      if (!hasProp.call(ref1, key)) continue;
      value = ref1[key];
      if (typeof value === 'string') {
        this.babelMap[key] = [value];
      }
    }
    this.babelList = [];
    ref2 = this.babelMap;
    for (k in ref2) {
      if (!hasProp.call(ref2, k)) continue;
      v = ref2[k];
      for (j = 0, len = v.length; j < len; j++) {
        lang = v[j];
        if (this.babelList.indexOf(lang) < 0) {
          this.babelList.push(lang);
        }
      }
    }
    this.cache = Object.create(null);
  }

  return _Class;

})());

Language.get_bigrams = function(string) {
  var i, s;
  s = string.toLowerCase();
  s = (function() {
    var j, ref1, results;
    results = [];
    for (i = j = 0, ref1 = s.length; 0 <= ref1 ? j < ref1 : j > ref1; i = 0 <= ref1 ? ++j : --j) {
      results.push(s.slice(i, i + 2));
    }
    return results;
  })();
  s.sort();
  return s;
};

Language.string_similarity = function(str1, str2) {
  var hit_count, pairs1, pairs2, union;
  pairs1 = this.get_bigrams(str1);
  pairs2 = this.get_bigrams(str2);
  union = pairs1.length + pairs2.length;
  hit_count = 0;
  while (pairs1.length > 0 && pairs2.length > 0) {
    if (pairs1[0] === pairs2[0]) {
      hit_count++;
      pairs1.shift();
      pairs2.shift();
      continue;
    }
    if (pairs1[0] < pairs2[0]) {
      pairs1.shift();
    } else {
      pairs2.shift();
    }
  }
  return (2 * hit_count) / union;
};

Language.lookup = function(langcode) {
  var j, lc, len, ref1;
  if (!this.cache[langcode]) {
    this.cache[langcode] = [];
    ref1 = Language.babelList;
    for (j = 0, len = ref1.length; j < len; j++) {
      lc = ref1[j];
      this.cache[langcode].push({
        lang: lc,
        sim: this.string_similarity(langcode, lc)
      });
    }
    this.cache[langcode].sort(function(a, b) {
      return b.sim - a.sim;
    });
  }
  return this.cache[langcode];
};