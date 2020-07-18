import magnolia from '../immutable-tree';

const synchronize = (state, action) => {
    if (action === undefined) {
        return "ok"
    }
    switch (action.type) {
        case 'SYNC':
            return "pending";
        case 'SYNC_FAILED':
            return "failed"
        case 'SYNC_SUCCEEDED':
            return "ok"
        default:
            return state;
    }
}
export default synchronize;
