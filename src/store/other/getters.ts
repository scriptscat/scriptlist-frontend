import { GetterTree } from 'vuex';
import { StateInterface } from '../index';
import { OtherStateInterface } from './state';

const getters: GetterTree<OtherStateInterface, StateInterface> = {
  someAction (/* context */) {
    // your code
  }
};

export default getters;
