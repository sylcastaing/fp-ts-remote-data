import { Monad2 } from 'fp-ts/Monad';
import { Lazy, pipe, Predicate, Refinement } from 'fp-ts/function';
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

export const URI = 'RemoteData';

export type URI = 'RemoteData';

declare module 'fp-ts/HKT' {
  interface URItoKind2<E, A> {
    readonly RemoteData: RemoteData<E, A>;
  }
}

export interface Loading {
  readonly _tag: 'Loading';
}
export interface Success<A> {
  readonly _tag: 'Success';
  readonly success: A;
}

export interface Error<E> {
  readonly _tag: 'Error';
  readonly error: E;
}

export type RemoteData<E, A> = Loading | Success<A> | Error<E>;

export const loading: RemoteData<never, never> = { _tag: 'Loading' };

export const success = <E = never, A = never>(a: A): RemoteData<E, A> => ({ _tag: 'Success', success: a });

export const error = <E = never, A = never>(e: E): RemoteData<E, A> => ({ _tag: 'Error', error: e });

export const isSuccess = <E, A>(ma: RemoteData<E, A>): ma is Success<A> => ma._tag === 'Success';

export const isError = <E, A>(ma: RemoteData<E, A>): ma is Error<E> => ma._tag === 'Error';

export const isLoading = <E, A>(ma: RemoteData<E, A>): ma is Loading => ma._tag === 'Loading';

export function fold<E, A, B>(
  onLoading: () => B,
  onSuccess: (a: A) => B,
  onError: (e: E) => B,
): (ma: RemoteData<E, A>) => B {
  return ma => (isLoading(ma) ? onLoading() : isSuccess(ma) ? onSuccess(ma.success) : onError(ma.error));
}

export function fromEither<E, A>(ei: Either<E, A>): RemoteData<E, A> {
  return ei._tag === 'Left' ? error(ei.left) : success(ei.right);
}

export function fromOption<E>(onNone: Lazy<E>): <A>(ma: Option<A>) => RemoteData<E, A> {
  return <A>(ma: Option<A>) => (ma._tag === 'None' ? error(onNone()) : success(ma.value));
}

export function fromNullable<E>(onNull: Lazy<E>): <A>(a: A) => RemoteData<E, NonNullable<A>> {
  return <A>(a: A) => (a == null ? error(onNull()) : success(a as NonNullable<A>));
}

export function toOption<E, A>(ma: RemoteData<E, A>): Option<A> {
  return isSuccess(ma) ? some(ma.success) : none;
}

export function toNullable<E, A>(ma: RemoteData<E, A>): A | null {
  return isSuccess(ma) ? ma.success : null;
}

export function toUndefined<E, A>(ma: RemoteData<E, A>): A | undefined {
  return isSuccess(ma) ? ma.success : undefined;
}

export function toEither<E, A>(ma: RemoteData<E, A>, onLoading: () => E): Either<E, A> {
  return pipe(
    ma,
    fold<E, A, Either<E, A>>(() => left(onLoading()), right, left),
  );
}

export const filterOrElse: {
  <E, A, B extends A>(refinement: Refinement<A, B>, onFalse: (a: A) => E): (ma: RemoteData<E, A>) => RemoteData<E, B>;
  <E, A>(predicate: Predicate<A>, onFalse: (a: A) => E): (ma: RemoteData<E, A>) => RemoteData<E, A>;
} = <E, A>(predicate: Predicate<A>, onFalse: (a: A) => E): ((ma: RemoteData<E, A>) => RemoteData<E, A>) => ma =>
  isSuccess(ma) ? (predicate(ma.success) ? ma : error(onFalse(ma.success))) : ma;

export function swap<E, A>(ma: RemoteData<E, A>): RemoteData<A, E> {
  return isSuccess(ma) ? error(ma.success) : isError(ma) ? success(ma.error) : ma;
}

// -------------------------------------------------------------------------------------
// pipeables
// -------------------------------------------------------------------------------------
export const map: <A, B>(f: (a: A) => B) => <E>(fa: RemoteData<E, A>) => RemoteData<E, B> = f => fa =>
  isSuccess(fa) ? success(f(fa.success)) : fa;

export const apW: <D, A>(
  fa: RemoteData<D, A>,
) => <E, B>(fab: RemoteData<E, (a: A) => B>) => RemoteData<D | E, B> = fa => fab =>
  isSuccess(fab) ? (isSuccess(fa) ? success(fab.success(fa.success)) : fa) : fab;

export const ap: <E, A>(fa: RemoteData<E, A>) => <B>(fab: RemoteData<E, (a: A) => B>) => RemoteData<E, B> = apW;

export const chainW = <D, A, B>(f: (a: A) => RemoteData<D, B>) => <E>(ma: RemoteData<E, A>): RemoteData<D | E, B> =>
  isSuccess(ma) ? f(ma.success) : ma;

export const chain: <E, A, B>(f: (a: A) => RemoteData<E, B>) => (ma: RemoteData<E, A>) => RemoteData<E, B> = chainW;

export const of: Applicative2<URI>['of'] = success;

export const reduce: <A, B>(b: B, f: (b: B, a: A) => B) => <E>(fa: RemoteData<E, A>) => B = (b, f) => fa =>
  isSuccess(fa) ? f(b, fa.success) : b;

export const foldMap: <M>(M: Monoid<M>) => <A>(f: (a: A) => M) => <E>(fa: RemoteData<E, A>) => M = M => f => fa =>
  isSuccess(fa) ? f(fa.success) : M.empty;

export const reduceRight: <A, B>(b: B, f: (a: A, b: B) => B) => <E>(fa: RemoteData<E, A>) => B = (b, f) => fa =>
  isSuccess(fa) ? f(fa.success, b) : b;

export const traverse: PipeableTraverse2<URI> = <F>(F: ApplicativeHKT<F>) => <A, B>(f: (a: A) => HKT<F, B>) => <E>(
  ta: RemoteData<E, A>,
): HKT<F, RemoteData<E, B>> => (isSuccess(ta) ? F.map(f(ta.success), success) : F.of(ta));

export const sequence: Traversable2<URI>['sequence'] = <F>(F: ApplicativeHKT<F>) => <E, A>(
  ma: RemoteData<E, HKT<F, A>>,
): HKT<F, RemoteData<E, A>> => (isSuccess(ma) ? F.map<A, RemoteData<E, A>>(ma.success, success) : F.of(ma));

export const bimap: <E, G, A, B>(f: (e: E) => G, g: (a: A) => B) => (fa: RemoteData<E, A>) => RemoteData<G, B> = (
  f,
  g,
) => fa => (isSuccess(fa) ? success(g(fa.success)) : isError(fa) ? error(f(fa.error)) : fa);

export const mapLeft: <E, G>(f: (e: E) => G) => <A>(fa: RemoteData<E, A>) => RemoteData<G, A> = f => fa =>
  isError(fa) ? error(f(fa.error)) : fa;

export const altW: <E2, B>(
  that: Lazy<RemoteData<E2, B>>,
) => <E1, A>(fa: RemoteData<E1, A>) => RemoteData<E1 | E2, A | B> = that => fa => (isError(fa) ? that() : fa);

export const alt: <E, A>(that: Lazy<RemoteData<E, A>>) => (fa: RemoteData<E, A>) => RemoteData<E, A> = altW;

export const extend: <E, A, B>(
  f: (wa: RemoteData<E, A>) => B,
) => (wa: RemoteData<E, A>) => RemoteData<E, B> = f => wa => (isSuccess(wa) ? success(f(wa)) : wa);

export const throwError: MonadThrow2<URI>['throwError'] = error;

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
