import { ACTION_STATUS_ERROR } from './action-statuses';

export default (_state, action) => {
  if (!(action.payload && action.status === ACTION_STATUS_ERROR)) {
    return null;
  }

  const { payload: error } = action;
  if (error.errors) {
    return error.errors.join('\n');
  }

  if (error.message === 'Failed to fetch') {
    return 'Network error';
  }

  return error.message;
};
