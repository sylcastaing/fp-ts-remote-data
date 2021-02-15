/**
 * ```ts
 * type RemoteData<E, A> = Pending | Failure<E> | Success<A>
 * ```
 *
 * Represents and async value of one of two possible types (a disjoint union). Value can also be empty with `Pending` value.
 *
 * An instance of `RemoteData` is either an instance of `Pending`, `Failure` or `Success`.
 *
 * A common use of `RemoteData` is as an alternative to `Either` for dealing with possible missing values on pending.
 *
 * @since 2.0.0
 */
import { Monad2 } from 'fp-ts/Monad';
import { flow, identity, Lazy, pipe, Predicate, Refinement } from 'fp-ts/function';
import { Applicative as ApplicativeHKT, Applicative2 } from 'fp-ts/Applicative';
import { Foldable2 } from 'fp-ts/Foldable';
import { Monoid } from 'fp-ts/Monoid';
import { PipeableTraverse2, Traversable2 } from 'fp-ts/Traversable';
import { HKT } from 'fp-ts/HKT';
import { Bifunctor2 } from 'fp-ts/Bifunctor';
import { Alt2 } from 'fp-ts/Alt';
import { Extend2 } from 'fp-ts/Extend';
import { MonadThrow2 } from 'fp-ts/MonadThrow';
import { Either, left, right } from 'fp-ts/Either';
import { none, Option, some } from 'fp-ts/Option';
import { Functor2 } from 'fp-ts/Functor';
import { Eq } from 'fp-ts/Eq';

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

/**
 * @category model
 * @since 2.0.0
 */
export interface Pending {
  readonly _tag: 'Pending';
}

/**
 * @category model
 * @since 2.0.0
 */
export interface Success<A> {
  readonly _tag: 'Success';
  readonly success: A;
}

/**
 * @category model
 * @since 2.0.0
 */
export interface Failure<E> {
  readonly _tag: 'Failure';
  readonly failure: E;
}

/**
 * @category model
 * @since 2.0.0
 */
export type RemoteData<E, A> = Pending | Success<A> | Failure<E>;

// -------------------------------------------------------------------------------------
// guards
// -------------------------------------------------------------------------------------

/**
 * Returns `true` if the RemoteData is an instance of `Pending`, `false` otherwise.
 *
 * @example
 * import * as RD from 'fp-ts-remote-data'
 *
 * RD.isPending(RD.success(1)) // false
 * RD.isPending(RD.failure(1)) // false
 * RD.isPending(RD.pending) // true
 *
 * @category guards
 * @since 2.0.0
 * @param ma
 */
export const isPending = <E, A>(ma: RemoteData<E, A>): ma is Pending => ma._tag === 'Pending';

/**
 * Returns `true` if the RemoteData is an instance of `Success`, `false` otherwise.
 *
 * @example
 * import * as RD from 'fp-ts-remote-data'
 *
 * RD.isSuccess(RD.success(1)) // true
 * RD.isSuccess(RD.failure(1)) // false
 * RD.isSuccess(RD.pending) // false
 *
 * @category guards
 * @since 2.0.0
 * @param ma
 */
export const isSuccess = <E, A>(ma: RemoteData<E, A>): ma is Success<A> => ma._tag === 'Success';

/**
 * Returns `true` if the RemoteData is an instance of `Failure`, `false` otherwise.
 *
 * @example
 * import * as RD from 'fp-ts-remote-data'
 *
 * RD.isSuccess(RD.success(1)) // false
 * RD.isSuccess(RD.failure(1)) // true
 * RD.isSuccess(RD.pending) // false
 *
 * @category guards
 * @since 2.0.0
 * @param ma
 */
export const isFailure = <E, A>(ma: RemoteData<E, A>): ma is Failure<E> => ma._tag === 'Failure';

// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------

/**
 * Get a `RemoteData` with a pending state
 *
 * @category constructors
 * @since 2.0.0
 */
export const pending: RemoteData<never, never> = { _tag: 'Pending' };

/**
 * Constructs a new `RemoteData` holding a `Success` value.
 *
 * @category constructors
 * @since 2.0.0
 * @param a
 */
