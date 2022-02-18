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
import { constNull, flow, identity, Lazy, pipe } from 'fp-ts/function';
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
import { bindTo as bindTo_, flap as flap_, Functor2 } from 'fp-ts/Functor';
import { Eq } from 'fp-ts/Eq';
import { Show } from 'fp-ts/Show';
import { Pointed2 } from 'fp-ts/Pointed';
import {
  apFirst as apFirst_,
  Apply2,
  apS as apS_,
  apSecond as apSecond_,
} from 'fp-ts/Apply';
import { bind as bind_, Chain2, chainFirst as chainFirst_ } from 'fp-ts/Chain';
import {
  chainEitherK as chainEitherK_,
  chainOptionK as chainOptionK_,
  filterOrElse as filterOrElse_,
  FromEither2,
  fromEitherK as fromEitherK_,
  fromOption as fromOption_,
  fromOptionK as fromOptionK_,
  fromPredicate as fromPredicate_,
} from 'fp-ts/FromEither';
import { Refinement } from 'fp-ts/Refinement';
import { Predicate } from 'fp-ts/Predicate';

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
// constructors
// -------------------------------------------------------------------------------------

/**
 * Constructs a new `RemoteData` with a pending state
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
export const success = <E = never, A = never>(a: A): RemoteData<E, A> => ({
  _tag: 'Success',
  success: a,
});

/**
 * Constructs a new `RemoteData` holding an `Failure` value.
 *
 * @category constructors
 * @since 2.0.0
 * @param e
 */
export const failure = <E = never, A = never>(e: E): RemoteData<E, A> => ({
  _tag: 'Failure',
  failure: e,
});

// -------------------------------------------------------------------------------------
// non-pipeables
// -------------------------------------------------------------------------------------

const _map: Monad2<URI>['map'] = (fa, f) => pipe(fa, map(f));
const _ap: Monad2<URI>['ap'] = (fab, fa) => pipe(fab, ap(fa));
const _chain: Monad2<URI>['chain'] = (ma, f) => pipe(ma, chain(f));
const _reduce: Foldable2<URI>['reduce'] = (fa, b, f) => pipe(fa, reduce(b, f));
const _foldMap: Foldable2<URI>['foldMap'] = (M) => (fa, f) => {
  const foldMapM = foldMap(M);
  return pipe(fa, foldMapM(f));
};
const _reduceRight: Foldable2<URI>['reduceRight'] = (fa, b, f) =>
  pipe(fa, reduceRight(b, f));
const _traverse = <F>(
  a: ApplicativeHKT<F>
): (<E, A, B>(
  ta: RemoteData<E, A>,
  f: (a: A) => HKT<F, B>
) => HKT<F, RemoteData<E, B>>) => {
  const traverseF = traverse(a);
  return (ta, f) => pipe(ta, traverseF(f));
};
const _bimap: Bifunctor2<URI>['bimap'] = (fa, f, g) => pipe(fa, bimap(f, g));
const _mapLeft: Bifunctor2<URI>['mapLeft'] = (fa, f) => pipe(fa, mapLeft(f));
const _alt: Alt2<URI>['alt'] = (fa, that) => pipe(fa, alt(that));
const _extend: Extend2<URI>['extend'] = (wa, f) => pipe(wa, extend(f));

// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------

/**
 * @category instances
 * @since 2.0.0
 */
export const URI = 'RemoteData';

/* eslint-disable */

/**
 * @category instances
 * @since 2.0.0
 */
export type URI = typeof URI;

/* eslint-enable */

declare module 'fp-ts/HKT' {
  interface URItoKind2<E, A> {
    readonly [URI]: RemoteData<E, A>;
  }
}

/**
 * @category instances
 * @since 2.11.0
 * @param SE
 * @param SA
 */
export const getShow = <E, A>(
  SE: Show<E>,
  SA: Show<A>
): Show<RemoteData<E, A>> => ({
  show: (ma) =>
    isPending(ma)
      ? 'pending'
      : isFailure(ma)
      ? `failure(${SE.show(ma.failure)})`
      : `success(${SA.show(ma.success)})`,
});

/**
 * @category instances
 * @since 2.11.0
 * @param EL
 * @param EA
 */
