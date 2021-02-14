---
title: index.ts
nav_order: 1
parent: Modules
---

## index overview

```ts
type RemoteData<E, A> = Loading | Failure<E> | Success<A>
```

Represents and async value of one of two possible types (a disjoint union). Value can also be empty with `Loading` value.

An instance of `RemoteData` is either an instance of `Loading`, `Failure` or `Success`.

A common use of `RemoteData` is as an alternative to `Either` for dealing with possible missing values on loading.

Added in v2.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [Alt](#alt)
  - [alt](#alt)
  - [altW](#altw)
- [Applicative](#applicative)
  - [of](#of)
- [Apply](#apply)
  - [ap](#ap)
  - [apW](#apw)
- [Bifunctor](#bifunctor)
  - [bimap](#bimap)
  - [mapLeft](#mapleft)
- [Extend](#extend)
  - [extend](#extend)
- [Foldable](#foldable)
  - [foldMap](#foldmap)
  - [reduce](#reduce)
  - [reduceRight](#reduceright)
- [Functor](#functor)
  - [map](#map)
- [Monad](#monad)
  - [chain](#chain)
  - [chainW](#chainw)
- [MonadThrow](#monadthrow)
  - [throwError](#throwerror)
- [Traversable](#traversable)
  - [sequence](#sequence)
  - [traverse](#traverse)
- [combinators](#combinators)
  - [apFirst](#apfirst)
  - [apSecond](#apsecond)
  - [chainEither](#chaineither)
  - [chainEitherW](#chaineitherw)
  - [chainFirst](#chainfirst)
  - [chainFirstW](#chainfirstw)
  - [chainNullableK](#chainnullablek)
  - [duplicate](#duplicate)
  - [filterOrElse](#filterorelse)
  - [filterOrElseW](#filterorelsew)
  - [flatten](#flatten)
  - [fromNullableK](#fromnullablek)
  - [orElse](#orelse)
  - [swap](#swap)
- [constructors](#constructors)
  - [failure](#failure)
  - [fromEither](#fromeither)
  - [fromNullable](#fromnullable)
  - [fromOption](#fromoption)
  - [fromPredicate](#frompredicate)
  - [loading](#loading)
  - [success](#success)
- [destructors](#destructors)
  - [fold](#fold)
  - [getFailure](#getfailure)
  - [getSuccess](#getsuccess)
  - [toEither](#toeither)
  - [toNullable](#tonullable)
  - [toUndefined](#toundefined)
- [guards](#guards)
  - [isFailure](#isfailure)
  - [isLoading](#isloading)
  - [isSuccess](#issuccess)
- [instances](#instances)
  - [Alt](#alt-1)
  - [Applicative](#applicative-1)
  - [Bifunctor](#bifunctor-1)
  - [Extend](#extend-1)
  - [Foldable](#foldable-1)
  - [Functor](#functor-1)
  - [Monad](#monad-1)
  - [MonadThrow](#monadthrow-1)
  - [Traversable](#traversable-1)
  - [URI](#uri)
  - [URI (type alias)](#uri-type-alias)
  - [remoteData](#remotedata)
- [model](#model)
  - [Failure (interface)](#failure-interface)
  - [Loading (interface)](#loading-interface)
  - [RemoteData (type alias)](#remotedata-type-alias)
  - [Success (interface)](#success-interface)
- [utils](#utils)
  - [elem](#elem)
  - [exists](#exists)

---

# Alt

## alt

**Signature**

```ts
export declare const alt: <E, A>(that: Lazy<RemoteData<E, A>>) => (fa: RemoteData<E, A>) => RemoteData<E, A>
```

Added in v2.0.0

## altW

**Signature**

```ts
export declare const altW: <E2, B>(
  that: Lazy<RemoteData<E2, B>>
) => <E1, A>(fa: RemoteData<E1, A>) => RemoteData<E2 | E1, B | A>
```

Added in v2.0.0

# Applicative

## of

Wrap a value into the type constructor.

**Signature**

```ts
export declare const of: <E, A>(a: A) => RemoteData<E, A>
```

Added in v2.0.0

# Apply

## ap

**Signature**

```ts
export declare const ap: <E, A>(fa: RemoteData<E, A>) => <B>(fab: RemoteData<E, (a: A) => B>) => RemoteData<E, B>
```

Added in v2.0.0

## apW

**Signature**

```ts
export declare const apW: <D, A>(
  fa: RemoteData<D, A>
) => <E, B>(fab: RemoteData<E, (a: A) => B>) => RemoteData<D | E, B>
```

Added in v2.0.0

# Bifunctor

## bimap

**Signature**

```ts
export declare const bimap: <E, G, A, B>(f: (e: E) => G, g: (a: A) => B) => (fa: RemoteData<E, A>) => RemoteData<G, B>
```

Added in v2.0.0

## mapLeft

**Signature**

```ts
export declare const mapLeft: <E, G>(f: (e: E) => G) => <A>(fa: RemoteData<E, A>) => RemoteData<G, A>
```

Added in v2.0.0

# Extend

## extend

**Signature**

```ts
export declare const extend: <E, A, B>(f: (wa: RemoteData<E, A>) => B) => (wa: RemoteData<E, A>) => RemoteData<E, B>
```

Added in v2.0.0

# Foldable

## foldMap

**Signature**

```ts
export declare const foldMap: <M>(M: Monoid<M>) => <A>(f: (a: A) => M) => <E>(fa: RemoteData<E, A>) => M
```

Added in v2.0.0

## reduce

**Signature**

```ts
export declare const reduce: <A, B>(b: B, f: (b: B, a: A) => B) => <E>(fa: RemoteData<E, A>) => B
```

Added in v2.0.0

## reduceRight

**Signature**

```ts
export declare const reduceRight: <A, B>(b: B, f: (a: A, b: B) => B) => <E>(fa: RemoteData<E, A>) => B
```

Added in v2.0.0

# Functor

## map

**Signature**

```ts
export declare const map: <A, B>(f: (a: A) => B) => <E>(fa: RemoteData<E, A>) => RemoteData<E, B>
```

Added in v2.0.0

# Monad

## chain

**Signature**

```ts
export declare const chain: <E, A, B>(f: (a: A) => RemoteData<E, B>) => (ma: RemoteData<E, A>) => RemoteData<E, B>
```

Added in v2.0.0

## chainW

**Signature**

```ts
export declare const chainW: <D, A, B>(
  f: (a: A) => RemoteData<D, B>
) => <E>(ma: RemoteData<E, A>) => RemoteData<D | E, B>
```

Added in v2.0.0

# MonadThrow

## throwError

**Signature**

```ts
export declare const throwError: <E, A>(e: E) => RemoteData<E, A>
```

Added in v2.0.0

# Traversable

## sequence

**Signature**

```ts
export declare const sequence: Sequence2<'RemoteData'>
```

Added in v2.0.0

## traverse

**Signature**

```ts
export declare const traverse: PipeableTraverse2<'RemoteData'>
```

Added in v2.0.0

# combinators

## apFirst

Combine two effectful actions, keeping only the result of the first.

Derivable from `Apply`.

**Signature**

```ts
export declare const apFirst: <E, B>(fb: RemoteData<E, B>) => <A>(fa: RemoteData<E, A>) => RemoteData<E, A>
```

Added in v2.0.0

## apSecond

Combine two effectful actions, keeping only the result of the second.

Derivable from `Apply`.

**Signature**

```ts
export declare const apSecond: <E, B>(fb: RemoteData<E, B>) => <A>(fa: RemoteData<E, A>) => RemoteData<E, B>
```

Added in v2.0.0

## chainEither

**Signature**

```ts
export declare const chainEither: <E, A, B>(f: (a: A) => Either<E, B>) => (ma: RemoteData<E, A>) => RemoteData<E, B>
```

Added in v2.0.0

## chainEitherW

**Signature**

```ts
export declare const chainEitherW: <D, A, B>(
  f: (a: A) => Either<D, B>
) => <E>(ma: RemoteData<E, A>) => RemoteData<D | E, B>
```

Added in v2.0.0

## chainFirst

Composes computations in sequence, using the return value of one computation to determine the next computation and
keeping only the result of the first.

Derivable from `Monad`.

**Signature**

```ts
export declare const chainFirst: <E, A, B>(f: (a: A) => RemoteData<E, B>) => (ma: RemoteData<E, A>) => RemoteData<E, A>
```

Added in v2.0.0

## chainFirstW

Less strict version of [`chainFirst`](#chainFirst)

**Signature**

```ts
export declare const chainFirstW: <D, A, B>(
  f: (a: A) => RemoteData<D, B>
) => <E>(ma: RemoteData<E, A>) => RemoteData<D | E, A>
```

Added in v2.0.0

## chainNullableK

**Signature**

```ts
export declare function chainNullableK<E>(
  e: Lazy<E>
): <A, B>(f: (a: A) => B | null | undefined) => (ma: RemoteData<E, A>) => RemoteData<E, NonNullable<B>>
```

Added in v2.0.0

## duplicate

Derivable from `Extend`.

**Signature**

```ts
export declare const duplicate: <E, A>(ma: RemoteData<E, A>) => RemoteData<E, RemoteData<E, A>>
```

Added in v2.0.0

## filterOrElse

**Signature**

```ts
export declare const filterOrElse: {
  <E, A, B extends A>(refinement: Refinement<A, B>, onFalse: (a: A) => E): (ma: RemoteData<E, A>) => RemoteData<E, B>
  <E, A>(predicate: Predicate<A>, onFalse: (a: A) => E): (ma: RemoteData<E, A>) => RemoteData<E, A>
}
```

Added in v2.0.0

## filterOrElseW

**Signature**

```ts
export declare const filterOrElseW: {
  <A, B extends A, E2>(refinement: Refinement<A, B>, onFalse: (a: A) => E2): <E1>(
    ma: RemoteData<E1, A>
  ) => RemoteData<E2 | E1, B>
  <A, E2>(predicate: Predicate<A>, onFalse: (a: A) => E2): <E1>(ma: RemoteData<E1, A>) => RemoteData<E2 | E1, A>
}
```

Added in v2.0.0

## flatten

**Signature**

```ts
export declare const flatten: <E, A>(mma: RemoteData<E, RemoteData<E, A>>) => RemoteData<E, A>
```

Added in v2.0.0

## fromNullableK

**Signature**

```ts
export declare function fromNullableK<E>(
  e: Lazy<E>
): <A extends ReadonlyArray<unknown>, B>(
  f: (...a: A) => B | null | undefined
) => (...a: A) => RemoteData<E, NonNullable<B>>
```

Added in v2.0.0

## orElse

**Signature**

```ts
export declare function orElse<E, A, M>(
  onFailure: (e: E) => RemoteData<M, A>
): (ma: RemoteData<E, A>) => RemoteData<M, A>
```

Added in v2.0.0

## swap

**Signature**

```ts
export declare function swap<E, A>(ma: RemoteData<E, A>): RemoteData<A, E>
```

Added in v2.0.0

# constructors

## failure

Constructs a new `RemoteData` holding an `Failure` value.

**Signature**

```ts
export declare const failure: <E = never, A = never>(e: E) => RemoteData<E, A>
```

Added in v2.0.0

## fromEither

Takes an `Either` and return a `Success` if `Right`, `Failure` if `Left`

**Signature**

```ts
export declare function fromEither<E, A>(ei: Either<E, A>): RemoteData<E, A>
```

Added in v2.0.0

## fromNullable

Takes a default and a nullable value, if the value is not nully, turn it into a `Success`, if the value is nully use
the provided default as a `Failure`.

**Signature**

```ts
export declare function fromNullable<E>(onNull: Lazy<E>): <A>(a: A) => RemoteData<E, NonNullable<A>>
```

Added in v2.0.0

## fromOption

Takes an `Option` and return a `Success` if `Some`, `Failure` if `None` with `onNone` function

**Signature**

```ts
export declare function fromOption<E>(onNone: Lazy<E>): <A>(ma: Option<A>) => RemoteData<E, A>
```

Added in v2.0.0

## fromPredicate

**Signature**

```ts
export declare const fromPredicate: {
  <E, A, B extends A>(refinement: Refinement<A, B>, onFalse: (a: A) => E): (a: A) => RemoteData<E, B>
  <E, A>(predicate: Predicate<A>, onFalse: (a: A) => E): (a: A) => RemoteData<E, A>
}
```

Added in v2.0.0

## loading

Get a `RemoteData` with a loading state

**Signature**

```ts
export declare const loading: RemoteData<never, never>
```

Added in v2.0.0

## success

Constructs a new `RemoteData` holding a `Success` value.

**Signature**

```ts
export declare const success: <E = never, A = never>(a: A) => RemoteData<E, A>
```

Added in v2.0.0

# destructors

## fold

**Signature**

```ts
export declare function fold<E, A, B>(
  onLoading: () => B,
  onSuccess: (a: A) => B,
  onFailure: (e: E) => B
): (ma: RemoteData<E, A>) => B
```

Added in v2.0.0

## getFailure

**Signature**

```ts
export declare function getFailure<E, A>(ma: RemoteData<E, A>): Option<E>
```

Added in v2.0.0

## getSuccess

**Signature**

```ts
export declare function getSuccess<E, A>(ma: RemoteData<E, A>): Option<A>
```

Added in v2.0.0

## toEither

**Signature**

```ts
export declare function toEither<E>(onLoading: () => E): <A>(ma: RemoteData<E, A>) => Either<E, A>
```

Added in v2.0.0

## toNullable

**Signature**

```ts
export declare function toNullable<E, A>(ma: RemoteData<E, A>): A | null
```

Added in v2.0.0

## toUndefined

**Signature**

```ts
export declare function toUndefined<E, A>(ma: RemoteData<E, A>): A | undefined
```

Added in v2.0.0

# guards

## isFailure

Returns `true` if the RemoteData is an instance of `Failure`, `false` otherwise.

**Signature**

```ts
export declare const isFailure: <E, A>(ma: RemoteData<E, A>) => ma is Failure<E>
```

**Example**

```ts
import * as RD from 'fp-ts-remote-data'

RD.isSuccess(RD.success(1)) // false
RD.isSuccess(RD.failure(1)) // true
RD.isSuccess(RD.loading) // false
```

Added in v2.0.0

## isLoading

Returns `true` if the RemoteData is an instance of `Loading`, `false` otherwise.

**Signature**

```ts
export declare const isLoading: <E, A>(ma: RemoteData<E, A>) => ma is Loading
```

**Example**

```ts
import * as RD from 'fp-ts-remote-data'

RD.isLoading(RD.success(1)) // false
RD.isLoading(RD.failure(1)) // false
RD.isLoading(RD.loading) // true
```

Added in v2.0.0

## isSuccess

Returns `true` if the RemoteData is an instance of `Success`, `false` otherwise.

**Signature**

```ts
export declare const isSuccess: <E, A>(ma: RemoteData<E, A>) => ma is Success<A>
```

**Example**

```ts
import * as RD from 'fp-ts-remote-data'

RD.isSuccess(RD.success(1)) // true
RD.isSuccess(RD.failure(1)) // false
RD.isSuccess(RD.loading) // false
```

Added in v2.0.0

# instances

## Alt

**Signature**

```ts
export declare const Alt: Alt2<'RemoteData'>
```

Added in v2.0.0

## Applicative

**Signature**

```ts
export declare const Applicative: Applicative2<'RemoteData'>
```

Added in v2.0.0

## Bifunctor

**Signature**

```ts
export declare const Bifunctor: Bifunctor2<'RemoteData'>
```

Added in v2.0.0

## Extend

**Signature**

```ts
export declare const Extend: Extend2<'RemoteData'>
```

Added in v2.0.0

## Foldable

**Signature**

```ts
export declare const Foldable: Foldable2<'RemoteData'>
```

Added in v2.0.0

## Functor

**Signature**

```ts
export declare const Functor: Functor2<'RemoteData'>
```

Added in v2.0.0

## Monad

**Signature**

```ts
export declare const Monad: Monad2<'RemoteData'>
```

Added in v2.0.0

## MonadThrow

**Signature**

```ts
export declare const MonadThrow: MonadThrow2<'RemoteData'>
```

Added in v2.0.0

## Traversable

**Signature**

```ts
export declare const Traversable: Traversable2<'RemoteData'>
```

Added in v2.0.0

## URI

**Signature**

```ts
export declare const URI: 'RemoteData'
```

Added in v2.0.0

## URI (type alias)

**Signature**

```ts
export type URI = typeof URI
```

Added in v2.0.0

## remoteData

**Signature**

```ts
export declare const remoteData: Monad2<'RemoteData'> &
  Foldable2<'RemoteData'> &
  Traversable2<'RemoteData'> &
  Bifunctor2<'RemoteData'> &
  Alt2<'RemoteData'> &
  Extend2<'RemoteData'> &
  MonadThrow2<'RemoteData'>
```

Added in v2.0.0

# model

## Failure (interface)

**Signature**

```ts
export interface Failure<E> {
  readonly _tag: 'Failure'
  readonly failure: E
}
```

Added in v2.0.0

## Loading (interface)

**Signature**

```ts
export interface Loading {
  readonly _tag: 'Loading'
}
```

Added in v2.0.0

## RemoteData (type alias)

**Signature**

```ts
export type RemoteData<E, A> = Loading | Success<A> | Failure<E>
```

Added in v2.0.0

## Success (interface)

**Signature**

```ts
export interface Success<A> {
  readonly _tag: 'Success'
  readonly success: A
}
```

Added in v2.0.0

# utils

## elem

**Signature**

```ts
export declare function elem<A>(
  E: Eq<A>
): {
  (a: A): <E>(ma: RemoteData<E, A>) => boolean
  <E>(a: A, ma: RemoteData<E, A>): boolean
}
```

Added in v2.0.0

## exists

**Signature**

```ts
export declare function exists<A>(predicate: Predicate<A>): <E>(ma: RemoteData<E, A>) => boolean
```

Added in v2.0.0
