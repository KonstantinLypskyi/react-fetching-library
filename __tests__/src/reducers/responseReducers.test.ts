import { responseReducer, SET_RESPONSE, SET_LOADING } from '../../../src/reducers/responseReducer';

describe('responseReducers', () => {
  const testResponse = { payload: { foo: 'bar' }, error: false };
  const defaultState = { response: { error: false }, loading: false };

  it('throws exception when action is invalid', async () => {
    expect(() => responseReducer(defaultState, { type: 'foo' })).toThrowError();
    expect(() => responseReducer(defaultState, { type: SET_RESPONSE })).toThrowError();
  });

  it('sets loading flag to true on SET_LOADING action', async () => {
    expect(responseReducer(defaultState, { type: SET_LOADING })).toEqual({
      response: { error: false },
      loading: true,
    });
  });

  it('sets response object on SET_RESPONSE action', async () => {
    expect(responseReducer(defaultState, { type: SET_RESPONSE, response: testResponse })).toEqual({
      response: testResponse,
      loading: false,
    });
  });
});
