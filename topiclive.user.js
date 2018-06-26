// ==UserScript==
// @name TopicLive
// @description Charge les nouveaux messages d'un topic de JVC en direct
// @author kiwec
// @match http://www.jeuxvideo.com/*
// @match http://m.jeuxvideo.com/*
// @run-at document-end
// @version 5.3.0-dev
// @grant none
// @noframes
// ==/UserScript==

(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _TopicLive = require('./TopicLive.js');

var _TopicLive2 = _interopRequireDefault(_TopicLive);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// Code de Spawnkill
var Favicon = function () {
  function Favicon() {
    _classCallCheck(this, Favicon);

    try {
      this.init();
    } catch (err) {
      _TopicLive2.default.log('### Erreur init favicon : ' + err);
    }
  }

  _createClass(Favicon, [{
    key: 'clear',
    value: function clear() {
      this.context.clearRect(0, 0, this.canv.width, this.canv.height);
      this.context.drawImage(this.image, 0, 0);
    }
  }, {
    key: 'init',
    value: function init() {
      this.canv = $('<canvas>').get(0);
      this.canv.width = 16;
      this.canv.height = 16;
      this.context = this.canv.getContext('2d');
      this.image = new Image();
      this.image.src = '/favicon.ico';

      try {
        this.maj('');
      } catch (err) {
        _TopicLive2.default.log('### Erreur favicon (init) : ' + err);
      }
    }
  }, {
    key: 'maj',
    value: function maj(txt) {
      this.clear();

      if (txt !== '') {
        this.context.fillStyle = 'red';
        this.context.fillRect(0, 0, this.context.measureText(txt).width + 3, 11);
        this.context.fillStyle = 'white';
        this.context.font = 'bold 10px Verdana';
        this.context.textBaseline = 'bottom';
        this.context.fillText(txt, 1, 11);
      }

      this.replace();
    }
  }, {
    key: 'replace',
    value: function replace() {
      $('link[rel*="icon"]').remove();
      this.lien = $('<link>', {
        href: this.canv.toDataURL('image/png'),
        rel: 'shortcut icon',
        type: 'image/png'
      });
      $('head').append(this.lien);
    }
  }]);

  return Favicon;
}();

exports.default = Favicon;

},{"./TopicLive.js":6}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Page = require('./Page.js');

var _Page2 = _interopRequireDefault(_Page);

var _TopicLive = require('./TopicLive.js');