export const success = <E = never, A = never>(a: A): RemoteData<E, A> => ({ _tag: 'Success', success: a });

/**
 * Constructs a new `RemoteData` holding an `Failure` value.
 *
 * @category constructors
 * @since 2.0.0
 * @param e
 */
export const failure = <E = never, A = never>(e: E): RemoteData<E, A> => ({ _tag: 'Failure', failure: e });

/**
 * Takes a default and a nullable value, if the value is not nully, turn it into a `Success`, if the value is nully use
 * the provided default as a `Failure`.
 *
 * @category constructors
 * @since 2.0.0
 * @param onNull
 */
export function fromNullable<E>(onNull: Lazy<E>): <A>(a: A) => RemoteData<E, NonNullable<A>> {
  return <A>(a: A) => (a == null ? failure(onNull()) : success(a as NonNullable<A>));
}

/**
 * Takes an `Either` and return a `Success` if `Right`, `Failure` if `Left`
 *
 * @category constructors
 * @since 2.0.0
 * @param ei
 */
export function fromEither<E, A>(ei: Either<E, A>): RemoteData<E, A> {
  return ei._tag === 'Left' ? failure(ei.left) : success(ei.right);
}

/**
 * Takes an `Option` and return a `Success` if `Some`, `Failure` if `None` with `onNone` function
 *
 * @category constructors
 * @since 2.0.0
 * @param onNone
 */
export function fromOption<E>(onNone: Lazy<E>): <A>(ma: Option<A>) => RemoteData<E, A> {
  return <A>(ma: Option<A>) => (ma._tag === 'None' ? failure(onNone()) : success(ma.value));
}

/**
 * @category constructors
 * @since 2.0.0
 * @param predicate
 * @param onFalse
 */
export const fromPredicate: {
  <E, A, B extends A>(refinement: Refinement<A, B>, onFalse: (a: A) => E): (a: A) => RemoteData<E, B>;
  <E, A>(predicate: Predicate<A>, onFalse: (a: A) => E): (a: A) => RemoteData<E, A>;
} = <E, A>(predicate: Predicate<A>, onFalse: (a: A) => E) => (a: A) =>
  predicate(a) ? success(a) : failure(onFalse(a));

// -------------------------------------------------------------------------------------
// destructors
// -------------------------------------------------------------------------------------

/**
 * @category destructors
 * @since 2.0.0
 * @param onPending
 * @param onSuccess
 * @param onFailure
 */
export function fold<E, A, B>(
  onPending: () => B,
  onSuccess: (a: A) => B,
  onFailure: (e: E) => B,
): (ma: RemoteData<E, A>) => B {
  return ma => (isPending(ma) ? onPending() : isSuccess(ma) ? onSuccess(ma.success) : onFailure(ma.failure));
}

/**
 * @category destructors
 * @since 2.0.0
 * @param ma
 */
export function toNullable<E, A>(ma: RemoteData<E, A>): A | null {
  return isSuccess(ma) ? ma.success : null;
}

/**
 * @category destructors
 * @since 2.0.0
 * @param ma
 */
export function toUndefined<E, A>(ma: RemoteData<E, A>): A | undefined {
  return isSuccess(ma) ? ma.success : undefined;
}

/**
 * @category destructors
 * @since 2.0.0
 * @param onPending
 */
export function toEither<E>(onPending: () => E): <A>(ma: RemoteData<E, A>) => Either<E, A> {
  return fold(() => left(onPending()), right, left);
}

/**
 * @category destructors
 * @since 2.0.0
 * @param ma
 */
export function getSuccess<E, A>(ma: RemoteData<E, A>): Option<A> {
  return isSuccess(ma) ? some(ma.success) : none;
}

/**
 * @category destructors
 * @since 2.0.0
 * @param ma
 */
export function getFailure<E, A>(ma: RemoteData<E, A>): Option<E> {
  return isFailure(ma) ? some(ma.failure) : none;
}

// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------

/**
 * @category combinators
 * @since 2.0.0
 * @param e
 */
