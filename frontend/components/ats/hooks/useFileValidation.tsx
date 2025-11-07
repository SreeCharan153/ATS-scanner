export function validateResume(file: File) {
  const allowed = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
  ];

  if (!allowed.includes(file.type)) return 'Invalid file type';
  if (file.size > 5 * 1024 * 1024) return 'File too large (max 5MB)';

  return null;
}
