import * as yup from 'yup';
import User from '../models/User';

class UserController {
  async create(req, res) {
    const schema = yup.object().shape({
      name: yup.string().required(),
      email: yup.string().required(),
      password: yup
        .string()
        .required()
        .min(6),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const userExists = await User.findOne({
      where: { email: req.body.email },
    });

    if (userExists) {
      return res.status(400).json({ error: 'User already registered' });
    }

    const { id, name, email } = await User.create(req.body);

    return res.json({ id, name, email });
  }

  async update(req, res) {
    const schema = yup.object().shape(
      {
        name: yup.string(),
        email: yup.string(),
        oldPassword: yup.string().when('password', {
          is: value => value !== undefined && value.length > 0,
          then: yup.string().required('Old password is required'),
          otherwise: yup.string(),
        }),
        password: yup.string().when('oldPassword', {
          is: value => value !== undefined && value.length > 0,
          then: yup.string().required('New password is required'),
          otherwise: yup.string(),
        }),
        confirmPassword: yup
          .string()
          .when('password', (password, field) =>
            password
              ? field
                  .required('Password confirmation is required')
                  .oneOf([yup.ref('password')], 'Passwords must match')
              : field
          ),
      },
      ['password', 'oldPassword']
    );

    try {
      await schema.validate(req.body, { abortEarly: false });
    } catch (error) {
      return res.status(400).json({ errors: error.errors });
    }

    const { email } = req.body;
    const { oldPassword } = req.body;

    const user = await User.findByPk(req.userId);

    if (email !== user.email) {
      const userExists = await User.findOne({ where: { email } });

      if (userExists) {
        return res.status(400).json({ error: 'User already registered' });
      }
    }

    if (oldPassword && !(await user.checkPassword(oldPassword))) {
      return res.status(401).json({ error: 'Password not match' });
    }

    const response = await user.update(req.body);

    return res.json({
      name: response.name,
      email: response.email,
    });
  }
}

export default new UserController();