export const getEq = <E, A>(EL: Eq<E>, EA: Eq<A>): Eq<RemoteData<E, A>> => ({
  equals: (x, y) =>
    x === y ||
    (isPending(x) && isPending(y)) ||
    (isFailure(x) && isFailure(y) && EL.equals(x.failure, y.failure)) ||
    (isSuccess(x) && isSuccess(y) && EA.equals(x.success, y.success)),
});

/**
 * @category instance operations
 * @since 2.0.0
 * @param f
 */
export const map: <A, B>(
  f: (a: A) => B
) => <E>(fa: RemoteData<E, A>) => RemoteData<E, B> = (f) => (fa) =>
  isSuccess(fa) ? success(f(fa.success)) : fa;

/**
 * @category instances
 * @since 2.0.0
 */
export const Functor: Functor2<URI> = {
  URI,
  map: _map,
};

/**
 * Wrap a value into the type constructor.
 *
 * @category Applicative
 * @since 2.0.0
 */
export const of: <E = never, A = never>(a: A) => RemoteData<E, A> = success;

/**
 * @category instances
 * @since 2.11.0
 */
export const Pointed: Pointed2<URI> = {
  URI,
  of,
};

/**
 * Less strict version of [`ap`](#ap).
 *
 * @category instance operations
 * @since 2.0.0
 * @param fa
 */
export const apW: <D, A>(
  fa: RemoteData<D, A>
) => <E, B>(fab: RemoteData<E, (a: A) => B>) => RemoteData<D | E, B> =
  (fa) => (fab) =>
    isSuccess(fab)
      ? isSuccess(fa)
        ? success(fab.success(fa.success))
        : fa
      : fab;

/**
 * Apply a function to an argument under a type constructor.
 *
 * @category instance operations
 * @since 2.0.0
 * @param fa
 */
export const ap: <E, A>(
  fa: RemoteData<E, A>
) => <B>(fab: RemoteData<E, (a: A) => B>) => RemoteData<E, B> = apW;

/**
 * @category instances
 * @since 2.10.0
 */
export const Apply: Apply2<URI> = {
  URI,
  map: _map,
  ap: _ap,
};

/**
 * @category instances
 * @since 2.0.0
 */
export const Applicative: Applicative2<URI> = {
  URI,
  map: _map,
  ap: _ap,
  of,
};

/**
 * Less strict version of [`chain`](#chain).
 *
 * @category instance operations
 * @since 2.0.0
 * @param f
 */
export const chainW =
  <D, A, B>(f: (a: A) => RemoteData<D, B>) =>
  <E>(ma: RemoteData<E, A>): RemoteData<D | E, B> =>
    isSuccess(ma) ? f(ma.success) : ma;

/**
 * Composes computations in sequence, using the return value of one computation to determine the next computation.
 *
 * @category instance operations
 * @since 2.0.0
 * @param f
 */
export const chain: <E, A, B>(
  f: (a: A) => RemoteData<E, B>
) => (ma: RemoteData<E, A>) => RemoteData<E, B> = chainW;

/**
 * @category instances
 * @since 2.11.0
 */
export const Chain: Chain2<URI> = {
  URI,
  map: _map,
  ap: _ap,
  chain: _chain,
};

/**
 * @category instances
 * @since 2.0.0
 */
export const Monad: Monad2<URI> = {
  URI,
  map: _map,
  ap: _ap,
  of,
  chain: _chain,
};

/**
 * @category instance operations
 * @since 2.0.0
 * @param b
 * @param f
 */
export const reduce: <A, B>(
  b: B,
  f: (b: B, a: A) => B
) => <E>(fa: RemoteData<E, A>) => B = (b, f) => (fa) =>
  isSuccess(fa) ? f(b, fa.success) : b;

/**
 * @category instance operations
 * @since 2.0.0
 * @param M
 */
export const foldMap: <M>(
  M: Monoid<M>
) => <A>(f: (a: A) => M) => <E>(fa: RemoteData<E, A>) => M =
  (M) => (f) => (fa) =>
    isSuccess(fa) ? f(fa.success) : M.empty;

/**
 * @category instance operations
 * @since 2.0.0
 * @param b
 * @param f
 */
export const reduceRight: <A, B>(
  b: B,
  f: (a: A, b: B) => B
) => <E>(fa: RemoteData<E, A>) => B = (b, f) => (fa) =>
  isSuccess(fa) ? f(fa.success, b) : b;

/**
 * @category instances
 * @since 2.0.0
 */
