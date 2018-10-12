import iteratee from 'lodash/fp/iteratee';

function extent<T>(predicate: string) {
  const func = iteratee(predicate);

  return (collection: T[]) =>
    collection.reduce(
      ([min, max], value) => [Math.min(min, func(value)), Math.max(max, func(value))],
      [Infinity, -Infinity]
    );
}

export default extent;
