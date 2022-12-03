import { ReactNode, useContext } from 'react';
import styled from 'styled-components';
import { Formik } from 'formik';
import { Grid } from '@mui/material';
import { sendInvoke } from '../utils';
import { MetamaskActions, MetaMaskContext } from '../hooks';

type CardProps = {
  content: {
    title: string;
    description: string;
    button: ReactNode;
  };
  disabled?: boolean;
  fullWidth?: boolean;
};

const CardWrapper = styled.div<{ fullWidth?: boolean; disabled: boolean }>`
  display: flex;
  flex-direction: column;
  width: ${({ fullWidth }) => (fullWidth ? '100%' : '250px')};
  background-color: ${({ theme }) => theme.colors.card.default};
  margin-top: 2.4rem;
  margin-bottom: 2.4rem;
  padding: 2.4rem;
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  border-radius: ${({ theme }) => theme.radii.default};
  box-shadow: ${({ theme }) => theme.shadows.default};
  filter: opacity(${({ disabled }) => (disabled ? '.4' : '1')});
  align-self: stretch;
  ${({ theme }) => theme.mediaQueries.small} {
    width: 100%;
    margin-top: 1.2rem;
    margin-bottom: 1.2rem;
    padding: 1.6rem;
  }
`;

const Title = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.large};
  margin: 0;
  ${({ theme }) => theme.mediaQueries.small} {
    font-size: ${({ theme }) => theme.fontSizes.text};
  }
`;

const Description = styled.p`
  margin-top: 2.4rem;
  margin-bottom: 2.4rem;
`;

const Form = styled.form<{ fullWidth?: boolean; disabled: boolean }>`
  display: flex;
  flex-direction: column;
  width: ${({ fullWidth }) => (fullWidth ? '100%' : '250px')};
  background-color: ${({ theme }) => theme.colors.card.default};
  margin-top: 2.4rem;
  margin-bottom: 2.4rem;
  padding: 2.4rem;
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  border-radius: ${({ theme }) => theme.radii.default};
  box-shadow: ${({ theme }) => theme.shadows.default};
  filter: opacity(${({ disabled }) => (disabled ? '.4' : '1')});
  align-self: stretch;
  ${({ theme }) => theme.mediaQueries.small} {
    width: 100%;
    margin-top: 1.2rem;
    margin-bottom: 1.2rem;
    padding: 1.6rem;
  }
`;

const InvokeButton = styled.button`
  display: flex;
  align-self: flex-start;
  align-items: center;
  justify-content: center;
  margin-top: auto;
  width: 80%;
  ${({ theme }) => theme.mediaQueries.small} {
    width: 100%;
  }
`;

const Input = styled.input`
  margin-bottom: 1rem;
  width: 100%;
`;

const TextArea = styled.textarea`
  height: 10rem;
  width: 100%;
  margin-bottom: 2rem;
`;

export const Card = ({ disabled = false, fullWidth, content }: CardProps) => {
  const { title, description, button } = content;
  return (
    <CardWrapper fullWidth={fullWidth} disabled={disabled}>
      <Title>{title}</Title>
      <Description>{description}</Description>
      {button}
    </CardWrapper>
  );
};

type InvokeCardProps = {
  disabled?: boolean;
  fullWidth?: boolean;
  setResult: React.Dispatch<React.SetStateAction<any>>;
};

export const InvokeCard = ({
  disabled = false,
  fullWidth,
  setResult,
}: InvokeCardProps) => {
  const [state, dispatch] = useContext(MetaMaskContext);

  return (
    <Formik
      initialValues={{ uri: '', method: '', args: '' }}
      validate={(values) => {
        const errors: { uri?: string; method?: string; args?: string } = {};
        if (!values.uri) {
          errors.uri = 'Required';
        } else if (!values.method) {
          errors.method = 'Required';
        } else if (!values.args) {
          errors.args = 'Required';
        }
        return errors;
      }}
      onSubmit={async (values, { setSubmitting }) => {
        const { uri, method, args } = values;
        try {
          const result: any = await sendInvoke({
            uri,
            method,
            args: JSON.parse(args),
          });
          setResult(result);
        } catch (e) {
          console.error(e);
          dispatch({ type: MetamaskActions.SetError, payload: e });
        }
        setSubmitting(false);
      }}
    >
      {({
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        handleSubmit,
        isSubmitting,
        /* and other goodies */
      }) => (
        <Form fullWidth={fullWidth} disabled={disabled} onSubmit={handleSubmit}>
          <Grid container direction="column">
            <Grid container item direction="row">
              <Grid item xs={3}>
                Uri
              </Grid>
              <Grid item xs={9}>
                <Input
                  type="uri"
                  name="uri"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.uri}
                />
                {errors.uri && touched.uri && errors.uri}
              </Grid>
            </Grid>
            <Grid container item direction="row">
              <Grid item xs={3}>
                Method
              </Grid>
              <Grid item xs={9}>
                <Input
                  type="text"
                  name="method"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.method}
                />
                {errors.method && touched.method && errors.method}
              </Grid>
            </Grid>
            <Grid container item direction="row">
              <Grid item xs={3}>
                Args
              </Grid>
              <Grid item xs={9}>
                <TextArea
                  name="args"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.args}
                />
                {errors.args && touched.args && errors.args}
              </Grid>
            </Grid>
            <InvokeButton
              type="submit"
              disabled={!state.installedSnap || isSubmitting}
            >
              Invoke
            </InvokeButton>
          </Grid>
        </Form>
      )}
    </Formik>
  );
};
