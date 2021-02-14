import * as RD from '../src';

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
});