export const Foldable: Foldable2<URI> = {
  URI,
  reduce: _reduce,
  foldMap: _foldMap,
  reduceRight: _reduceRight,
};

/**
 * @category instance operations
 * @since 2.0.0
 * @param a
 */
export const traverse: PipeableTraverse2<URI> =
  <F>(a: ApplicativeHKT<F>) =>
  <A, B>(f: (a: A) => HKT<F, B>) =>
  <E>(ta: RemoteData<E, A>): HKT<F, RemoteData<E, B>> =>
    isSuccess(ta) ? a.map(f(ta.success), success) : a.of(ta);

/**
 * @category instance operations
 * @since 2.0.0
 * @param a
 */
export const sequence: Traversable2<URI>['sequence'] =
  <F>(a: ApplicativeHKT<F>) =>
  <E, A>(ma: RemoteData<E, HKT<F, A>>): HKT<F, RemoteData<E, A>> =>
    isSuccess(ma) ? a.map<A, RemoteData<E, A>>(ma.success, success) : a.of(ma);

/**
 * @category instances
 * @since 2.0.0
 */
export const Traversable: Traversable2<URI> = {
  URI,
  map: _map,
  reduce: _reduce,
  foldMap: _foldMap,
  reduceRight: _reduceRight,
  traverse: _traverse,
  sequence,
};

/**
 * @category instance operations
 * @since 2.0.0
 * @param f
 * @param g
 */
export const bimap: <E, G, A, B>(
  f: (e: E) => G,
  g: (a: A) => B
) => (fa: RemoteData<E, A>) => RemoteData<G, B> = (f, g) => (fa) =>
  isSuccess(fa)
    ? success(g(fa.success))
    : isFailure(fa)
    ? failure(f(fa.failure))
    : fa;

/**
 * @category instance operations
 * @since 2.0.0
 * @param f
 */
export const mapLeft: <E, G>(
  f: (e: E) => G
) => <A>(fa: RemoteData<E, A>) => RemoteData<G, A> = (f) => (fa) =>
  isFailure(fa) ? failure(f(fa.failure)) : fa;

/**
 * @category instances
 * @since 2.0.0
 */
export const Bifunctor: Bifunctor2<URI> = {
  URI,
  bimap: _bimap,
  mapLeft: _mapLeft,
};

/**
 * @category instance operations
 * @since 2.0.0
 * @param that
 */
export const altW: <E2, B>(
  that: Lazy<RemoteData<E2, B>>
) => <E1, A>(fa: RemoteData<E1, A>) => RemoteData<E1 | E2, A | B> =
  (that) => (fa) =>
    isFailure(fa) ? that() : fa;

/**
 * @category instance operations
 * @since 2.0.0
 * @param that
 */
export const alt: <E, A>(
  that: Lazy<RemoteData<E, A>>
) => (fa: RemoteData<E, A>) => RemoteData<E, A> = altW;

/**
 * @category instances
 * @since 2.0.0
 */
export const Alt: Alt2<URI> = {
  URI,
  map: _map,
  alt: _alt,
};

/**
 * @category instance operations
 * @since 2.0.0
 * @param f
 */
export const extend: <E, A, B>(
  f: (wa: RemoteData<E, A>) => B
) => (wa: RemoteData<E, A>) => RemoteData<E, B> = (f) => (wa) =>
  isSuccess(wa) ? success(f(wa)) : wa;

/**
 * @category instances
 * @since 2.0.0
 */
export const Extend: Extend2<URI> = {
  URI,
  map: _map,
  extend: _extend,
};

/**
 * @category instance operations
 * @since 2.0.0
 */
export const throwError: MonadThrow2<URI>['throwError'] = failure;

/**
 * @category instances
 * @since 2.0.0
 */
export const MonadThrow: MonadThrow2<URI> = {
  URI,
  map: _map,
  ap: _ap,
  of,
  chain: _chain,
  throwError: throwError,
};

/**
 * Takes an `Either` and return a `Success` if `Right`, `Failure` if `Left`
 *
 * @category instances
 * @since 2.0.0
 * @param ei
 */
export function fromEither<E, A>(ei: Either<E, A>): RemoteData<E, A> {
  return ei._tag === 'Left' ? failure(ei.left) : success(ei.right);
}

/**
 * @category instances
 * @since 2.11.0
 */
