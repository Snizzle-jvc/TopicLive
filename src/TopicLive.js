import Favicon from './Favicon.js'
import Formulaire from './Formulaire.js'
import Page from './Page.js'
import TLOption from './Option.js'
const $ = require('ddd-jquery');

class TopicLive {
  constructor() {
    console.log('Initialisation');
    this.instance = 0;
    this.ongletActif = true;
    this.favicon = new Favicon();
    this.son = new Audio('https://raw.githubusercontent.com/kiwec/TopicLive/master/notification.ogg');

    this.suivreOnglets();
    addEventListener('instantclick:newpage', () => this.init());

    $("head").append("<style type='text/css'>\
        .topiclive-loading:after { content: ' ○' }\
        .topiclive-loaded:after { content: ' ●' }\
      </style>");
  }

  ajouterOptions() {
    if(this.mobile) return;
    this.options = {
      optionSon: new TLOption('Son', 'topiclive_son')
    };
  }

  charger() {
    if(this.oldInstance != this.instance) {
      console.log('Nouvelle instance detectee : arret du chargement');
      return;
    }
    
    this.GET().then(data => new Page(data).scan());
  }

  // Sera initialise a chaque changement de page
  init() {
    if(typeof $ === 'undefined') {
      return console.log('### jQuery introuvable !');
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
    const analysable = (document.URL.match(/\/forums\//) || document.URL.match(/\/messages-prives\//));
    if(analysable && $(this.class_msg).length > 0) {
      console.log('TopicLive actif sur cette page.');
      this.page = new Page($(document));
      this.formu = new Formulaire();
      this.messages = this.page.obtenirMessages();
      this.nvxMessages = 0;
      this.page.scan();
      this.loop();
    } else {
      console.log('TopicLive sera inactif sur cette page');
    }
  }

  // Transforme une classe chiffree par JvCare en un lien
  jvCake(classe) {
    const base16 = '0A12B34C56D78E9F';
    let lien = '';
    const s = classe.split(' ')[1];
    for (let i = 0; i < s.length; i += 2) {
      lien += String.fromCharCode(base16.indexOf(s.charAt(i)) * 16 + base16.indexOf(s.charAt(i + 1)));
    }
    return lien;
  }

  alert(message) {
    try {
      modal('erreur', { message });
      console.log(message);
    } catch(err) {
      console.log('### Fonction modal() inaccessible');
      alert(message);
    }
  }

  loop() {
    if(typeof this.idanalyse !== 'undefined') window.clearTimeout(this.idanalyse);

    let duree = this.ongletActif ? 5000 : 10000;

    if(this.mobile)
      duree = 10000;

    this.oldInstance = this.instance;
    this.idanalyse = setTimeout(() => this.charger(), duree);
  }

  majUrl(page) {
    if(this.estMP) return;

    const $bouton = page.trouver(this.class_page_fin);
    const numPage = page.trouver(`${this.class_num_page}:first`).text();
    const testUrl = this.url.split('-');

    // Si le bouton page suivante est present
    if($bouton.length > 0) {
      console.log('Nouvelle URL (loop)');
      this.messages = [];
      if($bouton.prop('tagName') == 'A') {
        this.url = $bouton.attr('href');
      } else {
        this.url = this.jvCake($bouton.attr('class'));
      }
      // Si la page n'est pas la meme (ex. post d'un message sur nouvelle page)
    } else if(testUrl[3] != numPage) {
      console.log('Nouvelle URL (formulaire)');
      this.messages = [];
      testUrl[3] = numPage;
      this.url = testUrl.join('-');
    }
  }

  suivreOnglets() {
    $(window).bind('focus', () => {
      if(!this.ongletActif) {
        this.ongletActif = true;
        this.favicon.maj('');
        this.nvxMessages = 0;
      }
    });
    $(window).bind('blur', () => {
      if(this.ongletActif) {
        this.ongletActif = false;
        this.favicon.maj('');
        this.nvxMessages = 0;
      }
    });
  }

  GET() {
    const blocChargement = this.mobile ? $('.bloc-nom-sujet:last > span') : $('#bloc-formulaire-forum .titre-bloc');
    blocChargement.addClass('topiclive-loading');
    
    window.clearTimeout(this.idanalyse);
    return new Promise((resolve, reject) => {
      $.ajax({
        type: 'GET',
        url: this.url,
        timeout: 5000,
        success: data => {
          if(this.oldInstance != this.instance) {
            console.log('Nouvelle instance detectee : arret du chargement');
            return;
          }
      
          blocChargement.removeClass('topiclive-loading');
          blocChargement.addClass('topiclive-loaded');
          resolve($(data.substring(data.indexOf('<!DOCTYPE html>'))));
          setTimeout(() => { blocChargement.removeClass('topiclive-loaded'); }, 100);
          
          this.loop();
        },
        error() {
          this.loop();
          reject();
        }
      });
    });
  }
}

export default new TopicLive();
