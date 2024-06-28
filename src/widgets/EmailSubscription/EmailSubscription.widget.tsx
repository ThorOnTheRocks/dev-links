'use client';

import { BaseSyntheticEvent, useRef } from 'react';
import { useFormState } from 'react-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EmailSubscriptionSchema } from '../../schema/EmailSubscriptionSchema';
import {
  type EmailSubscriptionFormState,
  saveEmailSubscription,
} from './action';
import { Button, TextField, Alert } from '@/components';

import styles from './email-subscription.module.css';

import type { EmailSubscriptionForm } from './EmailSubscription.types';
import { useAlert } from '@/components/Alert';

const initialState: EmailSubscriptionFormState = {
  message: '',
  status: 'idle',
  fields: {},
  errors: undefined,
  timestamp: 0,
};

const EmailSubscription = (): React.JSX.Element => {
  const [state, formAction] = useFormState<
    EmailSubscriptionFormState,
    FormData
  >(saveEmailSubscription, initialState);

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
      email: '',
    },
    ...(state.fields ?? {}),
  });

  const formRef = useRef<HTMLFormElement>(null);

  const onSubmit = async (e: BaseSyntheticEvent) => {
    e.preventDefault();
    handleSubmit(() => {
      formAction(new FormData(formRef.current!));
      reset({ email: '' });
    })(e);
  };

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
        <TextField
          {...register('email')}
          type="email"
          className={styles.emailFieldInput}
          name="email"
          placeholder="Email"
          isError={Boolean(errors.email)}
          error={errors.email?.message}
        />
        <Button type="submit" className={styles.emailSubmitBtn}>
          Subscribe
        </Button>
      </form>
    </>
  );
};

export default EmailSubscription;