var _TopicLive2 = _interopRequireDefault(_TopicLive);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Formulaire = function () {
  function Formulaire() {
    _classCallCheck(this, Formulaire);

    // TopicLive.log('Nouveau formulaire.');
    this.hook();
  }

  _createClass(Formulaire, [{
    key: 'afficherErreurs',
    value: function afficherErreurs(msg) {
      if (typeof msg !== 'undefined') {
        var message_erreur = '';
        for (var i = 0; i < msg.length; i++) {
          message_erreur += msg[i];
          if (i < msg.length) message_erreur += '<br />';
        }
        _TopicLive2.default.alert(message_erreur);
      }
    }
  }, {
    key: 'envoyer',
    value: function envoyer(e) {
      var _this = this;

      // Si le message est invalide selon JVC
      if (typeof e !== 'undefined' && typeof e.errors !== 'undefined' && e.errors.length) {
        this.afficherErreurs(e.erreurs);
      } else {
        _TopicLive2.default.log('Message valide. Envoi en cours');
        this.trouver('.btn-poster-msg').attr('disabled', 'disabled');
        this.trouver('.conteneur-editor').fadeOut();

        window.clearTimeout(_TopicLive2.default.idanalyse);
        $.ajax({
          type: 'POST',
          url: _TopicLive2.default.url,
          data: this.obtenirFormulaire().serializeArray(),
          timeout: 5000,
          success: function success(data) {
            switch (typeof data === 'undefined' ? 'undefined' : _typeof(data)) {
              case 'object':
                // MaJ du formulaire via JSON
                if (data.hidden_reset) {
                  _this.trouver('input[type="hidden"]').remove();
                  _this.obtenirFormulaire().append(data.hidden_reset);
                }

                // Erreur lors de l'envoi du message
                if (data.errors) {
                  _this.afficherErreurs(data.errors);
                  _this.trouver('.btn-poster-msg').removeAttr('disabled');
                  _this.trouver('.conteneur-editor').fadeIn();
                }

                // Redirection via JSON (wtf)
                if (data.redirect_uri) {
                  _TopicLive2.default.log('Redirection du formulaire vers ' + data.redirect_uri);
                  _TopicLive2.default.url = data.redirect_uri;
                  _TopicLive2.default.GET().then(function () {
                    return _this.verifEnvoi();
                  });
                }
                break;
              case 'string':
                _this.verifEnvoi($(data.substring(data.indexOf('<!DOCTYPE html>'))));
                break;
              case 'undefined': /* falls through */
              default:
                _TopicLive2.default.alert('Erreur inconnue lors de l\'envoi du message.');
                _this.trouver('.btn-poster-msg').removeAttr('disabled');
                _this.trouver('.conteneur-editor').fadeIn();
                break;
            }

            _TopicLive2.default.loop();
          },
          error: function error(err) {
            _TopicLive2.default.alert('Erreur lors de l\'envoi du message : ' + err);
          }
        });
      }
    }
  }, {
    key: 'hook',
    value: function hook() {
      var _this2 = this;

      // Remplacement du bouton de post
      var $form = this.obtenirFormulaire();
      var $bouton = $form.find('.btn-poster-msg');
      $bouton.off();
      $bouton.removeAttr('data-push');
      $bouton.attr('type', 'button');
      $bouton.on('click', function () {
        return _this2.verifMessage();
      });
    }
  }, {
    key: 'maj',
    value: function maj($nvform) {
      _TopicLive2.default.log('Mise a jour du formulaire');
      var $form = this.obtenirFormulaire();
      var $cap = this.obtenirCaptcha($form);
      var $ncap = this.obtenirCaptcha($nvform);

      // Remplacement hashs formulaire
      this.trouver('input[type="hidden"]').remove();
      $nvform.find('input[type="hidden"]').each(function () {
        $form.append($(this));
      });

      // Reactivation des boutons
      this.trouver('.btn-poster-msg').removeAttr('disabled');
      this.trouver('.conteneur-editor').fadeIn();

      // Remplacement du captcha
      $cap.remove();
      this.trouver('.jv-editor').after($ncap);

      // Maj banniere erreur
      this.trouver('.alert-danger').remove();
      this.trouver('.row:first').before($nvform.find('.alert-danger'));

      // Remplacement du message (JVC n'effacera pas le message en erreur)
      this.obtenirMessage().val(this.obtenirMessage($nvform).val());

      this.hook();
    }
  }, {
    key: 'obtenirCaptcha',
    value: function obtenirCaptcha($form) {
      if (typeof $form === 'undefined') $form = this.obtenirFormulaire();
      return $form.find('.jv-editor').next('div');
    }
  }, {
    key: 'obtenirMessage',
    value: function obtenirMessage($form) {
      if (typeof $form == 'undefined') $form = this.obtenirFormulaire();
      return $form.find(_TopicLive2.default.estMP ? '#message' : '#message_topic');
    }
  }, {
    key: 'obtenirFormulaire',
    value: function obtenirFormulaire($page) {
      if (typeof $page === 'undefined') $page = $(document);
      return $page.find(_TopicLive2.default.estMP ? '#repondre-mp > form' : '.form-post-message');
    }
  }, {
    key: 'verifEnvoi',
    value: function verifEnvoi(data) {
      var nvPage = new _Page2.default(data);
      var $formu = this.obtenirFormulaire(nvPage.$page);
      this.maj($formu);
      _TopicLive2.default.majUrl(nvPage);
      nvPage.scan();
    }
  }, {
    key: 'verifMessage',
    value: function verifMessage() {
      var _this3 = this;

      _TopicLive2.default.log('Verification du message avant envoi');

      if (_TopicLive2.default.estMP) {
        this.envoyer();
      } else {
        $.ajax({
          type: 'POST',
          url: '/forums/ajax_check_poste_message.php',
          data: {
            id_topic: id_topic, // global
            new_message: this.obtenirMessage().val(),
            ajax_timestamp: _TopicLive2.default.ajaxTs,
            ajax_hash: _TopicLive2.default.ajaxHash
          },
          dataType: 'json',
          timeout: 5000,
          success: function success(err) {
            return _this3.envoyer(err);
          },
          error: function error() {
            return _this3.verifMessage();
          }
        });
      }

      return false;
    }
  }, {
    key: 'trouver',
    value: function trouver(chose) {
      return this.obtenirFormulaire().find(chose);
    }
  }]);

  return Formulaire;
}();

