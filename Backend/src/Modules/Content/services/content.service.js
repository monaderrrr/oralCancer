import Content from '../../../DB/models/content.model.js';

export const createContentService = async (req, res) => {
  const { title, body, category } = req.body;
  const authorId = req.authUser._id;
  const content = await Content.create({ title, body, category, authorId });
  return res.status(201).json({ message: 'Content created', content });
};

export const listContentService = async (req, res) => {
  const contents = await Content.find().sort({ createdAt: -1 }).lean();
  return res.status(200).json({ message: 'OK', contents });
};

export const getContentService = async (req, res) => {
  const { id } = req.params;
  const content = await Content.findById(id).lean();
  if (!content) return res.status(404).json({ message: 'Content not found' });
  return res.status(200).json({ message: 'OK', content });
};

export const updateContentService = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const content = await Content.findByIdAndUpdate(id, updates, { new: true }).lean();
  if (!content) return res.status(404).json({ message: 'Content not found' });
  return res.status(200).json({ message: 'Content updated', content });
};

export const deleteContentService = async (req, res) => {
  const { id } = req.params;
  await Content.findByIdAndDelete(id);
  return res.status(200).json({ message: 'Content deleted' });
};
