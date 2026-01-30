import { z } from "zod";

const create = z.object({
  body: z.object({
    batchId: z.string(),
    senderNumber: z.string().min(11),
    transactionId: z.string(),
    method: z.string(),
  }),
});

export const PaymentSchema = {
  create,
};
