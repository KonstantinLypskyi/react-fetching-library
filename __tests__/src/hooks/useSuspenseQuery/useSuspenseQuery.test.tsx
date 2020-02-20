import React, { Suspense, useState } from 'react';
import { renderHook, act } from 'react-hooks-testing-library';
import { render, waitForElement, waitForDomChange, fireEvent, getByTestId } from '@testing-library/react';

import { useSuspenseQuery } from '../../../../src/hooks/useSuspenseQuery/useSuspenseQuery';
import { Action, QueryResponse, SuspenseCacheItem } from '../../../../src/client/client.types';
import { ClientContextProvider } from '../../../../src/context/clientContext/clientContextProvider';
import { createCache } from '../../../../src/cache/cache';

describe('useSuspenseQuery test', () => {
  const action: Action = {
    method: 'GET',
    endpoint: 'foo',
  };

  const fetchFunction: () => Promise<QueryResponse> = jest.fn(async () => {
    await new Promise(res => setTimeout(res, 1000));

    return {
      error: false,
      status: 200,
      payload: {
        foo: 'bar',
      },
    };
  });

  const client = {
    query: fetchFunction,
    suspenseCache: createCache<SuspenseCacheItem>(() => true, () => true),
  };

  const wrapper = ({ children }: any) => (
    <Suspense fallback={'loading'}>
      <ClientContextProvider client={client}>{children}</ClientContextProvider>
    </Suspense>
  );

  it('shows fallback during fetch and then return proper data on success', async () => {
    let state: any = {};

    const { unmount, waitForNextUpdate, rerender } = renderHook(
      () => {
        state = useSuspenseQuery(action);
      },
      {
        wrapper: wrapper,
      },
    );

    expect(state.payload).toEqual(undefined);

    rerender();

    await waitForNextUpdate();

    expect(state.payload).toEqual({
      foo: 'bar',
    });

    expect(fetchFunction).toHaveBeenCalledTimes(1);

    act(() => {
      state.query();
    })

    rerender();

    expect(state.payload).toEqual({
      foo: 'bar',
    });

    expect(fetchFunction).toHaveBeenCalledTimes(2);

    unmount();
  });

  it('clear updated action from cache', async () => {
    const cache = createCache<SuspenseCacheItem>(() => true, () => true);
    const remove = jest.fn();

    const secondAction = {
      method: 'GET',
      endpoint: 'bar',
    }

    cache.add(secondAction, {
      fetch: jest.fn(),
      response: {
        error: false,
      },
    })

    const client = {
      query: fetchFunction,
      suspenseCache: {
        ...cache,
        remove,
      },
    };

    const testWrapper = ({ children }: any) => (
      <Suspense fallback={<span data-testid="loading">loading</span>}>
        <ClientContextProvider client={client}>{children}</ClientContextProvider>
      </Suspense>
    );

    const TestComponent = () => {
      const [currentAction, setCurrentAction] = useState(action);
      const { query } = useSuspenseQuery(currentAction);

      return <div>
        <button data-testid="change" onClick={() => setCurrentAction(secondAction)}>change</button>
        <button data-testid="reset" onClick={query}>reset</button>
      </div>;
    }

    const { container, unmount, getByTestId, debug } = render(
      <TestComponent />,
      {
        wrapper: testWrapper,
      },
    );

    await waitForElement(() => getByTestId('reset'));

    act(() => {
      fireEvent.click(getByTestId('reset'));
      fireEvent.click(getByTestId('change'));
    })

    expect(remove).toHaveBeenCalledTimes(3);
    expect(remove).toHaveBeenCalledWith(action);
    expect(remove).toHaveBeenCalledWith(secondAction);

    unmount();
  });
});