export function fromNullableK<E>(
  e: Lazy<E>,
): <A extends ReadonlyArray<unknown>, B>(
  f: (...a: A) => B | null | undefined,
) => (...a: A) => RemoteData<E, NonNullable<B>> {
  const from = fromNullable(e);
  return f => (...a) => from(f(...a));
}

/**
 * @category combinators
 * @since 2.0.0
 * @param e
 */
export function chainNullableK<E>(
  e: Lazy<E>,
): <A, B>(f: (a: A) => B | null | undefined) => (ma: RemoteData<E, A>) => RemoteData<E, NonNullable<B>> {
  const from = fromNullableK(e);
  return f => chain(from(f));
}

/**
 * @category combinators
 * @since 2.0.0
 * @param ma
 */
export function swap<E, A>(ma: RemoteData<E, A>): RemoteData<A, E> {
  return isSuccess(ma) ? failure(ma.success) : isFailure(ma) ? success(ma.failure) : ma;
}

/**
 * @category combinators
 * @since 2.0.0
 * @param onFailure
 */
export const orElseW = <E, A, M, B>(
  onFailure: (e: E) => RemoteData<M, B>,
): ((ma: RemoteData<E, A>) => RemoteData<M, A | B>) => ma => (isFailure(ma) ? onFailure(ma.failure) : ma);

/**
 * @category combinators
 * @since 2.0.0
 * @param onFailure
 */
export const orElse: <E, A, M>(
  onFailure: (e: E) => RemoteData<M, A>,
) => (ma: RemoteData<E, A>) => RemoteData<M, A> = orElseW;

/**
 * @category combinators
 * @since 2.0.0
 * @param predicate
 * @param onFalse
 */
export const filterOrElseW: {
  <A, B extends A, E2>(refinement: Refinement<A, B>, onFalse: (a: A) => E2): <E1>(
    ma: RemoteData<E1, A>,
  ) => RemoteData<E1 | E2, B>;
  <A, E2>(predicate: Predicate<A>, onFalse: (a: A) => E2): <E1>(ma: RemoteData<E1, A>) => RemoteData<E1 | E2, A>;
} = <A, E2>(predicate: Predicate<A>, onFalse: (a: A) => E2): (<E1>(ma: RemoteData<E1, A>) => RemoteData<E1 | E2, A>) =>
  chainW(a => (predicate(a) ? success(a) : failure(onFalse(a))));

/**
 * @category combinators
 * @since 2.0.0
 * @param predicate
 * @param onFalse
 */
export const filterOrElse: {
  <E, A, B extends A>(refinement: Refinement<A, B>, onFalse: (a: A) => E): (ma: RemoteData<E, A>) => RemoteData<E, B>;
  <E, A>(predicate: Predicate<A>, onFalse: (a: A) => E): (ma: RemoteData<E, A>) => RemoteData<E, A>;
} = filterOrElseW;

// -------------------------------------------------------------------------------------
// non-pipeables
// -------------------------------------------------------------------------------------

const map_: Monad2<URI>['map'] = (fa, f) => pipe(fa, map(f));
const ap_: Monad2<URI>['ap'] = (fab, fa) => pipe(fab, ap(fa));
const chain_: Monad2<URI>['chain'] = (ma, f) => pipe(ma, chain(f));
const reduce_: Foldable2<URI>['reduce'] = (fa, b, f) => pipe(fa, reduce(b, f));
const foldMap_: Foldable2<URI>['foldMap'] = M => (fa, f) => {
  const foldMapM = foldMap(M);
  return pipe(fa, foldMapM(f));
};
const reduceRight_: Foldable2<URI>['reduceRight'] = (fa, b, f) => pipe(fa, reduceRight(b, f));
const traverse_ = <F>(
  F: ApplicativeHKT<F>,
): (<E, A, B>(ta: RemoteData<E, A>, f: (a: A) => HKT<F, B>) => HKT<F, RemoteData<E, B>>) => {
  const traverseF = traverse(F);
  return (ta, f) => pipe(ta, traverseF(f));
};
const bimap_: Bifunctor2<URI>['bimap'] = (fa, f, g) => pipe(fa, bimap(f, g));
const mapLeft_: Bifunctor2<URI>['mapLeft'] = (fa, f) => pipe(fa, mapLeft(f));
const alt_: Alt2<URI>['alt'] = (fa, that) => pipe(fa, alt(that));
const extend_: Extend2<URI>['extend'] = (wa, f) => pipe(wa, extend(f));

