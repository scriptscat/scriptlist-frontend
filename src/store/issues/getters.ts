import { GetterTree } from 'vuex';
import { StateInterface } from '../index';
import { IssuesStateInterface } from './state';

const getters: GetterTree<IssuesStateInterface, StateInterface> = {
    someAction(/* context */) {
        // your code
    }
};

export default getters;
