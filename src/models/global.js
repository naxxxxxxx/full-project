
export default {
  nameScape: 'global',
  state: {
  },
  effects: {
    * login({payload, callback}, {call, put}) {},
  },
  reducers: {
    save(state, {payload}) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
