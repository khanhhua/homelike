export const userLookup = (users, id, ...propPath) => users.getIn([id, ...propPath]);
