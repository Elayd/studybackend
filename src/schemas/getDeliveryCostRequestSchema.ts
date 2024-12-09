import { z } from 'zod';

const invalid_type_error = 'Check your provided data';
const required_error = 'Field is required';

export const GetDeliveryCostRequestSchema = z.object({
  width: z.string({ invalid_type_error, required_error }).min(1, { message: required_error }),
  height: z.string({ invalid_type_error, required_error }).min(1, { message: required_error }),
  weight: z.string({ invalid_type_error, required_error }).min(1, { message: required_error }),
  from: z.string({ invalid_type_error, required_error }).min(1, { message: required_error }),
  to: z.string({ invalid_type_error, required_error }).min(1, { message: required_error }),
  isStrict: z.string({ invalid_type_error, required_error }).min(1, { message: required_error }),
  depth: z.string({ invalid_type_error, required_error }).min(1, { message: required_error })
});