export const FromEither: FromEither2<URI> = {
  URI,
  fromEither,
};

/**
 * @category constructors
 * @since 2.0.0
 */
export const fromPredicate =
  /*#__PURE__*/
  fromPredicate_(FromEither);

/**
 * @category natural transformations
 * @since 2.0.0
 */
export const fromOption =
  /*#__PURE__*/
  fromOption_(FromEither);

// -------------------------------------------------------------------------------------
// refinements
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
export const isPending = <E, A>(ma: RemoteData<E, A>): ma is Pending =>
  ma._tag === 'Pending';

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
export const isSuccess = <E, A>(ma: RemoteData<E, A>): ma is Success<A> =>
  ma._tag === 'Success';

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
export const isFailure = <E, A>(ma: RemoteData<E, A>): ma is Failure<E> =>
  ma._tag === 'Failure';

// -------------------------------------------------------------------------------------
// destructors
// -------------------------------------------------------------------------------------

/**
 * Less strict version of [`match`](#match).
 *
 * @category destructors
 * @since 2.11.0
 */
export const matchW =
  <B, E, C, A, D>(
    onPending: () => B,
    onSuccess: (a: A) => D,
    onFailure: (E: E) => C
  ) =>
  (ma: RemoteData<E, A>): B | C | D =>
    isPending(ma)
      ? onPending()
      : isSuccess(ma)
      ? onSuccess(ma.success)
      : onFailure(ma.failure);

/**
 * Alias of [`matchW`](#matchw).
 *
 * @category destructors
 * @since 2.11.0
 */
export const foldW = matchW;

/**
 * @category destructors
 * @since 2.11.0
 */
export const match: <E, A, B>(
  onPending: () => B,
  onSuccess: (a: A) => B,
  onFailure: (e: E) => B
) => (ma: RemoteData<E, A>) => B = matchW;

/**
 * Alias of [`match`](#match).
 *
 * @category destructors
 * @since 2.0.0
 */
