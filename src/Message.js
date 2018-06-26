import TopicLive from './TopicLive.js';
const $ = require('ddd-jquery');

class Message {
    constructor($message) {
        if(TopicLive.estMP) {
            this.id_message = 'MP';
        } else if(TopicLive.mobile) {
            let id = $message.attr('id');
            id = id.slice(id.indexOf('_') + 1);
            this.id_message = parseInt(id, 10);
        } else {
            this.id_message = parseInt($message.attr('data-id'), 10);
        }

        this.date = $(TopicLive.class_date, $message).text().replace(/[\r\n]|#[0-9]+$/g, '');
        this.edition = $message.find('.info-edition-msg').text();
        this.$message = $message;
        this.pseudo = $('.bloc-pseudo-msg', $message).text().replace(/[\r\n]/g, '');
        this.supprime = false;
    }

    afficher() {
        console.log(`Affichage du message ${this.id_message}`);
        this.$message.hide();
        this.fixBlacklist();
        this.fixCitation();
      this.fixDeroulerCitation();
      if(TopicLive.mobile) {
        this.fixMobile();
      }
        $(`${TopicLive.class_msg}:last`).after(this.$message);
        this.$message.fadeIn('slow');

        dispatchEvent(new CustomEvent('topiclive:newmessage', {
            'detail': {
                id: this.id_message,
                jvcake: TopicLive.jvCake
            }
        }));
    }

    fixBlacklist() {
        this.trouver('.bloc-options-msg > .picto-msg-tronche, .msg-pseudo-blacklist .btn-blacklist-cancel').on('click', function () {
            $.ajax({
                url: '/forums/ajax_forum_blacklist.php',
                data: {
                    id_alias_msg: this.$message.attr('data-id-alias'),
                    action: this.$message.attr('data-action'),
                    ajax_hash: $('#ajax_hash_preference_user')
                },
                dataType: 'json',
                success(e) {
                    if(e.erreur && e.erreur.length) {
              TopicLive.alert(e.erreur);
                    } else {
                        document.location.reload();
                    }
                }
            });
        });
    }

    fixCitation() {
        console.log(`Obtention de la citation du message ${this.id_message}`);
        this.$message.find('.bloc-options-msg .picto-msg-quote').on('click', () => {
            $.ajax({
                type: 'POST',
                url: '/forums/ajax_citation.php',
                data: {
                    id_message: this.id_message,
                    ajax_timestamp: TopicLive.ajaxTs,
                    ajax_hash: TopicLive.ajaxHash
                },
                dataType: 'json',
                timeout: 5000,
                success: e => {
                    console.log(`Citation du message ${this.id_message} recue avec succes`);
                    const $msg = TopicLive.formu.obtenirMessage();
                    let nvmsg = `> Le ${this.date} ${this.pseudo} a écrit :\n>`;
                    nvmsg += `${e.txt.split('\n').join('\n> ')}\n\n`;
                    if($msg.val() === '') {
                        $msg.val(nvmsg);
                    } else {
                        $msg.val(`${$msg.val()}\n\n${nvmsg}`);
                    }
                },
                error: () => this.fixCitation()
            });
        });
    }

    fixDeroulerCitation() {
      this.trouver('blockquote').click(function() {
        $(this).attr('data-visible', '1');
      });
    }

    fixMobile() {
      this.trouver('.message').addClass('show-all');
    }

    trouver(chose) {
        return this.$message.find(chose);
    }

    // Change le CSS du message pour indiquer qu'il est supprime
    supprimer() {
        console.log(`Alerte suppression du message ${this.id_message}`);
        if(!this.supprime) {
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

    update(nvMessage) {
        if(this.edition == nvMessage.edition) return;
        console.log(`Message ${this.id_message} edite : mise a jour`);

        this.edition = nvMessage.edition;
        this.trouver(TopicLive.class_contenu).html(nvMessage.trouver(TopicLive.class_contenu).html());

        dispatchEvent(new CustomEvent('topiclive:edition', {
            'detail': {
                id: this.id_message,
                jvcake: TopicLive.jvCake
            }
        }));

        // Clignotement du messages
        const defColor = this.$message.css('backgroundColor');
        this.$message.animate({
            backgroundColor: '#FF9900'
        }, 50);
        this.$message.animate({
            backgroundColor: defColor
        }, 500);
    }
}

export default Message;
