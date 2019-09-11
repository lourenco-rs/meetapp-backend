import { format, parseISO } from 'date-fns';
import pt from 'date-fns/locale/pt-BR';

import Mail from '../../lib/Mail';

class SubscriptionMail {
  get key() {
    return 'SubscriptionMail';
  }

  async handle({ data }) {
    const { meetup, user } = data;

    await Mail.sendMail({
      to: `${meetup.User.name} <${meetup.User.email}>`,
      subject: `Nova inscrição no meetup: ${meetup.title}`,
      template: 'subscription',
      context: {
        user: user.name,
        email: user.email,
        organizer: meetup.User.name,
        title: meetup.title,
        date: format(parseISO(meetup.date), "'dia' d 'de' MMMM', às' H:mm'h", {
          locale: pt,
        }),
      },
    });
  }
}

export default new SubscriptionMail();
