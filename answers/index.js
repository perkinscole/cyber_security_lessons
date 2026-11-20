// Quick-check answers and reference code for every lesson.
// This folder is for the server, the tests and the teacher's lesson plans. It is never sent to a student.
import g6 from './grade6.js';
import g7 from './grade7.js';
import g8 from './grade8.js';

export const KEYS = { ...g6, ...g7, ...g8 };
export const keyFor = (lessonId) => KEYS[lessonId];
