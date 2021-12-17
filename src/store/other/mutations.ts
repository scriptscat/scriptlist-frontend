import { MutationTree } from 'vuex';
import { OtherStateInterface } from './state';

const mutation: MutationTree<OtherStateInterface> = {
  addMarkdown(state, { id, content }) {
    state.markdown[<string>id] = content;
  }
};

export default mutation;
