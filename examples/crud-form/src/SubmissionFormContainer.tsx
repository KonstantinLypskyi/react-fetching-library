import React from 'react';
import { Formik, FormikActions } from 'formik';
import * as yup from 'yup';
import { useMutation, Action } from 'react-fetching-library';
import { Box } from '@chakra-ui/core';

import SubmissionForm from './SubmissionForm';

export interface SubmissionValues {
  name: string;
  message: string;
  email: string;
}

console.log(process.env);

const submitFormAction: Action = (formValues: SubmissionValues) => ({
  method: 'POST',
  endpoint: `https://formcarry.com/s/${process.env.REACT_APP_FORMCARRY_ID}`,
  body: formValues,
  headers: {
    Accept: 'application/json',
  },
});

const validationSchema = yup.object().shape({
  name: yup.string().required('Hmm, what is your name?'),
  email: yup
    .string()
    .email()
    .required('Hmm, what is your email?'),
  message: yup.string().required('Hmm, what did you want to discuss?'),
});

const SubmissionFormContainer: React.FC = () => {
  const [submissionError, setSubmissionError] = React.useState<boolean>(false);
  const [submissionSuccess, setSubmissionSuccess] = React.useState<boolean>(false);

  const { mutate } = useMutation(submitFormAction);

  const handleSubmit = async (values: SubmissionValues, actions: FormikActions<SubmissionValues>) => {
    setSubmissionError(false);
    setSubmissionSuccess(false);

    try {
      await mutate(values);
      setSubmissionSuccess(true);
      actions.resetForm();
    } catch (e) {
      setSubmissionError(true);
    } finally {
      actions.setSubmitting(false);
    }
  };

  return (
    <React.Fragment>
      {submissionError && (
        <Box mb={4} bg="red.400" p={3} fontWeight={600} color="red.900">
          An unexpected error occurred. Please try again later!
        </Box>
      )}
      {submissionSuccess && (
        <Box mb={4} bg="green.400" p={3} fontWeight={600} color="green.900">
          Thanks for reaching out! I'll be in touch ASAP.
        </Box>
      )}
      <Formik
        initialValues={{ name: '', email: '', message: '' }}
        validationSchema={validationSchema}
        validateOnBlur={false}
        validateOnChange={false}
        onSubmit={handleSubmit}
        render={formikProps => <SubmissionForm {...formikProps} />}
      />
    </React.Fragment>
  );
};

export default SubmissionFormContainer;