// -------------------------------------------------------------------------------------
// pipeables
// -------------------------------------------------------------------------------------

/**
 * @category Functor
 * @since 2.0.0
 * @param f
 */
export const map: <A, B>(f: (a: A) => B) => <E>(fa: RemoteData<E, A>) => RemoteData<E, B> = f => fa =>
  isSuccess(fa) ? success(f(fa.success)) : fa;

/**
 * @category Bifunctor
 * @since 2.0.0
 * @param f
 * @param g
 */
export const bimap: <E, G, A, B>(f: (e: E) => G, g: (a: A) => B) => (fa: RemoteData<E, A>) => RemoteData<G, B> = (
  f,
  g,
) => fa => (isSuccess(fa) ? success(g(fa.success)) : isFailure(fa) ? failure(f(fa.failure)) : fa);

/**
 * @category Bifunctor
 * @since 2.0.0
 * @param f
 */
export const mapLeft: <E, G>(f: (e: E) => G) => <A>(fa: RemoteData<E, A>) => RemoteData<G, A> = f => fa =>
  isFailure(fa) ? failure(f(fa.failure)) : fa;

/**
 * @category Apply
 * @since 2.0.0
 * @param fa
 */
export const apW: <D, A>(
  fa: RemoteData<D, A>,
) => <E, B>(fab: RemoteData<E, (a: A) => B>) => RemoteData<D | E, B> = fa => fab =>
  isSuccess(fab) ? (isSuccess(fa) ? success(fab.success(fa.success)) : fa) : fab;

/**
 * @category Apply
 * @since 2.0.0
 * @param fa
 */
export const ap: <E, A>(fa: RemoteData<E, A>) => <B>(fab: RemoteData<E, (a: A) => B>) => RemoteData<E, B> = apW;

/**
 * Combine two effectful actions, keeping only the result of the first.
 *
 * Derivable from `Apply`.
 *
 * @category combinators
 * @since 2.0.0
 * @param fb
 */
export const apFirst: <E, B>(fb: RemoteData<E, B>) => <A>(fa: RemoteData<E, A>) => RemoteData<E, A> = fb =>
  flow(
    map(a => () => a),
    ap(fb),
  );

/**
 * Combine two effectful actions, keeping only the result of the second.
 *
 * Derivable from `Apply`.
 *
 * @category combinators
 * @since 2.0.0
 * @param fb
 */
export const apSecond = <E, B>(fb: RemoteData<E, B>): (<A>(fa: RemoteData<E, A>) => RemoteData<E, B>) =>
  flow(
    map(() => (b: B) => b),
    ap(fb),
  );

/**
 * Wrap a value into the type constructor.
 *
 * @category Applicative
 * @since 2.0.0
 */
export const of: Applicative2<URI>['of'] = success;

/**
 * @category Monad
 * @since 2.0.0
 * @param f
 */
export const chainW = <D, A, B>(f: (a: A) => RemoteData<D, B>) => <E>(ma: RemoteData<E, A>): RemoteData<D | E, B> =>
  isSuccess(ma) ? f(ma.success) : ma;

/**
 * @category Monad
 * @since 2.0.0
 * @param f
 */
export const chain: <E, A, B>(f: (a: A) => RemoteData<E, B>) => (ma: RemoteData<E, A>) => RemoteData<E, B> = chainW;

/**
 * Less strict version of [`chainFirst`](#chainFirst)
 *
 * @category combinators
 * @since 2.0.0
 * @param f
 */
export const chainFirstW: <D, A, B>(
  f: (a: A) => RemoteData<D, B>,
) => <E>(ma: RemoteData<E, A>) => RemoteData<D | E, A> = f => ma =>
  pipe(
    ma,
    chainW(a =>
      pipe(
        f(a),
        map(() => a),
      ),
    ),
  );

