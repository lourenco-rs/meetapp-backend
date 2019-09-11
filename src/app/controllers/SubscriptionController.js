import * as yup from 'yup';

import Subscription from '../models/Subscription';
import Meetup from '../models/Meetup';
import User from '../models/User';
import Queue from '../../lib/Queue';
import SubscriptionMail from '../jobs/SubscriptionMail';

class SubscriptionController {
  async create(req, res) {
    const schema = yup.object({
      meetup_id: yup.number().required(),
    });

    try {
      await schema.validate(req.body, { abortEarly: false });
    } catch (error) {
      return res.status(400).json({ errors: error.errors });
    }

    const { meetup_id: meetupId } = req.body;

    const meetup = await Meetup.findByPk(meetupId, {
      include: [
        {
          model: User,
          attributes: ['name', 'email'],
        },
      ],
    });

    if (!meetup) {
      return res.status(400).json({
        error: 'Meetup does not exist',
      });
    }

    if (meetup.user_id === req.userId) {
      return res.status(400).json({
        error: 'You cannot subscribe to your own meetings',
      });
    }

    if (meetup.past) {
      return res.status(400).json({
        error: 'You are not allowed to register for past meetings',
      });
    }

    const alreadySubscribed = await Subscription.findOne({
      where: { meetup_id: meetupId, user_id: req.userId },
    });

    if (alreadySubscribed) {
      return res.status(400).json({
        error: 'You are already subscribed to this meetup',
      });
    }

    const sameTime = await Subscription.findOne({
      where: {
        user_id: req.userId,
      },
      include: [
        {
          model: Meetup,
          where: {
            date: meetup.date,
          },
        },
      ],
    });

    if (sameTime) {
      return res.status(400).json({
        error: 'You are already subscribed to another meetup at the same time',
      });
    }

    const subscription = await Subscription.create({
      ...req.body,
      user_id: req.userId,
    });

    const user = await User.findByPk(req.userId, {
      attributes: ['name', 'email'],
    });

    Queue.add(SubscriptionMail.key, {
      meetup,
      user,
    });

    return res.json(subscription);
  }
}

export default new SubscriptionController();
