import * as RD from '../src';
import * as EI from 'fp-ts/Either';
import * as O from 'fp-ts/Option';
import { pipe, identity } from 'fp-ts/function';
import { monoidString } from 'fp-ts/Monoid';

describe('RemoteData', () => {
  it('isSuccess', () => {
    expect(RD.isSuccess(RD.success(1))).toStrictEqual(true);
    expect(RD.isSuccess(RD.error(1))).toStrictEqual(false);
    expect(RD.isSuccess(RD.loading)).toStrictEqual(false);
  });

  it('isError', () => {
    expect(RD.isError(RD.success(1))).toStrictEqual(false);
    expect(RD.isError(RD.error(1))).toStrictEqual(true);
    expect(RD.isError(RD.loading)).toStrictEqual(false);
  });

  it('isLoading', () => {
    expect(RD.isLoading(RD.success(1))).toStrictEqual(false);
    expect(RD.isLoading(RD.error(1))).toStrictEqual(false);
    expect(RD.isLoading(RD.loading)).toStrictEqual(true);
  });

  it('fold', () => {
    const fold = RD.fold(
      () => 'loading',
      (s: string) => `success${s.length}`,
      (s: string) => `error${s.length}`,
    );

    expect(fold(RD.loading)).toStrictEqual('loading');
    expect(fold(RD.success('abc'))).toStrictEqual('success3');
    expect(fold(RD.error('abcd'))).toStrictEqual('error4');
  });

  it('fromEither', () => {
    expect(RD.fromEither(EI.right('success'))).toStrictEqual(RD.success('success'));
    expect(RD.fromEither(EI.left('error'))).toStrictEqual(RD.error('error'));
  });

  it('fromOption', () => {
    expect(RD.fromOption(() => 'none')(O.some(1))).toStrictEqual(RD.success(1));
    expect(RD.fromOption(() => 'none')(O.none)).toStrictEqual(RD.error('none'));
  });

  it('fromNullable', () => {
    const fromNullable = RD.fromNullable(() => 'null');

    expect(fromNullable(1)).toStrictEqual(RD.success(1));
    expect(fromNullable(null)).toStrictEqual(RD.error('null'));
    expect(fromNullable(undefined)).toStrictEqual(RD.error('null'));
  });

  it('toOption', () => {
    expect(RD.toOption(RD.success(1))).toStrictEqual(O.some(1));
    expect(RD.toOption(RD.error('error'))).toStrictEqual(O.none);
    expect(RD.toOption(RD.loading)).toStrictEqual(O.none);
  });

  it('toNullable', () => {
    expect(RD.toNullable(RD.success(1))).toStrictEqual(1);
    expect(RD.toNullable(RD.error('error'))).toStrictEqual(null);
    expect(RD.toNullable(RD.loading)).toStrictEqual(null);
  });

  it('toUndefined', () => {
    expect(RD.toUndefined(RD.success(1))).toStrictEqual(1);
    expect(RD.toUndefined(RD.error('error'))).toStrictEqual(undefined);
    expect(RD.toUndefined(RD.loading)).toStrictEqual(undefined);
  });

  it('toEither', () => {
    const toEither = RD.toEither(() => 'loading');

    expect(toEither(RD.success(1))).toStrictEqual(EI.right(1));
    expect(toEither(RD.error('error'))).toStrictEqual(EI.left('error'));
    expect(toEither(RD.loading)).toStrictEqual(EI.left('loading'));
  });

  it('filterOrElse', () => {
    const filterOrElse = RD.filterOrElse(
      (a: number) => a > 2,
      (a: number) => `${a} too small`,
    );

    expect(filterOrElse(RD.success(3))).toStrictEqual(RD.success(3));
    expect(filterOrElse(RD.success(1))).toStrictEqual(RD.error(`1 too small`));
    expect(filterOrElse(RD.error('error'))).toStrictEqual(RD.error(`error`));
    expect(filterOrElse(RD.loading)).toStrictEqual(RD.loading);
  });

  it('swap', () => {
    expect(RD.swap(RD.success(1))).toStrictEqual(RD.error(1));
    expect(RD.swap(RD.error('error'))).toStrictEqual(RD.success('error'));
    expect(RD.swap(RD.loading)).toStrictEqual(RD.loading);
  });

  it('map', () => {
    const f = (s: string) => s.length;

    expect(RD.map(f)(RD.success('abc'))).toStrictEqual(RD.success(3));
    expect(RD.map(f)(RD.error('error'))).toStrictEqual(RD.error('error'));
    expect(RD.map(f)(RD.loading)).toStrictEqual(RD.loading);
  });

  it('ap', () => {
    const f = (s: string) => s.length;

    expect(RD.ap(RD.success('abc'))(RD.success(f))).toStrictEqual(RD.success(3));
    expect(RD.ap(RD.error('error'))(RD.success(f))).toStrictEqual(RD.error('error'));
    expect(RD.ap(RD.loading)(RD.success(f))).toStrictEqual(RD.loading);

    expect(RD.ap(RD.success<string, string>('abc'))(RD.error('error'))).toStrictEqual(RD.error('error'));
    expect(RD.ap(RD.error('e'))(RD.error('error'))).toStrictEqual(RD.error('error'));
  });

  it('chain', () => {
    expect(
      pipe(
        RD.success('abc'),
        RD.chain(s => RD.success(s.length)),
      ),
    ).toStrictEqual(RD.success(3));

    expect(
      pipe(
        RD.success('abc'),
        RD.chain(() => RD.error('error')),
      ),
    ).toStrictEqual(RD.error('error'));

    expect(
      pipe(
        RD.success('abc'),
        RD.chain(() => RD.loading),
      ),
    ).toStrictEqual(RD.loading);

    expect(
      pipe(
        RD.error('error'),
        RD.chain((s: string) => RD.success(s.length)),
      ),
    ).toStrictEqual(RD.error('error'));

    expect(
      pipe(
        RD.loading,
        RD.chain((s: string) => RD.success(s.length)),
      ),
    ).toStrictEqual(RD.loading);
  });

  it('of', () => {
    expect(RD.of(1)).toStrictEqual(RD.success(1));
  });

  it('reduce', () => {
    expect(
      pipe(
        RD.success('bar'),
        RD.reduce('foo', (b, a) => b + a),
      ),
    ).toStrictEqual('foobar');

    expect(
      pipe(
        RD.error('bar'),
        RD.reduce('foo', (b, a) => b + a),
      ),
    ).toStrictEqual('foo');

    expect(
      pipe(
        RD.loading,
        RD.reduce('foo', (b, a) => b + a),
      ),
    ).toStrictEqual('foo');
  });

  it('reduceRight', () => {
    const f = (a: string, acc: string) => acc + a;

    expect(pipe(RD.success('a'), RD.reduceRight('', f))).toStrictEqual('a');
    expect(pipe(RD.error(1), RD.reduceRight('', f))).toStrictEqual('');
    expect(pipe(RD.loading, RD.reduceRight('', f))).toStrictEqual('');
  });

  it('traverse', () => {
    const traverse = RD.traverse(O.Applicative)((n: number) => (n >= 2 ? O.some(n) : O.none));

    expect(pipe(RD.error('a'), traverse)).toStrictEqual(O.some(RD.error('a')));
    expect(pipe(RD.success(1), traverse)).toStrictEqual(O.none);
    expect(pipe(RD.success(3), traverse)).toStrictEqual(O.some(RD.success(3)));
    expect(pipe(RD.loading, traverse)).toStrictEqual(O.some(RD.loading));
  });

  it('sequence', () => {
    const sequence = RD.sequence(O.Applicative);

    expect(sequence(RD.success(O.some(1)))).toStrictEqual(O.some(RD.success(1)));
    expect(sequence(RD.error('a'))).toStrictEqual(O.some(RD.error('a')));
    expect(sequence(RD.success(O.none))).toStrictEqual(O.none);
    expect(sequence(RD.loading)).toStrictEqual(O.some(RD.loading));
  });

  it('foldMap', () => {
    expect(pipe(RD.success('a'), RD.foldMap(monoidString)(identity))).toStrictEqual('a');
    expect(pipe(RD.error(1), RD.foldMap(monoidString)(identity))).toStrictEqual('');
    expect(pipe(RD.loading, RD.foldMap(monoidString)(identity))).toStrictEqual('');
  });

  it('bimap', () => {
    const f = (s: string): number => s.length;
    const g = (n: number): boolean => n > 2;

    expect(pipe(RD.success(1), RD.bimap(f, g))).toStrictEqual(RD.success(false));
    expect(pipe(RD.error('error'), RD.bimap(f, g))).toStrictEqual(RD.error(5));
    expect(pipe(RD.loading, RD.bimap(f, g))).toStrictEqual(RD.loading);
  });

  it('mapLeft', () => {
    const f = (s: string): number => s.length;

    expect(pipe(RD.success(1), RD.mapLeft(f))).toStrictEqual(RD.success(1));
    expect(pipe(RD.error('error'), RD.mapLeft(f))).toStrictEqual(RD.error(5));
    expect(pipe(RD.loading, RD.mapLeft(f))).toStrictEqual(RD.loading);
  });

  it('alt', () => {
    const f = () => RD.success<string, number>(10);
    const f2 = () => RD.error<string, number>('error2');

    expect(pipe(RD.success(1), RD.alt(f))).toStrictEqual(RD.success(1));

    expect(pipe(RD.error('error'), RD.alt(f))).toStrictEqual(RD.success(10));
    expect(pipe(RD.error('error'), RD.alt(f2))).toStrictEqual(RD.error('error2'));

    expect(pipe(RD.loading, RD.alt(f))).toStrictEqual(RD.loading);
  });

  it('extend', () => {
    expect(
      pipe(
        RD.success(1),
        RD.extend(() => 2),
      ),
    ).toStrictEqual(RD.success(2));

    expect(
      pipe(
        RD.error('error'),
        RD.extend(() => 2),
      ),
    ).toStrictEqual(RD.error('error'));

    expect(
      pipe(
        RD.loading,
        RD.extend(() => 2),
      ),
    ).toStrictEqual(RD.loading);
  });
});