/**
 * Composes computations in sequence, using the return value of one computation to determine the next computation and
 * keeping only the result of the first.
 *
 * Derivable from `Monad`.
 *
 * @category combinators
 * @since 2.0.0
 */
export const chainFirst: <E, A, B>(
  f: (a: A) => RemoteData<E, B>,
) => (ma: RemoteData<E, A>) => RemoteData<E, A> = chainFirstW;

/**
 * @category combinators
 * @since 2.0.0
 * @param f
 */
export const chainEitherW = <D, A, B>(f: (a: A) => Either<D, B>) => <E>(ma: RemoteData<E, A>): RemoteData<D | E, B> =>
  isSuccess(ma) ? fromEither(f(ma.success)) : ma;

/**
 * @category combinators
 * @since 2.0.0
 * @param f
 */
export const chainEither: <E, A, B>(
  f: (a: A) => Either<E, B>,
) => (ma: RemoteData<E, A>) => RemoteData<E, B> = chainEitherW;

/**
 * @category combinators
 * @since 2.0.0
 */
export const flatten: <E, A>(mma: RemoteData<E, RemoteData<E, A>>) => RemoteData<E, A> =
  /*#__PURE__*/
  chain(identity);

/**
 * @category Alt
 * @since 2.0.0
 * @param that
 */
export const altW: <E2, B>(
  that: Lazy<RemoteData<E2, B>>,
) => <E1, A>(fa: RemoteData<E1, A>) => RemoteData<E1 | E2, A | B> = that => fa => (isFailure(fa) ? that() : fa);

/**
 * @category Alt
 * @since 2.0.0
 * @param that
 */
export const alt: <E, A>(that: Lazy<RemoteData<E, A>>) => (fa: RemoteData<E, A>) => RemoteData<E, A> = altW;

/**
 * @category Extend
 * @since 2.0.0
 * @param f
 */
export const extend: <E, A, B>(
  f: (wa: RemoteData<E, A>) => B,
) => (wa: RemoteData<E, A>) => RemoteData<E, B> = f => wa => (isSuccess(wa) ? success(f(wa)) : wa);

/**
 * Derivable from `Extend`.
 *
 * @category combinators
 * @since 2.0.0
 */
export const duplicate: <E, A>(ma: RemoteData<E, A>) => RemoteData<E, RemoteData<E, A>> =
  /*#__PURE__*/
  extend(identity);

/**
 * @category Foldable
 * @since 2.0.0
 * @param b
 * @param f
 */
export const reduce: <A, B>(b: B, f: (b: B, a: A) => B) => <E>(fa: RemoteData<E, A>) => B = (b, f) => fa =>
  isSuccess(fa) ? f(b, fa.success) : b;

/**
 * @category Foldable
 * @since 2.0.0
 * @param M
 */
export const foldMap: <M>(M: Monoid<M>) => <A>(f: (a: A) => M) => <E>(fa: RemoteData<E, A>) => M = M => f => fa =>
  isSuccess(fa) ? f(fa.success) : M.empty;

/**
 * @category Foldable
 * @since 2.0.0
 * @param b
 * @param f
 */
export const reduceRight: <A, B>(b: B, f: (a: A, b: B) => B) => <E>(fa: RemoteData<E, A>) => B = (b, f) => fa =>
  isSuccess(fa) ? f(fa.success, b) : b;

/**
 * @category Traversable
 * @since 2.0.0
 * @param F
 */
export const traverse: PipeableTraverse2<URI> = <F>(F: ApplicativeHKT<F>) => <A, B>(f: (a: A) => HKT<F, B>) => <E>(
  ta: RemoteData<E, A>,
): HKT<F, RemoteData<E, B>> => (isSuccess(ta) ? F.map(f(ta.success), success) : F.of(ta));

/**
 * @category Traversable
 * @since 2.0.0
 * @param F
 */
export const sequence: Traversable2<URI>['sequence'] = <F>(F: ApplicativeHKT<F>) => <E, A>(
  ma: RemoteData<E, HKT<F, A>>,
): HKT<F, RemoteData<E, A>> => (isSuccess(ma) ? F.map<A, RemoteData<E, A>>(ma.success, success) : F.of(ma));