export const fold: <E, A, B>(
  onPending: () => B,
  onSuccess: (a: A) => B,
  onFailure: (e: E) => B
) => (ma: RemoteData<E, A>) => B = matchW;

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
export function toEither<E>(
  onPending: () => E
): <A>(ma: RemoteData<E, A>) => Either<E, A> {
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
 * Derivable from `Functor`.
 *
 * @category combinators
 * @since 2.11.0
 */
export const flap =
  /*#__PURE__*/
  flap_(Functor);

/**
 * Combine two effectful actions, keeping only the result of the first.
 *
 * Derivable from `Apply`.
 *
 * @category combinators
 * @since 2.0.0
 */
export const apFirst =
  /*#__PURE__*/
  apFirst_(Apply);

/**
 * Combine two effectful actions, keeping only the result of the second.
 *
 * Derivable from `Apply`.
 *
 * @category combinators
 * @since 2.0.0
 */
export const apSecond =
  /*#__PURE__*/
  apSecond_(Apply);

/**
 * Composes computations in sequence, using the return value of one computation to determine the next computation and
 * keeping only the result of the first.
 *
 * Derivable from `Chain`.
 *
 * @category combinators
 * @since 2.0.0
 */
export const chainFirst: <E, A, B>(
  f: (a: A) => RemoteData<E, B>
) => (ma: RemoteData<E, A>) => RemoteData<E, A> =
  /*#__PURE__*/
  chainFirst_(Chain);

/**
 * Less strict version of [`chainFirst`](#chainfirst)
 *
 * Derivable from `Chain`.
 *
 * @category combinators
 * @since 2.0.0
 */
export const chainFirstW: <E2, A, B>(
  f: (a: A) => RemoteData<E2, B>
) => <E1>(ma: RemoteData<E1, A>) => RemoteData<E1 | E2, A> = chainFirst as any;

/**
 * Less strict version of [`flatten`](#flatten).
 *
 * @category combinators
 * @since 2.11.0
 */
export const flattenW: <E1, E2, A>(
  mma: RemoteData<E1, RemoteData<E2, A>>
) => RemoteData<E1 | E2, A> =
  /*#__PURE__*/
  chainW(identity);

/**
 * @category combinators
 * @since 2.0.0
 */
export const flatten: <E, A>(
  mma: RemoteData<E, RemoteData<E, A>>
) => RemoteData<E, A> = flattenW;

/**
 * Derivable from `Extend`.
 *
 * @category combinators
 * @since 2.0.0
 */
export const duplicate: <E, A>(
  ma: RemoteData<E, A>
) => RemoteData<E, RemoteData<E, A>> =
  /*#__PURE__*/
  extend(identity);

/**
 * @category combinators
 * @since 2.11.0
 */
export const fromOptionK =
  /*#__PURE__*/
  fromOptionK_(FromEither);

/**
 * @category combinators
 * @since 2.11.0
 */
export const chainOptionK =
  /*#__PURE__*/
  chainOptionK_(FromEither, Chain);

/**
 * @category combinators
 * @since 2.11.0
 */
export const fromEitherK =
  /*#__PURE__*/
  fromEitherK_(FromEither);

/**
 * @category combinators
 * @since 2.11.0
 */
export const chainEitherK =
  /*#__PURE__*/
  chainEitherK_(FromEither, Chain);

/**
 * @category combinators
 * @since 2.0.0
 * @deprecated
 */
export const chainEither = chainEitherK;

/**
 * @category combinators
 * @since 2.0.0
 */
export const filterOrElse =
  /*#__PURE__*/
  filterOrElse_(FromEither, Chain);

/**
 * @category combinators
 * @since 2.0.0
 */
export const filterOrElseW: {
  <A, B extends A, E2>(refinement: Refinement<A, B>, onFalse: (a: A) => E2): <
    E1
  >(
    ma: RemoteData<E1, A>
  ) => RemoteData<E1 | E2, B>;
  <A, E2>(predicate: Predicate<A>, onFalse: (a: A) => E2): <E1, B extends A>(
    mb: RemoteData<E1, B>
  ) => RemoteData<E1 | E2, B>;
  <A, E2>(predicate: Predicate<A>, onFalse: (a: A) => E2): <E1>(
    ma: RemoteData<E1, A>
  ) => RemoteData<E1 | E2, A>;
} = filterOrElse;

/**
 * @category combinators
 * @since 2.0.0
 */
export const swap = <E, A>(ma: RemoteData<E, A>): RemoteData<A, E> =>
  isSuccess(ma)
    ? failure(ma.success)
    : isFailure(ma)
    ? success(ma.failure)
    : ma;

/**
 * Less strict version of [`orElse`](#orelse).
 *
 * @category combinators
 * @since 2.0.0
 * @param onFailure
 */
export const orElseW =
  <E, A, M, B>(
    onFailure: (e: E) => RemoteData<M, B>
  ): ((ma: RemoteData<E, A>) => RemoteData<M, A | B>) =>
  (ma) =>
    isFailure(ma) ? onFailure(ma.failure) : ma;

/**
 * Useful for recovering from errors.
 *
 * @category combinators
 * @since 2.0.0
 * @param onFailure
 */
export const orElse: <E, A, M>(
  onFailure: (e: E) => RemoteData<M, A>
) => (ma: RemoteData<E, A>) => RemoteData<M, A> = orElseW;

// -------------------------------------------------------------------------------------
// interop
// -------------------------------------------------------------------------------------

/**
 * Takes a default and a nullable value, if the value is not nully, turn it into a `Success`, if the value is nully use
 * the provided default as a `Failure`.
 *
 * @category interop
 * @since 2.0.0
 */
export const fromNullable =
  <E>(e: E) =>
  <A>(a: A): RemoteData<E, NonNullable<A>> =>
    a == null ? failure(e) : success(a as NonNullable<A>);

/**
 * @category interop
 * @since 2.11.0
 */
export const tryCatch = <E, A>(
  f: Lazy<A>,
  onThrow: (e: unknown) => E
): RemoteData<E, A> => {
  try {
    return success(f());
  } catch (e) {
    return failure(onThrow(e));
  }
};

/**
 * Converts a function that may throw to one returning a `Either`.
 *
 * @category interop
 * @since 2.10.0
 */
export const tryCatchK =
  <A extends ReadonlyArray<unknown>, B, E>(
    f: (...a: A) => B,
    onThrow: (error: unknown) => E
  ): ((...a: A) => RemoteData<E, B>) =>
  (...a) =>
    tryCatch(() => f(...a), onThrow);

/**
 * @category interop
 * @since 2.0.0
 */
export const fromNullableK = <E>(
  e: E
): (<A extends ReadonlyArray<unknown>, B>(
  f: (...a: A) => B | null | undefined
) => (...a: A) => RemoteData<E, NonNullable<B>>) => {
  const from = fromNullable(e);
  return (f) => flow(f, from);
};

/**
 * @category combinators
 * @since 2.0.0
 * @param e
 */
export function chainNullableK<E>(
  e: E
): <A, B>(
  f: (a: A) => B | null | undefined
) => (ma: RemoteData<E, A>) => RemoteData<E, NonNullable<B>> {
  const from = fromNullableK(e);
  return (f) => chain(from(f));
}

/**
 * @category interop
 * @since 2.11.0
 */
export const toUnion: <E, A>(fa: RemoteData<E, A>) => E | A | null =
  /*#__PURE__*/
  foldW(constNull, identity, identity);

// -------------------------------------------------------------------------------------
// utils
// -------------------------------------------------------------------------------------

/**
 * @category utils
 * @since 2.0.0
 * @param E
 */
export function elem<A>(E: Eq<A>): {
  (a: A): <E>(ma: RemoteData<E, A>) => boolean;
  <E>(a: A, ma: RemoteData<E, A>): boolean;
};

/**
 * @category utils
 * @since 2.0.0
 * @param E
 */
export function elem<A>(
  E: Eq<A>
): <E>(
  a: A,
  ma?: RemoteData<E, A>
) => boolean | ((ma: RemoteData<E, A>) => boolean) {
  return (a, ma) => {
    if (ma === undefined) {
      return (ma) => elem(E)(a, ma);
    }

    return isSuccess(ma) ? E.equals(a, ma.success) : false;
  };
}

/**
 * @category utils
 * @since 2.0.0
 * @param predicate
 */
export function exists<A>(
  predicate: Predicate<A>
): <E>(ma: RemoteData<E, A>) => boolean {
  return (ma) => (isSuccess(ma) ? predicate(ma.success) : false);
}

// -------------------------------------------------------------------------------------
// do notation
// -------------------------------------------------------------------------------------

/**
 * @since 2.11.0
 */
export const Do: RemoteData<never, {}> =
  /*#__PURE__*/
  of({});

/**
 * @since 2.11.0
 */
export const bindTo =
  /*#__PURE__*/
  bindTo_(Functor);

/**
 * @since 2.11.0
 */
export const bind =
  /*#__PURE__*/
  bind_(Chain);

/**
 * @since 2.8.0
 */
export const bindW: <N extends string, A, E2, B>(
  name: Exclude<N, keyof A>,
  f: (a: A) => RemoteData<E2, B>
) => <E1>(
  fa: RemoteData<E1, A>
) => RemoteData<
  E1 | E2,
  { readonly [K in keyof A | N]: K extends keyof A ? A[K] : B }
> = bind as any;

// -------------------------------------------------------------------------------------
// pipeable sequence S
// -------------------------------------------------------------------------------------
/**
 * @since 2.8.0
 */
export const apS =
  /*#__PURE__*/
  apS_(Apply);

/**
 * @since 2.8.0
 */
export const apSW: <A, N extends string, E2, B>(
  name: Exclude<N, keyof A>,
  fb: RemoteData<E2, B>
) => <E1>(
  fa: RemoteData<E1, A>
) => RemoteData<
  E1 | E2,
  { readonly [K in keyof A | N]: K extends keyof A ? A[K] : B }
> = apS as any;

// -------------------------------------------------------------------------------------
// sequence T
// -------------------------------------------------------------------------------------

/**
 * @since 2.11.0
 */
export const ApT: RemoteData<never, readonly []> =
  /*#__PURE__*/
  of([]);

// -------------------------------------------------------------------------------------
// deprecated
// -------------------------------------------------------------------------------------
/**
 * @category instances
 * @since 2.0.0
 * @deprecated
 */
export const remoteData: Monad2<URI> &
  Foldable2<URI> &
  Traversable2<URI> &
  Bifunctor2<URI> &
  Alt2<URI> &
  Extend2<URI> &
  MonadThrow2<URI> = {
  URI,
  map: _map,
  of,
  ap: _ap,
  chain: _chain,
  reduce: _reduce,
  foldMap: _foldMap,
  reduceRight: _reduceRight,
  traverse: _traverse,
  sequence,
  bimap: _bimap,
  mapLeft: _mapLeft,
  alt: _alt,
  extend: _extend,
  throwError,
};
