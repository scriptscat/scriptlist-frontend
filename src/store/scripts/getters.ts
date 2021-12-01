import { GetterTree } from 'vuex';
import { StateInterface } from '../index';
import { ScriptsStateInterface } from './state';

const getters: GetterTree<ScriptsStateInterface, StateInterface> = {
  someAction (/* context */) {
    // your code
  }
};

export default getters;
