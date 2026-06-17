import { repositories } from '../repositories';
import { ApiError } from '../utils/api-error.util';
import { createChildLogger } from '../config/logger.config';

const logger = createChildLogger('FeeService');

interface CreateFeeInput {
  studentId: string;
  classId?: string;
  type: string;
  description?: string;
  amount: number;
  discount?: number;
  fine?: number;
  dueDate: string;
  academicYear?: string;
  term?: string;
}

export class FeeService {
  async create(input: CreateFeeInput) {
    const discount = input.discount || 0;
    const fine = input.fine || 0;
    const totalAmount = input.amount - discount + fine;

    const fee = await repositories.fee.create({
      ...input,
      amount: input.amount.toString(),
      discount: discount.toString(),
      fine: fine.toString(),
      totalAmount: totalAmount.toString(),
      amountPaid: '0',
      balance: totalAmount.toString(),
      status: 'pending',
    });

    logger.info({ feeId: fee.id, studentId: fee.studentId }, 'Fee record created');
    return fee;
  }

  async payFee(feeId: string, amount: number, paymentMode: string, transactionId?: string) {
    const fee = await repositories.fee.findById(feeId);
    if (!fee) {
      throw ApiError.notFound('Fee record not found');
    }

    const currentPaid = parseFloat(fee.amountPaid || '0');
    const totalAmount = parseFloat(fee.totalAmount);
    const newPaid = currentPaid + amount;
    const balance = totalAmount - newPaid;

    let status = 'partial';
    if (balance <= 0) status = 'paid';
    if (newPaid === 0) status = 'pending';

    const updated = await repositories.fee.update(feeId, {
      amountPaid: newPaid.toString(),
      balance: balance.toString(),
      status,
      paidDate: new Date(),
      paymentMode,
      transactionId,
      receiptNumber: `REC-${Date.now()}`,
    });

    logger.info({ feeId, amount, status }, 'Fee payment recorded');
    return updated;
  }

  async getStudentFees(studentId: string, status?: string) {
    return repositories.fee.findAll({
      page: 1,
      limit: 100,
      filters: { studentId, status },
    });
  }

  async getOverdueFees() {
    return repositories.fee.findAll({
      page: 1,
      limit: 100,
      filters: { status: 'overdue' },
    });
  }

  async getFeeSummary() {
    const all = await repositories.fee.findAll({ page: 1, limit: 10000 });
    const fees = all.items as any[];

    return {
      totalCollected: fees
        .filter((f) => f.status === 'paid')
        .reduce((sum, f) => sum + parseFloat(f.amountPaid || '0'), 0),
      totalPending: fees
        .filter((f) => ['pending', 'partial'].includes(f.status))
        .reduce((sum, f) => sum + parseFloat(f.balance || '0'), 0),
      totalOverdue: fees
        .filter((f) => f.status === 'overdue')
        .reduce((sum, f) => sum + parseFloat(f.balance || '0'), 0),
      paidCount: fees.filter((f) => f.status === 'paid').length,
      pendingCount: fees.filter((f) => ['pending', 'partial'].includes(f.status)).length,
    };
  }
}

export const feeService = new FeeService();