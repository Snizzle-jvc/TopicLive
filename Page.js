function Page($page)
{
  // TL.log('Nouvelle page.');
  this.$page = $page;
}

Page.prototype.obtenirMessages = function()
{
  // TL.log('page.obtenirMessages()');
  var msgs = [];
  this.trouver('.bloc-message-forum').each(function() {
    msgs.push(new Message($(this)));
  });
  return msgs;
};

// Appele quand il y a des nouveaux messages
Page.prototype.maj = function()
{
  TL.log('Nouveaux messages ! Execution favicon/son/spoilers');
  try { if(!TL.ongletActif) TL.favicon.maj('' + TL.nvxMessages); }
  catch(err) { TL.log('### Erreur favicon (maj) : ' + err); }
  try { TL.son.play(); }
  catch(err) { TL.log('### Erreur son : ' + err); }
  try { jsli.Transformation(); }
  catch(err) { TL.log('### Erreur jsli.Transformation() : ' + err); }

  TL.log('Envoi de topiclive:doneprocessing');
  dispatchEvent(new CustomEvent('topiclive:doneprocessing', {
    'detail': { jvcake: TL.jvCake }
  }));
};

Page.prototype.scan = function()
{
  TL.log('Scan de la page');
  TL.ajaxTs = this.trouver('#ajax_timestamp_liste_messages').val();
  TL.ajaxHash = this.trouver('#ajax_hash_liste_messages').val();
  TL.formu.maj(TL.formu.obtenirFormulaire(this.$page).clone());

  var maj = false;

  // Liste de messages
  var nvMsgs = this.obtenirMessages();

  TL.log('Verification des messages supprimes');
  if(!TL.estMP) {
    for(var i in TL.messages) {
      var supprimer = true;
      for(var j in nvMsgs) {
        if(TL.messages[i].id_message == nvMsgs[j].id_message) {
          supprimer = false;
          break;
        }
      }
      if(supprimer) TL.messages[i].supprimer();
    }
  }

  TL.log('Verification des nouveaux messages et editions');
  var estMP = TL.estMP;
  for(var k in nvMsgs) {
    var nv = true;
    for(var l in TL.messages) {
      if(TL.estMP) {
        if(TL.messages[l].$message.text() == nvMsgs[k].$message.text()) {
          nv = false;
          break;
        }
      } else {
        if(TL.messages[l].id_message == nvMsgs[k].id_message) {
          nv = false;
          TL.messages[l].maj(nvMsgs[k]);
          break;
        }
      }
    }
    if(nv) {
      // TL.log('Nouveau message !');
      TL.messages.push(nvMsgs[k]);
      TL.nvxMessages++;
      nvMsgs[k].afficher();
      maj = true;
    }
  }

  if(maj) {
    this.maj();
    TL.formu.forcerMaj = false;
  } else {
    TL.log('Aucun nouveau message.');
    if(TL.formu.forcerMaj) TL.charger();
  }

  TL.majUrl(this.trouver('.pagi-fin-actif'));
};

Page.prototype.trouver = function(chose)
{
  // TL.log('Page.trouver : ' + chose);
  return this.$page.find(chose);
};