exports.default = Formulaire;

},{"./Page.js":5,"./TopicLive.js":6}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _TopicLive = require('./TopicLive.js');

var _TopicLive2 = _interopRequireDefault(_TopicLive);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Message = function () {
    function Message($message) {
        _classCallCheck(this, Message);

        if (_TopicLive2.default.estMP) {
            this.id_message = 'MP';
        } else if (_TopicLive2.default.mobile) {
            var id = $message.attr('id');
            id = id.slice(id.indexOf('_') + 1);
            this.id_message = parseInt(id, 10);
        } else {
            this.id_message = parseInt($message.attr('data-id'), 10);
        }

        this.date = $(_TopicLive2.default.class_date, $message).text().replace(/[\r\n]|#[0-9]+$/g, '');
        this.edition = $message.find('.info-edition-msg').text();
        this.$message = $message;
        this.pseudo = $('.bloc-pseudo-msg', $message).text().replace(/[\r\n]/g, '');
        this.supprime = false;
    }

    _createClass(Message, [{
        key: 'afficher',
        value: function afficher() {
            _TopicLive2.default.log('Affichage du message ' + this.id_message);
            this.$message.hide();
            this.fixBlacklist();
            this.fixCitation();
            this.fixDeroulerCitation();
            if (_TopicLive2.default.mobile) {
                this.fixMobile();
            }
            $(_TopicLive2.default.class_msg + ':last').after(this.$message);
            this.$message.fadeIn('slow');

            dispatchEvent(new CustomEvent('topiclive:newmessage', {
                'detail': {
                    id: this.id_message,
                    jvcake: _TopicLive2.default.jvCake
                }
            }));
        }
    }, {
        key: 'fixBlacklist',
        value: function fixBlacklist() {
            this.trouver('.bloc-options-msg > .picto-msg-tronche, .msg-pseudo-blacklist .btn-blacklist-cancel').on('click', function () {
                $.ajax({
                    url: '/forums/ajax_forum_blacklist.php',
                    data: {
                        id_alias_msg: this.$message.attr('data-id-alias'),
                        action: this.$message.attr('data-action'),
                        ajax_hash: $('#ajax_hash_preference_user')
                    },
                    dataType: 'json',
                    success: function success(e) {
                        if (e.erreur && e.erreur.length) {
                            _TopicLive2.default.alert(e.erreur);
                        } else {
                            document.location.reload();
                        }
                    }
                });
            });
        }
    }, {
        key: 'fixCitation',
        value: function fixCitation() {
            var _this = this;

            _TopicLive2.default.log('Obtention de la citation du message ' + this.id_message);
            this.$message.find('.bloc-options-msg .picto-msg-quote').on('click', function () {
                $.ajax({
                    type: 'POST',
                    url: '/forums/ajax_citation.php',
                    data: {
                        id_message: _this.id_message,
                        ajax_timestamp: _TopicLive2.default.ajaxTs,
                        ajax_hash: _TopicLive2.default.ajaxHash
                    },
                    dataType: 'json',
                    timeout: 5000,
                    success: function success(e) {
                        _TopicLive2.default.log('Citation du message ' + _this.id_message + ' recue avec succes');
                        var $msg = _TopicLive2.default.formu.obtenirMessage();
                        var nvmsg = '> Le ' + _this.date + ' ' + _this.pseudo + ' a \xE9crit :\n>';
                        nvmsg += e.txt.split('\n').join('\n> ') + '\n\n';
                        if ($msg.val() === '') {
                            $msg.val(nvmsg);
                        } else {
                            $msg.val($msg.val() + '\n\n' + nvmsg);
                        }
                    },
                    error: function error() {
                        return _this.fixCitation();
                    }
                });
            });
        }
    }, {
        key: 'fixDeroulerCitation',
        value: function fixDeroulerCitation() {
            this.trouver('blockquote').click(function () {
                $(this).attr('data-visible', '1');
            });
        }
    }, {
        key: 'fixMobile',
        value: function fixMobile() {
            this.trouver('.message').addClass('show-all');
        }
    }, {
        key: 'trouver',
        value: function trouver(chose) {
            return this.$message.find(chose);
        }

        // Change le CSS du message pour indiquer qu'il est supprime

    }, {
        key: 'supprimer',
        value: function supprimer() {
            _TopicLive2.default.log('Alerte suppression du message ' + this.id_message);
            if (!this.supprime) {
                this.trouver('.bloc-options-msg').hide();

                // Clignotement du messages
                this.$message.animate({
                    backgroundColor: '#3399FF'
                }, 50);
                this.$message.animate({
                    backgroundColor: '#D1F0FF'
                }, 500);

                this.supprime = true;
            }
        }
    }, {
        key: 'update',
        value: function update(nvMessage) {
            if (this.edition == nvMessage.edition) return;
            _TopicLive2.default.log('Message ' + this.id_message + ' edite : mise a jour');

            this.edition = nvMessage.edition;
            this.trouver(_TopicLive2.default.class_contenu).html(nvMessage.trouver(_TopicLive2.default.class_contenu).html());

            dispatchEvent(new CustomEvent('topiclive:edition', {
                'detail': {
                    id: this.id_message,
                    jvcake: _TopicLive2.default.jvCake
                }
            }));

            // Clignotement du messages
            var defColor = this.$message.css('backgroundColor');
            this.$message.animate({
                backgroundColor: '#FF9900'
            }, 50);
            this.$message.animate({
                backgroundColor: defColor
            }, 500);
        }
    }]);

    return Message;
}();

exports.default = Message;

},{"./TopicLive.js":6}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TLOption = function () {
  function TLOption(nom, id) {
    _classCallCheck(this, TLOption);

    this.actif = localStorage[id] == 'true';
    this.nom = nom;
    this.id = id;

    this.injecter();
  }

  _createClass(TLOption, [{
    key: 'injecter',
    value: function injecter() {
      var _this = this;

      // Ajout de l'option aux options JVC
      var option = '<li><span class="pull-left">TopicLive - ' + this.nom + '</span>';
      option += '<input type="checkbox" class="input-on-off" id="' + this.id + '" ';
      option += this.actif ? 'checked>' : '>';
      option += '<label for="' + this.id + '" class="btn-on-off"></label></li>';
      $('.menu-user-forum').append(option);

      // Register des events lors du toggle de l'option
      this.bouton = $('#' + this.id);
      this.bouton.change(function () {
        _this.actif = !_this.actif;
        localStorage[_this.id] = _this.actif;
      });
    }
  }]);

  return TLOption;
}();

