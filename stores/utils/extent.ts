import iteratee from 'lodash/fp/iteratee';

function extent<T>(predicate: string) {
  const func = iteratee(predicate);
  return (collection: T[]) => {
    const extent = collection.reduce(
      ([min, max], value) => [Math.min(min, func(value)), Math.max(max, func(value))],
      [Infinity, -Infinity]
    );

    // @TODO Is this a good fallback?
    if (extent[0] === Infinity || extent[1] === -Infinity) {
      return [0, 0];
    }

    return extent;
  };
}

export default extent;
