import synchronize from './synchronize'
import magnolia from './magnolia'

export default (state, action) => {
    return {
        synchronize: synchronize(state.synchronize, action),
        magnolia: magnolia(state.magnolia, action)
    };
};
