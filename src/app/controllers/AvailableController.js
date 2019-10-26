import { parseISO, startOfDay, endOfDay } from 'date-fns';
import { Op } from 'sequelize';
import User from '../models/User';

import Meetup from '../models/Meetup';
import File from '../models/File';

class AvailableController {
  async findAll(req, res) {
    const { date, page = 1 } = req.query;

    const where = {};

    if (date) {
      const searchDate = parseISO(date);

      where.date = {
        [Op.between]: [startOfDay(searchDate), endOfDay(searchDate)],
      };
    }

    const meetups = await Meetup.findAll({
      where,
      order: ['date'],
      limit: 10,
      offset: (page - 1) * 10,
      include: [
        {
          model: User,
          as: 'organizer',
          attributes: ['name', 'email'],
        },
        {
          model: File,
          as: 'banner',
          attributes: ['url', 'filename'],
        },
      ],
    });

    return res.json(meetups);
  }
}

export default new AvailableController();
