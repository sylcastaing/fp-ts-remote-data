import * as RD from '../src';
import * as EI from 'fp-ts/Either';
import * as O from 'fp-ts/Option';
import { pipe, identity } from 'fp-ts/function';
import { monoidString } from 'fp-ts/Monoid';

describe('RemoteData', () => {
  describe('guards', () => {
    it('isSuccess', () => {
      expect(RD.isSuccess(RD.success(1))).toStrictEqual(true);
      expect(RD.isSuccess(RD.failure(1))).toStrictEqual(false);
      expect(RD.isSuccess(RD.loading)).toStrictEqual(false);
    });

    it('isFailure', () => {
      expect(RD.isFailure(RD.success(1))).toStrictEqual(false);
      expect(RD.isFailure(RD.failure(1))).toStrictEqual(true);
      expect(RD.isFailure(RD.loading)).toStrictEqual(false);
    });

    it('isLoading', () => {
      expect(RD.isLoading(RD.success(1))).toStrictEqual(false);
      expect(RD.isLoading(RD.failure(1))).toStrictEqual(false);
      expect(RD.isLoading(RD.loading)).toStrictEqual(true);
    });
  });

  describe('constructors', () => {
    it('fromNullable', () => {
      const fromNullable = RD.fromNullable(() => 'null');

      expect(fromNullable(1)).toStrictEqual(RD.success(1));
      expect(fromNullable(null)).toStrictEqual(RD.failure('null'));
      expect(fromNullable(undefined)).toStrictEqual(RD.failure('null'));
    });

    it('fromEither', () => {
      expect(RD.fromEither(EI.right('success'))).toStrictEqual(RD.success('success'));
      expect(RD.fromEither(EI.left('error'))).toStrictEqual(RD.failure('error'));
    });

    it('fromOption', () => {
      expect(RD.fromOption(() => 'none')(O.some(1))).toStrictEqual(RD.success(1));
      expect(RD.fromOption(() => 'none')(O.none)).toStrictEqual(RD.failure('none'));
    });
  });

  describe('destructors', () => {
    it('fold', () => {
      const fold = RD.fold(
        () => 'loading',
        (s: string) => `success${s.length}`,
        (s: string) => `error${s.length}`,
      );

      expect(fold(RD.loading)).toStrictEqual('loading');
      expect(fold(RD.success('abc'))).toStrictEqual('success3');
      expect(fold(RD.failure('abcd'))).toStrictEqual('error4');
    });

    it('toNullable', () => {
      expect(RD.toNullable(RD.success(1))).toStrictEqual(1);
      expect(RD.toNullable(RD.failure('error'))).toStrictEqual(null);
      expect(RD.toNullable(RD.loading)).toStrictEqual(null);
    });

    it('toUndefined', () => {
      expect(RD.toUndefined(RD.success(1))).toStrictEqual(1);
      expect(RD.toUndefined(RD.failure('error'))).toStrictEqual(undefined);
      expect(RD.toUndefined(RD.loading)).toStrictEqual(undefined);
    });

    it('toEither', () => {
      const toEither = RD.toEither(() => 'loading');

      expect(toEither(RD.success(1))).toStrictEqual(EI.right(1));
      expect(toEither(RD.failure('error'))).toStrictEqual(EI.left('error'));
      expect(toEither(RD.loading)).toStrictEqual(EI.left('loading'));
    });

    it('getSuccess', () => {
      expect(RD.getSuccess(RD.success(1))).toStrictEqual(O.some(1));
      expect(RD.getSuccess(RD.failure('error'))).toStrictEqual(O.none);
      expect(RD.getSuccess(RD.loading)).toStrictEqual(O.none);
    });

    it('getFailure ', () => {
      expect(RD.getFailure(RD.success(1))).toStrictEqual(O.none);
      expect(RD.getFailure(RD.failure('error'))).toStrictEqual(O.some('error'));
      expect(RD.getFailure(RD.loading)).toStrictEqual(O.none);
    });
  });

  describe('combinators', () => {
    it('swap', () => {
      expect(RD.swap(RD.success(1))).toStrictEqual(RD.failure(1));
      expect(RD.swap(RD.failure('error'))).toStrictEqual(RD.success('error'));
      expect(RD.swap(RD.loading)).toStrictEqual(RD.loading);
    });

    it('filterOrElse', () => {
      const filterOrElse = RD.filterOrElse(
        (a: number) => a > 2,
        (a: number) => `${a} too small`,
      );

      expect(filterOrElse(RD.success(3))).toStrictEqual(RD.success(3));
      expect(filterOrElse(RD.success(1))).toStrictEqual(RD.failure(`1 too small`));
      expect(filterOrElse(RD.failure('error'))).toStrictEqual(RD.failure(`error`));
      expect(filterOrElse(RD.loading)).toStrictEqual(RD.loading);
    });
  });

  describe('pipeables', () => {
    it('map', () => {
      const f = (s: string) => s.length;

      expect(RD.map(f)(RD.success('abc'))).toStrictEqual(RD.success(3));
      expect(RD.map(f)(RD.failure('error'))).toStrictEqual(RD.failure('error'));
      expect(RD.map(f)(RD.loading)).toStrictEqual(RD.loading);
    });

    it('bimap', () => {
      const f = (s: string): number => s.length;
      const g = (n: number): boolean => n > 2;

      expect(pipe(RD.success(1), RD.bimap(f, g))).toStrictEqual(RD.success(false));
      expect(pipe(RD.failure('error'), RD.bimap(f, g))).toStrictEqual(RD.failure(5));
      expect(pipe(RD.loading, RD.bimap(f, g))).toStrictEqual(RD.loading);
    });

    it('mapLeft', () => {
      const f = (s: string): number => s.length;

      expect(pipe(RD.success(1), RD.mapLeft(f))).toStrictEqual(RD.success(1));
      expect(pipe(RD.failure('error'), RD.mapLeft(f))).toStrictEqual(RD.failure(5));
      expect(pipe(RD.loading, RD.mapLeft(f))).toStrictEqual(RD.loading);
    });

    it('ap', () => {
      const f = (s: string) => s.length;

      expect(RD.ap(RD.success('abc'))(RD.success(f))).toStrictEqual(RD.success(3));
      expect(RD.ap(RD.failure('error'))(RD.success(f))).toStrictEqual(RD.failure('error'));
      expect(RD.ap(RD.loading)(RD.success(f))).toStrictEqual(RD.loading);

      expect(RD.ap(RD.success<string, string>('abc'))(RD.failure('error'))).toStrictEqual(RD.failure('error'));
      expect(RD.ap(RD.failure('e'))(RD.failure('error'))).toStrictEqual(RD.failure('error'));
    });

    it('of', () => {
      expect(RD.of(1)).toStrictEqual(RD.success(1));
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
          RD.chain(() => RD.failure('error')),
        ),
      ).toStrictEqual(RD.failure('error'));

      expect(
        pipe(
          RD.success('abc'),
          RD.chain(() => RD.loading),
        ),
      ).toStrictEqual(RD.loading);

      expect(
        pipe(
          RD.failure('error'),
          RD.chain((s: string) => RD.success(s.length)),
        ),
      ).toStrictEqual(RD.failure('error'));

      expect(
        pipe(
          RD.loading,
          RD.chain((s: string) => RD.success(s.length)),
        ),
      ).toStrictEqual(RD.loading);
    });

    it('alt', () => {
      const f = () => RD.success<string, number>(10);
      const f2 = () => RD.failure<string, number>('error2');

      expect(pipe(RD.success(1), RD.alt(f))).toStrictEqual(RD.success(1));

      expect(pipe(RD.failure('error'), RD.alt(f))).toStrictEqual(RD.success(10));
      expect(pipe(RD.failure('error'), RD.alt(f2))).toStrictEqual(RD.failure('error2'));

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
          RD.failure('error'),
          RD.extend(() => 2),
        ),
      ).toStrictEqual(RD.failure('error'));

      expect(
        pipe(
          RD.loading,
          RD.extend(() => 2),
        ),
      ).toStrictEqual(RD.loading);
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
          RD.failure('bar'),
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

    it('foldMap', () => {
      expect(pipe(RD.success('a'), RD.foldMap(monoidString)(identity))).toStrictEqual('a');
      expect(pipe(RD.failure(1), RD.foldMap(monoidString)(identity))).toStrictEqual('');
      expect(pipe(RD.loading, RD.foldMap(monoidString)(identity))).toStrictEqual('');
    });

    it('reduceRight', () => {
      const f = (a: string, acc: string) => acc + a;

      expect(pipe(RD.success('a'), RD.reduceRight('', f))).toStrictEqual('a');
      expect(pipe(RD.failure(1), RD.reduceRight('', f))).toStrictEqual('');
      expect(pipe(RD.loading, RD.reduceRight('', f))).toStrictEqual('');
    });

    it('traverse', () => {
      const traverse = RD.traverse(O.Applicative)((n: number) => (n >= 2 ? O.some(n) : O.none));

      expect(pipe(RD.failure('a'), traverse)).toStrictEqual(O.some(RD.failure('a')));
      expect(pipe(RD.success(1), traverse)).toStrictEqual(O.none);
      expect(pipe(RD.success(3), traverse)).toStrictEqual(O.some(RD.success(3)));
      expect(pipe(RD.loading, traverse)).toStrictEqual(O.some(RD.loading));
    });

    it('sequence', () => {
      const sequence = RD.sequence(O.Applicative);

      expect(sequence(RD.success(O.some(1)))).toStrictEqual(O.some(RD.success(1)));
      expect(sequence(RD.failure('a'))).toStrictEqual(O.some(RD.failure('a')));
      expect(sequence(RD.success(O.none))).toStrictEqual(O.none);
      expect(sequence(RD.loading)).toStrictEqual(O.some(RD.loading));
    });
  });
});