exports.default = TLOption;

},{}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Message = require('./Message.js');

var _Message2 = _interopRequireDefault(_Message);

var _TopicLive = require('./TopicLive.js');

var _TopicLive2 = _interopRequireDefault(_TopicLive);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Page = function () {
  function Page($page) {
    _classCallCheck(this, Page);

    // TopicLive.log('Nouvelle page.');
    this.$page = $page;
  }

  _createClass(Page, [{
    key: 'obtenirMessages',
    value: function obtenirMessages() {
      // TopicLive.log('page.obtenirMessages()');
      var msgs = [];
      this.trouver(_TopicLive2.default.class_msg + ':not(.msg-pseudo-blacklist)').each(function () {
        msgs.push(new _Message2.default($(this)));
      });
      return msgs;
    }

    // Appele quand il y a des nouveaux messages

  }, {
    key: 'maj',
    value: function maj() {
      _TopicLive2.default.log('Nouveaux messages ! Execution favicon/son/spoilers');
      if (localStorage.topiclive_son == 'true') {
        try {
          _TopicLive2.default.son.play();
        } catch (err) {
          _TopicLive2.default.log('### Erreur son : ' + err);
        }
      }
      try {
        if (!_TopicLive2.default.ongletActif) _TopicLive2.default.favicon.maj('' + _TopicLive2.default.nvxMessages);
      } catch (err) {
        _TopicLive2.default.log('### Erreur favicon (maj) : ' + err);
      }
      try {
        this.Transformation();
      } catch (err) {
        _TopicLive2.default.log('### Erreur jsli.Transformation() : ' + err);
      }

      // Nettoyage des anciens messages
      var nb_messages = $(_TopicLive2.default.class_msg + ':not(.msg-pseudo-blacklist)').size();
      if (nb_messages > 100) {
        $(_TopicLive2.default.class_msg + ':not(.msg-pseudo-blacklist)').slice(0, nb_messages - 100).remove();
      }

      _TopicLive2.default.log('Envoi de topiclive:doneprocessing');
      dispatchEvent(new CustomEvent('topiclive:doneprocessing', {
        'detail': { jvcake: _TopicLive2.default.jvCake }
      }));
    }
  }, {
    key: 'scan',
    value: function scan() {
      // TopicLive.log('Scan de la page');
      _TopicLive2.default.ajaxTs = this.trouver('#ajax_timestamp_liste_messages').val();
      _TopicLive2.default.ajaxHash = this.trouver('#ajax_hash_liste_messages').val();

      // Maj du nombre de connectes
      $('.nb-connect-fofo').text(this.trouver('.nb-connect-fofo').text());

      if ($(_TopicLive2.default.class_msg).length === 0 || $(_TopicLive2.default.class_page_fin).length !== 0) {
        _TopicLive2.default.log('Pas sur une derniere page : loop');
        _TopicLive2.default.majUrl(this);
        _TopicLive2.default.loop();
        return;
      }

      var maj = false;

      // Liste de messages
      var nvMsgs = this.obtenirMessages();
      var anciensMsgs = _TopicLive2.default.messages;

      // TopicLive.log('Verification des messages supprimes');
      try {
        if (!_TopicLive2.default.estMP) {
          for (var i in anciensMsgs) {
            if (!anciensMsgs.hasOwnProperty(i)) continue; // fix chrome
            var supprimer = true;
            for (var j in nvMsgs) {
              if (!nvMsgs.hasOwnProperty(j)) continue; // fix chrome
              if (anciensMsgs[i].id_message == nvMsgs[j].id_message) {
                supprimer = false;
                break;
              }
            }
            if (supprimer) _TopicLive2.default.messages[i].supprimer();
          }
        }
      } catch (err) {
        _TopicLive2.default.log('### Erreur messages supprimes : ' + err);
      }

      // TopicLive.log('Verification des nouveaux messages et editions');
      try {
        for (var k in nvMsgs) {
          if (!nvMsgs.hasOwnProperty(k)) continue; // fix chrome
          var nv = true;
          for (var l in anciensMsgs) {
            if (!anciensMsgs.hasOwnProperty(l)) continue; // fix chrome
            if (_TopicLive2.default.estMP) {
              if (anciensMsgs[l].trouver('.bloc-spoil-jv').length !== 0) {
                var ancienneDate = anciensMsgs[l].trouver(_TopicLive2.default.class_date).text();
                var nouvelleDate = nvMsgs[k].trouver(_TopicLive2.default.class_date).text();
                if (ancienneDate == nouvelleDate) {
                  nv = false;
                  break;
                }
              } else if (anciensMsgs[l].$message.text() == nvMsgs[k].$message.text()) {
                nv = false;
                break;
              }
            } else {
              if (anciensMsgs[l].id_message == nvMsgs[k].id_message) {
                nv = false;
                anciensMsgs[l].update(nvMsgs[k]);
                break;
              }
            }
          }
          if (nv) {
            // TopicLive.log('Nouveau message !');
            _TopicLive2.default.messages.push(nvMsgs[k]);
            _TopicLive2.default.nvxMessages++;
            nvMsgs[k].afficher();
            maj = true;
          }
        }
      } catch (err) {
        _TopicLive2.default.log('Erreur nouveaux messages : ' + err);
      }

      // Doit etre avant TopicLive.charger()
      _TopicLive2.default.majUrl(this);

      if (maj) {
        this.maj();
      }

      _TopicLive2.default.loop();
    }

    // Version perso de JvCare

  }, {
    key: 'Transformation',
    value: function Transformation() {
      $('.JvCare').each(function () {
        var $span = $(this);
        var classes = $span.attr('class');
        var href = _TopicLive2.default.jvCake(classes);

        // Suppression de JvCare
        classes = classes.split(' ');
        var index = classes.indexOf('JvCare');
        classes.splice(index, index + 2);
        classes.unshift('xXx');
        classes = classes.join(' ');

        $span.replaceWith('<a href="' + href + '" class="' + classes + '">' + $span.html() + '</a>');
      });

      // Fix temporaire des avatars
      $('.user-avatar-msg').each(function () {
        var $elem = $(this);
        var newsrc = $elem.attr('data-srcset');
        if (newsrc != 'undefined') {
          $elem.attr('src', newsrc);
          $elem.removeAttr('data-srcset');
        }
      });
    }
  }, {
    key: 'trouver',
    value: function trouver(chose) {
      // TopicLive.log('Page.trouver : ' + chose);
      return this.$page.find(chose);
    }
  }]);

  return Page;
}();

