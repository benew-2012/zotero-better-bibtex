// Generated by CoffeeScript 1.10.0
var indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
  hasProp = {}.hasOwnProperty;

Zotero.BetterBibTeX.keymanager = new ((function() {
  var n;

  function _Class() {
    this.db = Zotero.BetterBibTeX.DB;
    this.log = Zotero.BetterBibTeX.log;
    this.resetJournalAbbrevs();
  }

  _Class.prototype.months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

  _Class.prototype.embeddedKeyRE = /\bbibtex: *([^\s\r\n]+)/;

  _Class.prototype.andersJohanssonKeyRE = /\bbiblatexcitekey\[([^\]]+)\]/;

  _Class.prototype.findKeysSQL = "select i.itemID as itemID, i.libraryID as libraryID, idv.value as extra from items i join itemData id on i.itemID = id.itemID join itemDataValues idv on idv.valueID = id.valueID join fields f on id.fieldID = f.fieldID where f.fieldName = 'extra' and not i.itemID in (select itemID from deletedItems) and (idv.value like '%bibtex:%' or idv.value like '%biblatexcitekey[%' or idv.value like '%biblatexcitekey{%')";

  _Class.prototype.integer = function(v) {
    var _v;
    if (typeof v === 'number' || v === null) {
      return v;
    }
    _v = parseInt(v);
    if (isNaN(_v)) {
      throw new Error((typeof v) + " '" + v + "' is not an integer-string");
    }
    return _v;
  };

  _Class.prototype.cache = function() {
    var key;
    return (function() {
      var i, len, ref, results;
      ref = this.db.keys.find();
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        key = ref[i];
        results.push(this.clone(key));
      }
      return results;
    }).call(this);
  };

  _Class.prototype.prime = function() {
    var assigned, i, itemID, key, len, ref, results, sql;
    sql = "select i.itemID as itemID from items i where itemTypeID not in (1, 14) and not i.itemID in (select itemID from deletedItems)";
    assigned = (function() {
      var i, len, ref, results;
      ref = this.db.keys.find();
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        key = ref[i];
        results.push(key.itemID);
      }
      return results;
    }).call(this);
    if (assigned.length > 0) {
      sql += " and not i.itemID in " + (Zotero.BetterBibTeX.DB.SQLite.Set(assigned));
    }
    ref = Zotero.DB.columnQuery(sql);
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      itemID = ref[i];
      results.push(this.get({
        itemID: itemID
      }, 'on-export'));
    }
    return results;
  };

  _Class.prototype.reset = function() {
    this.resetJournalAbbrevs();
    this.db.keys.removeWhere(function(obj) {
      return true;
    });
    return this.scan();
  };

  _Class.prototype.resetJournalAbbrevs = function() {
    return this.journalAbbrevs = {
      "default": {
        "container-title": {},
        "collection-title": {},
        "institution-entire": {},
        "institution-part": {},
        "nickname": {},
        "number": {},
        "title": {},
        "place": {},
        "hereinafter": {},
        "classic": {},
        "container-phrase": {},
        "title-phrase": {}
      }
    };
  };

  _Class.prototype.clearDynamic = function() {
    return this.db.keys.removeWhere(function(obj) {
      return obj.citekeyFormat;
    });
  };

  _Class.prototype.journalAbbrev = function(item) {
    var key, ref, ref1, ref2, ref3, style;
    if (item.journalAbbreviation) {
      return item.journalAbbreviation;
    }
    key = item.publicationTitle || item.reporter || item.code;
    if (!key) {
      return;
    }
    if (!Zotero.BetterBibTeX.pref.get('autoAbbrev')) {
      return;
    }
    style = Zotero.BetterBibTeX.pref.get('autoAbbrevStyle') || ((function() {
      var i, len, ref, results;
      ref = Zotero.Styles.getVisible();
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        style = ref[i];
        if (style.usesAbbreviation) {
          results.push(style);
        }
      }
      return results;
    })())[0].styleID;
    ((ref = this.journalAbbrevs['default']) != null ? (ref1 = ref['container-title']) != null ? ref1[key] : void 0 : void 0) || Zotero.Cite.getAbbreviation(style, this.journalAbbrevs, 'default', 'container-title', key);
    return ((ref2 = this.journalAbbrevs['default']) != null ? (ref3 = ref2['container-title']) != null ? ref3[key] : void 0 : void 0) || key;
  };

  _Class.prototype.extract = function(item, insitu) {
    var m;
    switch (false) {
      case !item.getField:
        if (insitu) {
          throw insitu + ": cannot extract in-situ for real items";
        }
        item = {
          itemID: item.id,
          extra: item.getField('extra')
        };
        break;
      case !!insitu:
        item = {
          itemID: item.itemID,
          extra: item.extra.slice(0)
        };
    }
    if (!item.extra) {
      return item;
    }
    m = this.embeddedKeyRE.exec(item.extra) || this.andersJohanssonKeyRE.exec(item.extra);
    if (!m) {
      return item;
    }
    item.extra = item.extra.replace(m[0], '').trim();
    item.__citekey__ = m[1].trim();
    if (item.__citekey__ === '') {
      delete item.__citekey__;
    }
    return item;
  };

  _Class.prototype.alphabet = (function() {
    var i, results;
    results = [];
    for (n = i = 0; i < 26; n = ++i) {
      results.push(String.fromCharCode('a'.charCodeAt() + n));
    }
    return results;
  })();

  _Class.prototype.postfix = function(n) {
    var postfix;
    if (n === 0) {
      return '';
    }
    n -= 1;
    postfix = '';
    while (n >= 0) {
      postfix = this.alphabet[n % 26] + postfix;
      n = parseInt(n / 26) - 1;
    }
    return postfix;
  };

  _Class.prototype.assign = function(item, pin) {
    var citekey, in_use, itemID, key, libraryID, postfix, postfixStyle, ref, ref1, ref2, res;
    ref = Zotero.BetterBibTeX.formatter.format(item), citekey = ref.citekey, postfixStyle = ref.postfix;
    if (citekey === (void 0) || citekey === null || citekey === '') {
      citekey = "zotero-" + ((ref1 = item.libraryID) === (void 0) || ref1 === null ? 'null' : item.libraryID) + "-" + item.itemID;
    }
    if (!citekey) {
      return null;
    }
    libraryID = this.integer(item.libraryID === void 0 ? Zotero.DB.valueQuery('select libraryID from items where itemID = ?', [item.itemID]) : item.libraryID);
    itemID = this.integer(item.itemID);
    in_use = (function() {
      var i, len, ref2, results;
      ref2 = this.db.keys.where(function(o) {
        return o.libraryID === libraryID && o.itemID !== itemID && o.citekey.indexOf(citekey) === 0;
      });
      results = [];
      for (i = 0, len = ref2.length; i < len; i++) {
        key = ref2[i];
        results.push(key.citekey);
      }
      return results;
    }).call(this);
    postfix = {
      n: 0,
      c: ''
    };
    while (ref2 = citekey + postfix.c, indexOf.call(in_use, ref2) >= 0) {
      postfix.n++;
      if (postfixStyle === '0') {
        postfix.c = "-" + postfix.n;
      } else {
        postfix.c = this.postfix(postfix.n);
      }
    }
    res = this.set(item, citekey + postfix.c, pin);
    return res;
  };

  _Class.prototype.selected = function(action) {
    var affected, i, ids, item, items, j, len, len1, params, results, warn, zoteroPane;
    if (action !== 'set' && action !== 'reset') {
      throw new Error("Unexpected action " + action);
    }
    zoteroPane = Zotero.getActiveZoteroPane();
    items = (function() {
      var i, len, ref, results;
      ref = zoteroPane.getSelectedItems();
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        item = ref[i];
        if (!item.isAttachment() && !item.isNote()) {
          results.push(item);
        }
      }
      return results;
    })();
    warn = Zotero.BetterBibTeX.pref.get('warnBulkModify');
    if (warn > 0 && items.length > warn) {
      ids = (function() {
        var i, len, results;
        results = [];
        for (i = 0, len = items.length; i < len; i++) {
          item = items[i];
          results.push(parseInt(item.itemID));
        }
        return results;
      })();
      if (action === 'set') {
        affected = items.length;
      } else {
        affected = this.db.keys.where(function(key) {
          var ref;
          return (ref = key.itemID, indexOf.call(ids, ref) >= 0) && !key.citekeyFormat;
        }).length;
      }
      if (affected > warn) {
        params = {
          treshold: warn,
          response: null
        };
        window.openDialog('chrome://zotero-better-bibtex/content/bulk-clear-confirm.xul', '', 'chrome,dialog,centerscreen,modal', params);
        switch (params.response) {
          case 'ok':
            break;
          case 'whatever':
            Zotero.BetterBibTeX.pref.set('warnBulkModify', 0);
            break;
          default:
            return;
        }
      }
    }
    for (i = 0, len = items.length; i < len; i++) {
      item = items[i];
      this.remove(item, action === 'set');
    }
    if (action === 'set') {
      results = [];
      for (j = 0, len1 = items.length; j < len1; j++) {
        item = items[j];
        results.push(this.assign(item, true));
      }
      return results;
    }
  };

  _Class.prototype.save = function(item, citekey) {
    var extra;
    if (!item.getField) {
      item = Zotero.Items.get(item.itemID);
    }
    extra = this.extract(item);
    if ((extra.__citekey__ === citekey) || (!citekey && !extra.__citekey__)) {
      return;
    }
    extra = extra.extra;
    citekey=citekey.trim();
    if (citekey) {
      extra += " \nbibtex: " + citekey;
    }
    extra = extra.trim();
    item.setField('extra', extra);
    return this.setCallNumber(item,citekey);
  };

  _Class.prototype.setCallNumber=function(item,citekey){
    item.setField('callNumber',citekey);
    if (item.isRegularItem()) { // not an attachment already
      var fulltext = new Array;
      var attachments = item.getAttachments(false);
      var a,archiveLocation;
      for (a in attachments) {
          var a_item = Zotero.Items.get(attachments[a]);
          if (a_item.attachmentMIMEType == 'application/pdf' && a_item.attachmentPath.length>0) {    //only pdf could be attached
            archiveLocation=a_item.key+'/'+citekey+'.pdf:PDF';
            fulltext.push(archiveLocation);
          }
      }
      for (a in attachments) {
          var a_item = Zotero.Items.get(attachments[a]);
          if (a_item.attachmentMIMEType == 'text/html' && a_item.attachmentPath.length>0) {    
            archiveLocation=a_item.key+'/'+a_item.attachmentPath.replace('storage:','','g').trim()+':URL';
            fulltext.push(archiveLocation);
          }
      }
      archiveLocation=fulltext.join(";:").trim();
      item.setField('archiveLocation',archiveLocation);
    }
    return item.save({
      skipDateModifiedUpdate: true
    });
  };

  _Class.prototype.set = function(item, citekey, pin) {
    var citekeyFormat, itemID, key, libraryID;
    if (!citekey || citekey.trim() === '') {
      throw new Error('Cannot set empty cite key');
    }
    if (!this.eligible(item)) {
      return;
    }
    if (!item.getField) {
      item = Zotero.Items.get(item.itemID);
    }
    itemID = this.integer(item.itemID);
    libraryID = this.integer(item.libraryID);
    citekeyFormat = pin ? null : Zotero.BetterBibTeX.citekeyFormat;
    key = this.db.keys.findOne({
      itemID: itemID
    });
    if (key && key.citekey === citekey && key.citekeyFormat === citekeyFormat) {
      this.setCallNumber(item,citekey);
      return this.verify(key);
    }
    if (key) {
      key.citekey = citekey;
      key.citekeyFormat = citekeyFormat;
      key.libraryID = libraryID;
      this.db.keys.update(key);
    } else {
      key = {
        itemID: itemID,
        libraryID: libraryID,
        citekey: citekey,
        citekeyFormat: citekeyFormat
      };
      this.db.keys.insert(key);
    }
    if (pin) {
      this.save(item, citekey);
    }
    return this.verify(key);
  };

  _Class.prototype.scan = function(ids, reason) {
    var cached, citekey, i, id, item, itemID, items, j, len, len1, libraryID, pinned, ref, results;
    if (reason === 'delete' || reason === 'trash') {
      ids = (function() {
        var i, len, ref, results;
        ref = ids || [];
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          id = ref[i];
          results.push(this.integer(id));
        }
        return results;
      }).call(this);
      this.db.keys.removeWhere(function(o) {
        var ref;
        return ref = o.itemID, indexOf.call(ids, ref) >= 0;
      });
      return;
    }
    switch (false) {
      case !!ids:
        items = Zotero.DB.query(this.findKeysSQL);
        break;
      case ids.length !== 0:
        items = [];
        break;
      case ids.length !== 1:
        items = Zotero.Items.get(ids[0]);
        items = items ? [items] : [];
        break;
      default:
        items = Zotero.Items.get(ids) || [];
    }
    pinned = {};
    for (i = 0, len = items.length; i < len; i++) {
      item = items[i];
      itemID = this.integer(item.itemID);
      citekey = this.extract(item).__citekey__;
      cached = this.db.keys.findOne({
        itemID: itemID
      });
      if (!(citekey && citekey !== '')) {
        continue;
      }
      if (!cached || cached.citekey !== citekey || cached.citekeyFormat !== null) {
        libraryID = this.integer(item.libraryID);
        if (cached) {
          cached.citekey = citekey;
          cached.citekeyFormat = null;
          cached.libraryID = libraryID;
          this.db.keys.update(cached);
        } else {
          cached = {
            itemID: itemID,
            libraryID: libraryID,
            citekey: citekey,
            citekeyFormat: null
          };
          this.db.keys.insert(cached);
        }
      }
      pinned['' + item.itemID] = cached.citekey;
    }
    ref = ids || [];
    results = [];
    for (j = 0, len1 = ref.length; j < len1; j++) {
      itemID = ref[j];
      if (pinned['' + itemID]) {
        continue;
      }
      this.remove({
        itemID: itemID
      }, true);
      results.push(this.get({
        itemID: itemID
      }, 'on-change'));
    }
    return results;
  };

  _Class.prototype.remove = function(item, soft) {
    this.db.keys.removeWhere({
      itemID: this.integer(item.itemID)
    });
    if (!soft) {
      return this.save(item);
    }
  };

  _Class.prototype.eligible = function(item) {
    var type;
    type = item.itemType;
    if (!type) {
      if (!item.itemTypeID) {
        item = Zotero.Items.get(item.itemID);
      }
      type = (function() {
        switch (item.itemTypeID) {
          case 1:
            return 'note';
          case 14:
            return 'attachment';
          default:
            return 'reference';
        }
      })();
    }
    if (type === 'note' || type === 'attachment') {
      return false;
    }
    return true;
  };

  _Class.prototype.verify = function(entry) {
    var key, value, verify;
    if (!(Zotero.BetterBibTeX.pref.get('debug') || Zotero.BetterBibTeX.testing)) {
      return entry;
    }
    verify = {
      citekey: true,
      citekeyFormat: null,
      itemID: true,
      libraryID: null
    };
    for (key in entry) {
      if (!hasProp.call(entry, key)) continue;
      value = entry[key];
      switch (false) {
        case key !== '$loki' && key !== 'meta':
          break;
        case verify[key] !== void 0:
          throw new Error("Unexpected field " + key + " in " + (typeof entry) + " " + (JSON.stringify(entry)));
          break;
        case !(verify[key] && typeof value === 'number'):
          delete verify[key];
          break;
        case !(verify[key] && typeof value === 'string' && value.trim() !== ''):
          delete verify[key];
          break;
        case !(verify[key] && !value):
          throw new Error("field " + key + " of " + (typeof entry) + " " + (JSON.stringify(entry)) + " may not be empty");
          break;
        default:
          delete verify[key];
      }
    }
    verify = Object.keys(verify);
    if (verify.length === 0) {
      return entry;
    }
    throw new Error("missing fields " + verify + " in " + (typeof entry) + " " + (JSON.stringify(entry)));
  };

  _Class.prototype.clone = function(key) {
    var clone;
    if (key === (void 0) || key === null) {
      return key;
    }
    clone = JSON.parse(JSON.stringify(key));
    delete clone.meta;
    delete clone['$loki'];
    this.verify(clone);
    return clone;
  };

  _Class.prototype.get = function(item, pinmode) {
    var cached, pin;
    if ((typeof item.itemID === 'undefined') && (typeof item.key !== 'undefined') && (typeof item.libraryID !== 'undefined')) {
      item = Zotero.Items.getByLibraryAndKey(item.libraryID, item.key);
    }
    if (!this.eligible(item)) {
      return;
    }
    pin = pinmode === Zotero.BetterBibTeX.pref.get('pinCitekeys');
    cached = this.db.keys.findOne({
      itemID: this.integer(item.itemID)
    });
    if (!cached || (pin && cached.citekeyFormat)) {
      cached = this.assign(item, pin);
    }
    return this.clone(cached);
  };

  _Class.prototype.resolve = function(citekeys, options) {
    var citekey, i, len, libraryID, resolved;
    if (options == null) {
      options = {};
    }
    if (options.libraryID === void 0) {
      options.libraryID = null;
    }
    libraryID = this.integer(options.libraryID);
    if (!Array.isArray(citekeys)) {
      citekeys = [citekeys];
    }
    resolved = {};
    for (i = 0, len = citekeys.length; i < len; i++) {
      citekey = citekeys[i];
      resolved[citekey] = this.db.keys.findObject({
        citekey: citekey,
        libraryID: libraryID
      });
    }
    return resolved;
  };

  _Class.prototype.alternates = function(item) {
    return Zotero.BetterBibTeX.formatter.alternates(item);
  };

  return _Class;

})());



function jsdump(str) {
  Components.classes['@mozilla.org/consoleservice;1']
            .getService(Components.interfaces.nsIConsoleService)
            .logStringMessage(str);
}
