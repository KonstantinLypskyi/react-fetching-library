import React, { Suspense } from 'react';
import { render, waitForElement } from '@testing-library/react';
import fetchMock from 'fetch-mock';
import { Action, createClient } from 'fetching-library';

import { SuspenseQuery } from '../../../../src/components/suspenseQuery/SuspenseQuery';
import { ClientContextProvider } from '../../../../src/context/clientContext/clientContextProvider';
import { QueryErrorBoundary } from '../../../../src/components/queryErrorBoundary/QueryErrorBoundary';

beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

describe('SuspenseQuery test', () => {
  const action: Action = {
    method: 'GET',
    endpoint: 'foo',
  };

  fetchMock.get(action.endpoint, {
    foo: 'bar',
  });

  const actionWithError: Action = {
    method: 'GET',
    endpoint: 'foo',
    config: {
      emitErrorForStatuses: [200],
    },
  };

  const client = createClient({});

  const wrapper = ({ children }: any) => (
    <Suspense fallback={'loading'}>
      <ClientContextProvider client={client}>{children}</ClientContextProvider>
    </Suspense>
  );

  it('shows fallback during fetch and then returns proper data on success', async () => {
    const children = jest.fn(() => 'loaded');

    const { unmount, getByText } = render(<SuspenseQuery action={action}>{children}</SuspenseQuery>, {
      wrapper: wrapper,
    });

    await waitForElement(() => getByText('loading'));

    await waitForElement(() => getByText('loaded'));

    expect(children).toHaveBeenCalledWith(expect.objectContaining({ payload: { foo: 'bar' } }));

    unmount();
  });

  it('shows fallback during fetch and then throws error when configured', async () => {
    const children = jest.fn(() => 'loaded');

    const fallback = jest.fn((response, restart) => (
      <span test-id="restart" onClick={restart}>
        fallback
      </span>
    ));

    const { unmount, getByText } = render(
      <QueryErrorBoundary statuses={[200]} fallback={fallback}>
        <SuspenseQuery action={actionWithError}>{children}</SuspenseQuery>
      </QueryErrorBoundary>,
      {
        wrapper: wrapper,
      },
    );

    await waitForElement(() => getByText('loading'));

    await waitForElement(() => getByText('fallback'));
  });
});