exports.default = Page;

},{"./Message.js":3,"./TopicLive.js":6}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Favicon = require('./Favicon.js');

var _Favicon2 = _interopRequireDefault(_Favicon);

var _Formulaire = require('./Formulaire.js');

var _Formulaire2 = _interopRequireDefault(_Formulaire);

var _Page = require('./Page.js');

var _Page2 = _interopRequireDefault(_Page);

var _Option = require('./Option.js');

var _Option2 = _interopRequireDefault(_Option);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TopicLive = function () {
  function TopicLive() {
    var _this = this;

    _classCallCheck(this, TopicLive);

    this.log('Initialisation');
    this.instance = 0;
    this.ongletActif = true;
    this.favicon = new _Favicon2.default();
    this.son = new Audio('https://raw.githubusercontent.com/Kiwec/TopicLive/master/notification.ogg');

    this.suivreOnglets();
    this.init();
    addEventListener('instantclick:newpage', function () {
      return _this.init();
    });

    $("head").append("<style type='text/css'>\
        .topiclive-loading:after { content: ' ○' }\
        .topiclive-loaded:after { content: ' ●' }\
      </style>");
  }

  _createClass(TopicLive, [{
    key: 'ajouterOptions',
    value: function ajouterOptions() {
      if (this.mobile) return;
      this.options = {
        optionSon: new _Option2.default('Son', 'topiclive_son')
      };
    }
  }, {
    key: 'charger',
    value: function charger() {
      if (this.oldInstance != this.instance) {
        this.log('Nouvelle instance detectee : arret du chargement');
        return;
      }

      this.GET().then(function (data) {
        return new _Page2.default(data).scan();
      });
    }

    // Sera initialise a chaque changement de page

  }, {
    key: 'init',
    value: function init() {
      if (typeof $ === 'undefined') {
        return this.log('### jQuery introuvable !');
      }

      this.instance++;
      this.ajaxTs = $('#ajax_timestamp_liste_messages').val();
      this.ajaxHash = $('#ajax_hash_liste_messages').val();
      this.estMP = $('.mp-page').length;
      this.url = this.estMP ? document.URL.substring(0, document.URL.indexOf('&')) : document.URL;
      this.mobile = document.URL.includes('//m.jeuxvideo.com');

      this.class_msg = this.mobile ? '.post' : '.bloc-message-forum';
      this.class_num_page = this.mobile ? '.num-page' : '.page-active';
      this.class_page_fin = this.mobile ? '.right-elt > a' : '.pagi-fin-actif';
      this.class_date = this.mobile ? '.date-post' : '.bloc-date-msg';
      this.class_contenu = this.mobile ? '.contenu' : '.bloc-contenu';

      this.ajouterOptions();

      // Actif sur les URL de forums ou de messages privés, tant qu'il y a un
      // message dans la page.
      // -> Sera compatible respeed, sans pour autant s'exécuter sur des pages
      //    non supportées (ex. GTA)
      var analysable = document.URL.match(/\/forums\//) || document.URL.match(/\/messages-prives\//);
      if (analysable && $(this.class_msg).length > 0) {
        this.log('TopicLive actif sur cette page.');
        this.page = new _Page2.default($(document));
        this.formu = new _Formulaire2.default();
        this.messages = this.page.obtenirMessages();
        this.nvxMessages = 0;
        this.page.scan();
        this.loop();
      } else {
        this.log('TopicLive sera inactif sur cette page');
      }
    }

    // Transforme une classe chiffree par JvCare en un lien

  }, {
    key: 'jvCake',
    value: function jvCake(classe) {
      var base16 = '0A12B34C56D78E9F';
      var lien = '';
      var s = classe.split(' ')[1];
      for (var i = 0; i < s.length; i += 2) {
        lien += String.fromCharCode(base16.indexOf(s.charAt(i)) * 16 + base16.indexOf(s.charAt(i + 1)));
      }
      return lien;
    }
  }, {
    key: 'alert',
    value: function (_alert) {
      function alert(_x) {
        return _alert.apply(this, arguments);
      }

      alert.toString = function () {
        return _alert.toString();
      };

      return alert;
    }(function (message) {
      try {
        modal('erreur', { message: message });
        this.log(message);
      } catch (err) {
        this.log('### Fonction modal() inaccessible');
        alert(message);
      }
    })
  }, {
    key: 'log',
    value: function log(message) {
      console.log('[TopicLive] ' + message);
    }
  }, {
    key: 'loop',
    value: function loop() {
      var _this2 = this;

      if (typeof this.idanalyse !== 'undefined') window.clearTimeout(this.idanalyse);

      var duree = this.ongletActif ? 5000 : 10000;

      if (this.mobile) duree = 10000;

      this.oldInstance = this.instance;
      this.idanalyse = setTimeout(function () {
        return _this2.charger();
      }, duree);
    }
  }, {
    key: 'majUrl',
    value: function majUrl(page) {
      if (this.estMP) return;

      var $bouton = page.trouver(this.class_page_fin);
      var numPage = page.trouver(this.class_num_page + ':first').text();
      var testUrl = this.url.split('-');

      // Si le bouton page suivante est present
      if ($bouton.length > 0) {
        this.log('Nouvelle URL (loop)');
        this.messages = [];
        if ($bouton.prop('tagName') == 'A') {
          this.url = $bouton.attr('href');
        } else {
          this.url = this.jvCake($bouton.attr('class'));
        }
        // Si la page n'est pas la meme (ex. post d'un message sur nouvelle page)
      } else if (testUrl[3] != numPage) {
        this.log('Nouvelle URL (formulaire)');
        this.messages = [];
        testUrl[3] = numPage;
        this.url = testUrl.join('-');
      }
    }
  }, {
    key: 'suivreOnglets',
    value: function suivreOnglets() {
      var _this3 = this;

      $(window).bind('focus', function () {
        if (!_this3.ongletActif) {
          _this3.ongletActif = true;
          _this3.favicon.maj('');
          _this3.nvxMessages = 0;
        }
      });
      $(window).bind('blur', function () {
        if (_this3.ongletActif) {
          _this3.ongletActif = false;
          _this3.favicon.maj('');
          _this3.nvxMessages = 0;
        }
      });
    }
  }, {
    key: 'GET',
    value: function GET() {
      var _this4 = this;

      var blocChargement = this.mobile ? $('.bloc-nom-sujet:last > span') : $('#bloc-formulaire-forum .titre-bloc');
      blocChargement.addClass('topiclive-loading');

      window.clearTimeout(this.idanalyse);
      return new Promise(function (resolve, reject) {
        $.ajax({
          type: 'GET',
          url: _this4.url,
          timeout: 5000,
          success: function success(data) {
            if (_this4.oldInstance != _this4.instance) {
              _this4.log('Nouvelle instance detectee : arret du chargement');
              return;
            }

            blocChargement.removeClass('topiclive-loading');
            blocChargement.addClass('topiclive-loaded');
            resolve($(data.substring(data.indexOf('<!DOCTYPE html>'))));
            setTimeout(function () {
              blocChargement.removeClass('topiclive-loaded');
            }, 100);

            _this4.loop();
          },
          error: function error() {
            this.loop();
            reject();
          }
        });
      });
    }
  }]);

  return TopicLive;
}();

exports.default = new TopicLive();

},{"./Favicon.js":1,"./Formulaire.js":2,"./Option.js":4,"./Page.js":5}],7:[function(require,module,exports){
'use strict';

var _TopicLive = require('./TopicLive.js');

var _TopicLive2 = _interopRequireDefault(_TopicLive);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_TopicLive2.default.log('TopicLive initialisé !');

},{"./TopicLive.js":6}]},{},[7])



//# sourceMappingURL=topiclive.user.js.map
