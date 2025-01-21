export const LOG_MESSAGES = {
  meetupsFetched: 'Successfully fetched available meetups.',
  meetupsFetchError: 'Error fetching available meetups.',
  csvGenerationStarted: 'CSV generation started.',
  csvGenerationSuccess: 'CSV generation completed successfully.',
  csvGenerationError: 'Error occurred during CSV generation.',
  pdfGenerationStarted: 'PDF generation started.',
  pdfGenerationSuccess: 'PDF generation completed successfully.',
  pdfGenerationError: 'Error occurred during PDF generation.',
  fontNotFoundError: 'Font file not found. Ensure FONT_PATH is correct.',
} as const;

export const EXCEPTION_MESSAGES = {
  meetupsFetchError: 'Error fetching available meetups.',
  csvGenerationError: 'Failed to generate CSV file.',
  pdfGenerationError: 'Failed to generate PDF file.',
  fontNotFoundError: 'Font file is missing or incorrect.',
} as const;

export const FORMAT_DATETIME = 'd MMMM yyyy, HH:mm';

export const FONT_PATH = './fonts/Roboto-Regular.ttf';
