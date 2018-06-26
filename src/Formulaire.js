import Page from './Page.js';
import TopicLive from './TopicLive.js';

class Formulaire {
  constructor() {
    // TopicLive.log('Nouveau formulaire.');
    this.hook();
  }

  afficherErreurs(msg) {
    if(typeof msg !== 'undefined') {
      let message_erreur = '';
      for(let i = 0; i < msg.length; i++) {
        message_erreur += msg[i];
        if(i < msg.length) message_erreur += '<br />';
      }
      TopicLive.alert(message_erreur);
    }
  }

  envoyer(e) {
    // Si le message est invalide selon JVC
    if(typeof e !== 'undefined' && typeof e.errors !== 'undefined' && e.errors.length) {
      this.afficherErreurs(e.erreurs);
    } else {
      TopicLive.log('Message valide. Envoi en cours');
      this.trouver('.btn-poster-msg').attr('disabled', 'disabled');
      this.trouver('.conteneur-editor').fadeOut();

      window.clearTimeout(TopicLive.idanalyse);
      $.ajax({
        type: 'POST',
        url: TopicLive.url,
        data: this.obtenirFormulaire().serializeArray(),
        timeout: 5000,
        success: data => {
          switch(typeof data) {
            case 'object':
              // MaJ du formulaire via JSON
              if(data.hidden_reset) {
                this.trouver('input[type="hidden"]').remove();
                this.obtenirFormulaire().append(data.hidden_reset);
              }

              // Erreur lors de l'envoi du message
              if(data.errors) {
                this.afficherErreurs(data.errors);
                this.trouver('.btn-poster-msg').removeAttr('disabled');
                this.trouver('.conteneur-editor').fadeIn();
              }
              
              // Redirection via JSON (wtf)
              if(data.redirect_uri) {
                TopicLive.log(`Redirection du formulaire vers ${data.redirect_uri}`);
                TopicLive.url = data.redirect_uri;
                TopicLive.GET().then(() => this.verifEnvoi());
              }
              break;
            case 'string':
              this.verifEnvoi($(data.substring(data.indexOf('<!DOCTYPE html>'))));
              break;
            case 'undefined': /* falls through */
            default:
              TopicLive.alert('Erreur inconnue lors de l\'envoi du message.');
              this.trouver('.btn-poster-msg').removeAttr('disabled');
              this.trouver('.conteneur-editor').fadeIn();
              break;
          }
          
          TopicLive.loop();
        },
        error: err => {
          TopicLive.alert(`Erreur lors de l'envoi du message : ${err}`);
        }
      });
    }
  }

  hook() {
    // Remplacement du bouton de post
    const $form = this.obtenirFormulaire();
    const $bouton = $form.find('.btn-poster-msg');
    $bouton.off();
    $bouton.removeAttr('data-push');
    $bouton.attr('type', 'button');
    $bouton.on('click', () => this.verifMessage());
  }

  maj($nvform) {
    TopicLive.log('Mise a jour du formulaire');
    const $form = this.obtenirFormulaire();
    const $cap = this.obtenirCaptcha($form);
    const $ncap = this.obtenirCaptcha($nvform);

    // Remplacement hashs formulaire
    this.trouver('input[type="hidden"]').remove();
    $nvform.find('input[type="hidden"]').each(function() {
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

  obtenirCaptcha($form) {
    if(typeof $form === 'undefined') $form = this.obtenirFormulaire();
    return $form.find('.jv-editor').next('div');
  }

  obtenirMessage($form) {
    if(typeof $form == 'undefined') $form = this.obtenirFormulaire();
    return $form.find(TopicLive.estMP ? '#message' : '#message_topic');
  }

  obtenirFormulaire($page) {
    if(typeof $page === 'undefined') $page = $(document);
    return $page.find(TopicLive.estMP ? '#repondre-mp > form' : '.form-post-message');
  }

  verifEnvoi(data) {
    const nvPage = new Page(data);
    const $formu = this.obtenirFormulaire(nvPage.$page);
    this.maj($formu);
    TopicLive.majUrl(nvPage);
    nvPage.scan();
  }

  verifMessage() {
    TopicLive.log('Verification du message avant envoi');

    if(TopicLive.estMP) {
      this.envoyer();
    } else {
      $.ajax({
        type: 'POST',
        url: '/forums/ajax_check_poste_message.php',
        data: {
          id_topic, // global
          new_message: this.obtenirMessage().val(),
          ajax_timestamp: TopicLive.ajaxTs,
          ajax_hash: TopicLive.ajaxHash
        },
        dataType: 'json',
        timeout: 5000,
        success: err => this.envoyer(err),
        error: () => this.verifMessage()
      });
    }

    return false;
  }

  trouver(chose) {
    return this.obtenirFormulaire().find(chose);
  }
}

export default Formulaire;
