import Sequelize, { Model } from 'sequelize';

class File extends Model {
  static init(sequelize) {
    super.init(
      {
        originalname: Sequelize.STRING,
        filename: Sequelize.STRING,
        url: {
          type: Sequelize.VIRTUAL,
          get() {
            return `${process.env.APP_URL}/files/${this.filename}`;
          },
        },
      },
      {
        sequelize,
      }
    );

    return this;
  }
}

export default File;
