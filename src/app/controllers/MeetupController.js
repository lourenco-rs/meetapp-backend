import { isBefore, parseISO } from 'date-fns';
import * as yup from 'yup';

import File from '../models/File';
import Meetup from '../models/Meetup';

class MeetupController {
  async create(req, res) {
    const schema = yup.object({
      title: yup.string().required(),
      description: yup.string().required(),
      location: yup.string().required(),
      date: yup.date().required(),
      banner_id: yup.number().required(),
    });

    try {
      await schema.validate(req.body, { abortEarly: false });
    } catch (error) {
      return res.status(400).json({ errors: error.errors });
    }

    const { date } = req.body;

    if (isBefore(parseISO(date), new Date())) {
      return res
        .status(400)
        .json({ error: 'Registering a dated meetup is not allowed' });
    }

    const meetup = await Meetup.create({
      ...req.body,
      user_id: req.userId,
    });

    return res.json(meetup);
  }

  async update(req, res) {
    const schema = yup.object({
      title: yup.string(),
      description: yup.string(),
      location: yup.string(),
      date: yup.date(),
      banner_id: yup.number(),
    });

    try {
      await schema.validate(req.body, { abortEarly: false });
    } catch (error) {
      return res.status(400).json({ errors: error.errors });
    }

    const { date } = req.body;

    const meetup = await Meetup.findByPk(req.params.id);

    if (meetup.user_id !== req.userId) {
      return res
        .status(401)
        .json({ error: 'You can only modify the meetups you registered' });
    }

    if (meetup.past) {
      return res.status(401).json({ error: 'Past meetups cannot be changed' });
    }

    if (isBefore(parseISO(date), new Date())) {
      return res
        .status(400)
        .json({ error: 'Registering a dated meetup is not allowed' });
    }

    await meetup.update(req.body);

    return res.json(meetup);
  }

  async findAll(req, res) {
    const meetups = await Meetup.findAll({
      where: { user_id: req.userId },
      attributes: ['id', 'title', 'description', 'location', 'date'],
      include: [
        {
          model: File,
          as: 'banner',
          attributes: ['id', 'url', 'filename'],
        },
      ],
      order: [['date', 'ASC']],
    });

    return res.json(meetups);
  }

  async delete(req, res) {
    const meetup = await Meetup.findByPk(req.params.id);

    if (meetup.user_id !== req.userId) {
      return res
        .status(401)
        .json({ error: 'You can only delete the meetups you registered' });
    }

    if (meetup.past) {
      return res.status(401).json({ error: 'Past meetups cannot be deleted' });
    }

    await meetup.destroy(req.body);

    return res.send();
  }
}

export default new MeetupController();
