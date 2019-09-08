import File from '../models/File';

class FileController {
  async create(req, res) {
    const { filename, originalname } = req.file;

    const file = await File.create({ originalname, filename });

    return res.json(file);
  }
}

export default new FileController();
