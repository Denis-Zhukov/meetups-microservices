import { v4 } from 'uuid';

export const generateFilename = (
  file: Express.Multer.File,
  maxFilenameLength: number
) => {
  const ext = file.originalname.slice(file.originalname.lastIndexOf('.'));

  const baseName = file.originalname.slice(
    0,
    file.originalname.length - ext.length
  );

  const truncatedBaseName =
    baseName.length > maxFilenameLength - ext.length
      ? baseName.slice(0, maxFilenameLength - ext.length)
      : baseName;

  return `${v4()}-${truncatedBaseName}${ext}`;
};
