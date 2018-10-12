import mongoose from 'mongoose';

export function format(model) {
  if (model instanceof mongoose.Types.ObjectId) {
    return model.toString();
  }

  const ret = {};
  const keys = Object.getOwnPropertyNames(model);

  keys.forEach((key) => {
    if (typeof model[key] === 'undefined') {
      return;
    }

    if (key === '_id') {
      ret.id = model._id.toString(); // eslint-disable-line
    } else if (key !== '__v') {
      if (model[key].constructor && model[key].constructor.name === 'Date') {
        ret[key] = model[key].toISOString();
      } else if (model[key].constructor === mongoose.Types.ObjectId) {
        ret[key] = model[key].toString();
      } else if (Array.isArray(model[key])) {
        ret[key] = model[key].map(format);
      } else {
        ret[key] = model[key];
      }
    }
  });

  return ret;
}
