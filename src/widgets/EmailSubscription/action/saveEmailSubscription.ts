'use server';

import prisma from '@/db';
import { Prisma } from '@prisma/client';
import { EmailSubscriptionSchema } from '../../../schema/EmailSubscriptionSchema';

import type { EmailSubscriptionFormState } from './EmailSubscriptionState.types';

export async function saveEmailSubscription(
  formState: EmailSubscriptionFormState,
  data: FormData
): Promise<EmailSubscriptionFormState> {
  const formData = Object.fromEntries(data);
  const parsedData = EmailSubscriptionSchema.safeParse(formData);

  if (!parsedData.success) {
    const fields: Record<string, string> = {};
    for (const key of Object.keys(formData)) {
      fields[key] = formData[key].toString();
    }
    return {
      status: 'error',
      message: 'Invalid form data',
      fields,
      errors: parsedData.error.errors.map((error) => error.message),
      timestamp: Date.now(),
    };
  }

  try {
    await prisma?.emailSubscription.create({
      data: {
        firstName: parsedData.data.name,
        email: parsedData.data.email,
      },
    });
    return {
      status: 'success',
      errors: [],
      message: 'Congratulations! You have successfully subscribed 🎉',
      timestamp: Date.now(),
    };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        console.log({ formState });
        return {
          status: 'error',
          message:
            'This email is already registered in our database!',
          errors: ['Email is already in use'],
          timestamp: Date.now(),
        };
      }
    }
    return {
      status: 'error',
      message:
        error instanceof Error
          ? error.message
          : 'Something went wrong!',
      errors: [],
      timestamp: Date.now(),
    };
  }
}
