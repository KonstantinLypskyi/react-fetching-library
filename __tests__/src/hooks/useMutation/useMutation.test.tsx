import React from 'react';
import { act, renderHook } from 'react-hooks-testing-library';
import { QueryResponse } from 'fetching-library';

import { useMutation } from '../../../../src/hooks/useMutation/useMutation';
import { ClientContextProvider } from '../../../../src/context/clientContext/clientContextProvider';

describe('useMutation test', () => {
  const actionCreator:any = jest.fn((endpoint: string) => ({
    method: 'GET',
    endpoint,
  }));

  const fetchFunction: () => Promise<QueryResponse> = async () => ({
    error: false,
    status: 200,
    payload: {
      foo: 'bar',
    },
  });

  const client = {
    query: fetchFunction,
  };

  const wrapper = ({ children }: any) => <ClientContextProvider client={client}>{children}</ClientContextProvider>;

  it('fetches resource and returns proper data on success', async () => {
    jest.useFakeTimers();

    let state: any = {};

    renderHook(
      () => {
        state = useMutation(actionCreator);
      },
      {
        wrapper: wrapper,
      },
    );

    expect(state.loading).toEqual(false);
    expect(state.error).toEqual(false);
    expect(state.payload).toEqual(undefined);

    act(() => {
      state.mutate();
    });

    expect(state.loading).toEqual(true);

    act(() => {
      jest.runAllTimers();
    });

    expect(state.loading).toEqual(false);
    expect(state.payload).toEqual({
      foo: 'bar',
    });
  });

  it('skips changing state after unmount', async () => {
    jest.useFakeTimers();

    let state: any = {};

    const { unmount } = renderHook(
      () => {
        state = useMutation(actionCreator);
      },
      {
        wrapper: wrapper,
      },
    );

    expect(state.loading).toEqual(false);
    expect(state.error).toEqual(false);
    expect(state.payload).toEqual(undefined);

    await unmount();

    act(() => {
      state.mutate('endpoint');
      jest.runAllTimers();
    });

    expect(actionCreator).not.toHaveBeenCalledWith('endpoint');

    expect(state.loading).toEqual(false);
  });

  it('skips changing state after unmount during fetch', async () => {
    jest.useFakeTimers();

    let state: any = {};

    const { unmount } = renderHook(
      () => {
        state = useMutation(actionCreator);
      },
      {
        wrapper: wrapper,
      },
    );

    expect(state.loading).toEqual(false);
    expect(state.error).toEqual(false);
    expect(state.payload).toEqual(undefined);

    act(() => {
      state.mutate('endpoint');
      unmount();
      jest.runAllTimers();
    });

    expect(actionCreator).toHaveBeenCalledWith('endpoint');

    expect(state.loading).toEqual(false);
  });
});
