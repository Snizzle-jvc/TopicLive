import Message from './Message.js';
import TopicLive from './TopicLive.js';
const $ = require('ddd-jquery');

class Page {
  constructor($page) {
    // console.log('Nouvelle page.');
    this.$page = $page;
  }

  obtenirMessages() {
    // console.log('page.obtenirMessages()');
    const msgs = [];
    this.trouver(`${TopicLive.class_msg}:not(.msg-pseudo-blacklist)`).each(function() {
      msgs.push(new Message($(this)));
    });
    return msgs;
  }

  // Appele quand il y a des nouveaux messages
  maj() {
    console.log('Nouveaux messages ! Execution favicon/son/spoilers');
    if(localStorage.topiclive_son == 'true') {
      try { TopicLive.son.play(); }
      catch(err) { console.log(`### Erreur son : ${err}`); }
    }
    try { if(!TopicLive.ongletActif) TopicLive.favicon.maj(`${TopicLive.nvxMessages}`); }
    catch(err) { console.log(`### Erreur favicon (maj) : ${err}`); }
    try { this.Transformation(); }
    catch(err) { console.log(`### Erreur jsli.Transformation() : ${err}`); }

    // Nettoyage des anciens messages
    const nb_messages = $(`${TopicLive.class_msg}:not(.msg-pseudo-blacklist)`).size();
    if(nb_messages > 100) {
      $(`${TopicLive.class_msg}:not(.msg-pseudo-blacklist)`)
      .slice(0, nb_messages - 100)
      .remove();
    }

    console.log('Envoi de topiclive:doneprocessing');
    dispatchEvent(new CustomEvent('topiclive:doneprocessing', {
      'detail': { jvcake: TopicLive.jvCake }
    }));
  }

  scan() {
    // console.log('Scan de la page');
    TopicLive.ajaxTs = this.trouver('#ajax_timestamp_liste_messages').val();
    TopicLive.ajaxHash = this.trouver('#ajax_hash_liste_messages').val();

    // Maj du nombre de connectes
    $('.nb-connect-fofo').text(this.trouver('.nb-connect-fofo').text());

    if($(TopicLive.class_msg).length === 0 || $(TopicLive.class_page_fin).length !== 0) {
      console.log('Pas sur une derniere page : loop');
      TopicLive.majUrl(this);
      TopicLive.loop();
      return;
    }

    let maj = false;

    // Liste de messages
    const nvMsgs = this.obtenirMessages();
    const anciensMsgs = TopicLive.messages;

    // console.log('Verification des messages supprimes');
    try {
    if(!TopicLive.estMP) {
      for(const i in anciensMsgs) {
        if(!anciensMsgs.hasOwnProperty(i)) continue; // fix chrome
        let supprimer = true;
        for(const j in nvMsgs) {
          if(!nvMsgs.hasOwnProperty(j)) continue; // fix chrome
          if(anciensMsgs[i].id_message == nvMsgs[j].id_message) {
            supprimer = false;
            break;
          }
        }
        if(supprimer) TopicLive.messages[i].supprimer();
      }
    }
    } catch(err) { console.log(`### Erreur messages supprimes : ${err}`); }

    // console.log('Verification des nouveaux messages et editions');
    try {
    for(const k in nvMsgs) {
      if(!nvMsgs.hasOwnProperty(k)) continue; // fix chrome
      let nv = true;
      for(const l in anciensMsgs) {
        if(!anciensMsgs.hasOwnProperty(l)) continue; // fix chrome
        if(TopicLive.estMP) {
          if(anciensMsgs[l].trouver('.bloc-spoil-jv').length !== 0) {
            const ancienneDate = anciensMsgs[l].trouver(TopicLive.class_date).text();
          const nouvelleDate = nvMsgs[k].trouver(TopicLive.class_date).text();
          if(ancienneDate == nouvelleDate) {
              nv = false;
              break;
            }
          } else if(anciensMsgs[l].$message.text() == nvMsgs[k].$message.text()) {
            nv = false;
            break;
          }
        } else {
          if(anciensMsgs[l].id_message == nvMsgs[k].id_message) {
            nv = false;
            anciensMsgs[l].update(nvMsgs[k]);
            break;
          }
        }
      }
      if(nv) {
        // console.log('Nouveau message !');
        TopicLive.messages.push(nvMsgs[k]);
        TopicLive.nvxMessages++;
        nvMsgs[k].afficher();
        maj = true;
      }
    }
    } catch(err) { console.log(`Erreur nouveaux messages : ${err}`); }

    // Doit etre avant TopicLive.charger()
    TopicLive.majUrl(this);

    if(maj) {
      this.maj();
    }

    TopicLive.loop();
  }

  // Version perso de JvCare
  Transformation() {
    $('.JvCare').each(function () {
      const $span = $(this);
      let classes = $span.attr('class');
      const href = TopicLive.jvCake(classes);

      // Suppression de JvCare
      classes = classes.split(' ');
      const index = classes.indexOf('JvCare');
      classes.splice(index, index + 2);
      classes.unshift('xXx');
      classes = classes.join(' ');

      $span.replaceWith(`<a href="${href}" class="${classes}">${$span.html()}</a>`);
    });

    // Fix temporaire des avatars
    $('.user-avatar-msg').each(function () {
      const $elem = $(this);
      const newsrc = $elem.attr('data-srcset');
      if(newsrc != 'undefined') {
        $elem.attr('src', newsrc);
        $elem.removeAttr('data-srcset');
      }
    });
  }

  trouver(chose) {
    // console.log('Page.trouver : ' + chose);
    return this.$page.find(chose);
  }
}

export default Page;
