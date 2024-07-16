'use client';

import { useRef, useTransition } from 'react';
import { useFormState } from 'react-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EmailSubscriptionSchema } from '../../schema/EmailSubscriptionSchema';
import {
  type EmailSubscriptionFormState,
  saveEmailSubscription,
} from './action';
import { TextField, Alert, SubmitButton } from '@/components';

import styles from './email-subscription.module.css';

import type { EmailSubscriptionForm } from './EmailSubscription.types';
import { useAlert } from '@/components/Alert';
import { sendEmail } from '@/actions/sendEmail/sendEmail';

const initialState: EmailSubscriptionFormState = {
  message: '',
  status: 'idle',
  errors: [],
  timestamp: 0,
};

const EmailSubscription = (): React.JSX.Element => {
  const [state, formAction] = useFormState<
    EmailSubscriptionFormState,
    FormData
  >(saveEmailSubscription, initialState);
  const [isPending, startTransition] = useTransition();

  const alert = useAlert({
    message: state.message,
    status: state.status,
    timestamp: state.timestamp,
    duration: 4000,
  });

  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<EmailSubscriptionForm>({
    resolver: zodResolver(EmailSubscriptionSchema),
    mode: 'onSubmit',
    defaultValues: {
      name: '',
      email: '',
    },
  });

  const formRef = useRef<HTMLFormElement>(null);

  const onSubmit = handleSubmit(async () => {
    const formData = new FormData(formRef.current!);
    const name = formData.get('name')?.toString();
    const email = formData.get('email')?.toString();
    startTransition(async () => {
      console.log({ email: formData.get('email')?.toString() });

      await formAction(formData);
    });
    if (state.status === 'success') {
      await sendEmail(email as string);
    }
    reset({ name: '', email: '' });
  });

  console.log({ state });

  return (
    <>
      <div className="absolute top-32">
        <Alert alert={alert} />
      </div>
      <form
        key={state.timestamp}
        ref={formRef}
        action={formAction}
        onSubmit={onSubmit}
        className={styles.containerEmailField}
      >
        <div>
          <TextField
            {...register('name')}
            tabIndex={0}
            aria-label="user-firstName"
            type="text"
            className={styles.emailFieldInput}
            name="name"
            placeholder="Enter your name..."
            isError={Boolean(errors.name)}
            error={errors.name?.message}
          />
          <TextField
            {...register('email')}
            tabIndex={0}
            aria-label="user-email"
            type="email"
            className={styles.emailFieldInput}
            name="email"
            placeholder="Email"
            isError={Boolean(errors.email)}
            error={errors.email?.message}
          />
        </div>
        <SubmitButton
          isPending={isPending}
          className={styles.emailSubmitBtn}
        >
          Subscribe
        </SubmitButton>
      </form>
    </>
  );
};

export default EmailSubscription;
