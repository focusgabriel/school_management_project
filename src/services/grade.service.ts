import { repositories } from '../repositories';
import { ApiError } from '../utils/api-error.util';
import { createChildLogger } from '../config/logger.config';

const logger = createChildLogger('GradeService');

interface AddGradeInput {
  studentId: string;
  examId?: string;
  subjectId?: string;
  marksObtained: number;
  totalMarks: number;
  remarks?: string;
}

export class GradeService {
  private calculateGrade(percentage: number): { grade: string; gradePoint: number } {
    if (percentage >= 90) return { grade: 'A+', gradePoint: 4.0 };
    if (percentage >= 80) return { grade: 'A', gradePoint: 3.7 };
    if (percentage >= 70) return { grade: 'B', gradePoint: 3.0 };
    if (percentage >= 60) return { grade: 'C', gradePoint: 2.3 };
    if (percentage >= 50) return { grade: 'D', gradePoint: 1.7 };
    if (percentage >= 40) return { grade: 'E', gradePoint: 1.0 };
    return { grade: 'F', gradePoint: 0.0 };
  }

  async addGrade(input: AddGradeInput, gradedBy?: string) {
    const percentage = (input.marksObtained / input.totalMarks) * 100;
    const { grade, gradePoint } = this.calculateGrade(percentage);

    const record = await repositories.grade.create({
      ...input,
      marksObtained: input.marksObtained.toString(),
      totalMarks: input.totalMarks.toString(),
      percentage: percentage.toFixed(2),
      grade,
      gradePoint: gradePoint.toString(),
      gradedBy,
      gradedAt: new Date(),
      status: 'graded',
    });

    logger.info({ gradeId: record.id }, 'Grade added');
    return record;
  }

  async getStudentGrades(studentId: string, examId?: string) {
    return repositories.grade.findAll({
      page: 1,
      limit: 100,
      filters: { studentId, examId },
    });
  }

  async getExamGrades(examId: string) {
    return repositories.grade.findAll({
      page: 1,
      limit: 200,
      filters: { examId },
    });
  }

  async calculateStudentGPA(studentId: string): Promise<{ gpa: number; totalCredits: number }> {
    const grades = await this.getStudentGrades(studentId);
    const records = grades.items as any[];

    if (records.length === 0) return { gpa: 0, totalCredits: 0 };

    const totalPoints = records.reduce((sum, r) => sum + parseFloat(r.gradePoint || '0'), 0);
    const gpa = totalPoints / records.length;

    return { gpa: parseFloat(gpa.toFixed(2)), totalCredits: records.length };
  }
}

export const gradeService = new GradeService();