/**
 * @category MonadThrow
 * @since 2.0.0
 */
export const throwError: MonadThrow2<URI>['throwError'] = failure;

// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------

/**
 * @category instances
 * @since 2.0.0
 */
export const URI = 'RemoteData';

/**
 * @category instances
 * @since 2.0.0
 */
export type URI = typeof URI;

declare module 'fp-ts/HKT' {
  interface URItoKind2<E, A> {
    readonly [URI]: RemoteData<E, A>;
  }
}

/**
 * @category instances
 * @since 2.0.0
 */
export const Functor: Functor2<URI> = {
  URI,
  map: map_,
};

/**
 * @category instances
 * @since 2.0.0
 */
export const Applicative: Applicative2<URI> = {
  URI,
  map: map_,
  ap: ap_,
  of,
};

/**
 * @category instances
 * @since 2.0.0
 */
export const Monad: Monad2<URI> = {
  URI,
  map: map_,
  ap: ap_,
  of,
  chain: chain_,
};

/**
 * @category instances
 * @since 2.0.0
 */
export const Foldable: Foldable2<URI> = {
  URI,
  reduce: reduce_,
  foldMap: foldMap_,
  reduceRight: reduceRight_,
};

/**
 * @category instances
 * @since 2.0.0
 */
export const Traversable: Traversable2<URI> = {
  URI,
  map: map_,
  reduce: reduce_,
  foldMap: foldMap_,
  reduceRight: reduceRight_,
  traverse: traverse_,
  sequence,
};

/**
 * @category instances
 * @since 2.0.0
 */
export const Bifunctor: Bifunctor2<URI> = {
  URI,
  bimap: bimap_,
  mapLeft: mapLeft_,
};

/**
 * @category instances
 * @since 2.0.0
 */
export const Alt: Alt2<URI> = {
  URI,
  map: map_,
  alt: alt_,
};

/**
 * @category instances
 * @since 2.0.0
 */
export const Extend: Extend2<URI> = {
  URI,
  map: map_,
  extend: extend_,
};

/**
 * @category instances
 * @since 2.0.0
 */
export const MonadThrow: MonadThrow2<URI> = {
  URI,
  map: map_,
  ap: ap_,
  of,
  chain: chain_,
  throwError: throwError,
};

/**
 * @category instances
 * @since 2.0.0
 */
export const remoteData: Monad2<URI> &
  Foldable2<URI> &
  Traversable2<URI> &
  Bifunctor2<URI> &
  Alt2<URI> &
  Extend2<URI> &
  MonadThrow2<URI> = {
  URI,
  map: map_,
  of,
  ap: ap_,
  chain: chain_,
  reduce: reduce_,
  foldMap: foldMap_,
  reduceRight: reduceRight_,
  traverse: traverse_,
  sequence,
  bimap: bimap_,
  mapLeft: mapLeft_,
  alt: alt_,
  extend: extend_,
  throwError,
};

// -------------------------------------------------------------------------------------
// utils
// -------------------------------------------------------------------------------------

/**
 * @category utils
 * @since 2.0.0
 * @param E
 */
export function elem<A>(
  E: Eq<A>,
): {
  (a: A): <E>(ma: RemoteData<E, A>) => boolean;
  <E>(a: A, ma: RemoteData<E, A>): boolean;
};

/**
 * @category utils
 * @since 2.0.0
 * @param E
 */
export function elem<A>(E: Eq<A>): <E>(a: A, ma?: RemoteData<E, A>) => boolean | ((ma: RemoteData<E, A>) => boolean) {
  return (a, ma) => {
    if (ma === undefined) {
      return ma => elem(E)(a, ma);
    }

    return isSuccess(ma) ? E.equals(a, ma.success) : false;
  };
}

/**
 * @category utils
 * @since 2.0.0
 * @param predicate
 */
export function exists<A>(predicate: Predicate<A>): <E>(ma: RemoteData<E, A>) => boolean {
  return ma => (isSuccess(ma) ? predicate(ma.success) : false);
}
