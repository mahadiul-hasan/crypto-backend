import { Request, Response } from "express";
import { PaymentService } from "./payment.service";

const submitPayment = async (req: Request, res: Response) => {
  const userId = req.user!.id;

  const payment = await PaymentService.submitPayment(userId, req.body);

  res.status(201).json(payment);
};

const myPayments = async (req: Request, res: Response) => {
  const userId = req.user!.id;

  const payments = await PaymentService.getUserPayments(userId);

  res.json(payments);
};

const listPending = async (req: Request, res: Response) => {
  const payments = await PaymentService.listPendingPayments();

  res.json(payments);
};

const verify = async (req: Request, res: Response) => {
  const id = req.params.id as string;

  const result = await PaymentService.verifyPayment(id);

  res.json(result);
};

const reject = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const { reason } = req.body;

  const result = await PaymentService.rejectPayment(id, reason);

  res.json(result);
};

export const PaymentController = {
  submitPayment,
  myPayments,
  listPending,
  verify,
  reject,
};
