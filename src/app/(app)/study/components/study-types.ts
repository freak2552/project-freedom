export type StudySubject = {
  id: string;
  name: string;
};

export type StudyRecord = {
  id: string;
  subjectId: string;
  subjectName: string;
  date: string;
  minutes: number;
};
